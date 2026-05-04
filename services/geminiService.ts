
import { GoogleGenAI, Type } from "@google/genai";
import { Standard, QuizQuestion } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-3-flash-preview';

const baseSystemInstruction = `You are "Bio Buddy", an expert AI tutor designed to help 9th-grade students prepare for their state biology test. Your tone is encouraging, friendly, and relatable. 
You must create scenarios and examples that resonate with the student's chosen theme (e.g., Anime, Gaming, SpongeBob, "67" Meme, Invincible, Social Media). If the user hasn't explicitly chosen a theme or you are unsure, default to using examples related to life in rural Mississippi (e.g., farming, fishing, local ecosystems, Southern culture). Pay close attention to any theme the user mentions in the conversation history and adopt that theme completely for your explanations and examples.

When including chemical formulas (like photosynthesis or cellular respiration) or any mathematical equations, you MUST use LaTeX syntax. 
For inline formulas, use single dollar signs with NO spaces between the sign and the text, like this: $H_2O$. 
For important formulas or display equations, use double dollar signs on a new line, like this:
$$6CO_2 + 6H_2O + \text{Light} \rightarrow C_6H_{12}O_6 + 6O_2$$
Always prefer LaTeX for anything with subscripts or superscripts.`;

export interface StudyResponseData {
  text: string;
  topics: {
    title: string;
    completed: boolean;
  }[];
}

export async function getStudyResponse(
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  standard: Standard
): Promise<StudyResponseData> {
  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: history,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "Your response to the student." },
                    topics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "The name of a small section or sub-topic of this standard." },
                                completed: { type: Type.BOOLEAN, description: "True if you have already taught and reviewed this topic with the student in the current conversation." }
                            },
                            required: ["title", "completed"]
                        },
                        description: "A detailed list of 4 to 8 very specific micro-skills or knowledge points required to master this standard, ordered logically. Break the standard down into small enough chunks to match what would be tested on single practice questions. Keep this exact list of topics consistent across the conversation."
                    }
                },
                required: ["text", "topics"]
            },
            systemInstruction: `${baseSystemInstruction} You are in STUDY MODE. Your goal is to help the student master the topic of "${standard.title}". 
Analyze the core information for this standard and deduce the specific skills and knowledge points needed to answer practice questions about it.
Break the standard down into a logically ordered sequence of precise micro-skills.
Teach ONLY ONE specific micro-skill or concept at a time.
Do not move to the next skill until the student demonstrates understanding of the current one via a review question.
Do NOT give direct answers to questions. Instead, ask guiding questions, provide analogies related to their chosen theme, and explain concepts in simple terms to help them arrive at the answer themselves.
Use this core information for the standard: ${standard.content}`,
        }
    });

    const jsonText = response.text?.trim() || "";
    let data: StudyResponseData;
    try {
        data = JSON.parse(jsonText);
    } catch(err) {
        return { text: "I'm sorry, I couldn't generate a response. Let's try again.", topics: [] };
    }
    return data;
  } catch (error) {
    console.error("Error fetching study response:", error);
    return { text: "I'm having a little trouble connecting to the Bio Buddy brain right now. Please try again in a moment.", topics: [] };
  }
}

export async function generateQuizQuestion(
    standard: Standard,
    history?: { role: 'user' | 'model', parts: { text: string }[] }[]
): Promise<QuizQuestion | null> {
    try {
        const promptText = `The student is studying the standard: "${standard.title}: ${standard.description}".
Core information about this standard: ${standard.content}

Generate one high-quality multiple-choice quiz question with exactly 4 options. 
The question must be relevant to the core information provided.
Frame it with a scenario relevant to the student's chosen theme based on our conversation history.
The difficulty should be appropriate for a 9th-grade biology student.`;

        const contents = history && history.length > 0 
            ? [...history, { role: 'user' as const, parts: [{ text: promptText }] }]
            : [{ role: 'user' as const, parts: [{ text: promptText }] }];

        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of exactly 4 strings for multiple choice options. These must start with letters A), B), C), and D)."
                        },
                        correctAnswer: { 
                            type: Type.STRING,
                            description: "The correct answer string, exactly matching one of the options."
                        },
                        explanation: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctAnswer", "explanation"]
                },
                systemInstruction: baseSystemInstruction
            }
        });

        const jsonText = response.text.trim();
        console.log("Generated Quiz Question:", jsonText);
        const question = JSON.parse(jsonText) as QuizQuestion;
        
        if (!question.options || question.options.length === 0) {
            console.error("No options generated for quiz question");
            return null;
        }
        
        return question;
    } catch(error) {
        console.error("Error generating quiz question:", error);
        return null;
    }
}

export async function evaluateAnswer(question: QuizQuestion, studentAnswer: string): Promise<{ isCorrect: boolean; feedback: string }> {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `The quiz question was: "${question.question}". The correct answer is "${question.correctAnswer}". The student answered: "${studentAnswer}". Evaluate if the student's answer is correct. Be lenient with minor spelling/phrasing differences for short answers. Provide encouraging feedback.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isCorrect: { type: Type.BOOLEAN },
                        feedback: { type: Type.STRING }
                    },
                    required: ["isCorrect", "feedback"]
                },
                systemInstruction: baseSystemInstruction
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch(error) {
        console.error("Error evaluating answer:", error);
        return { isCorrect: false, feedback: "Sorry, I had trouble checking your answer. Let's move to the next question." };
    }
}