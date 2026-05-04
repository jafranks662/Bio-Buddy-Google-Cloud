import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { QuizQuestion } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

export async function loadPracticeQuestions(standardId: string): Promise<QuizQuestion[]> {
  // 1. Try to load from Local Markdown File first (Easiest for teachers to maintain)
  try {
      const response = await fetch(`/questions/standard_${standardId}.md`);
      if (response.ok) {
          const text = await response.text();
          const parsed = parseMarkdownQuestions(text);
          if (parsed.length > 0) return parsed;
      }
  } catch (e) {
      console.log(`No local markdown file found for ${standardId}, checking Firebase...`);
  }

  // 2. Fallback to Firebase
  const collectionPath = 'practice_questions';
  try {
    let q = query(
        collection(db, collectionPath),
        where('standardId', '==', standardId),
        orderBy('order', 'asc')
    );
    
    let querySnapshot = await getDocs(q).catch(() => {
        // Fallback if index isn't ready
        return getDocs(query(collection(db, collectionPath), where('standardId', '==', standardId)));
    });

    const questions: QuizQuestion[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        questions.push({
            question: data.question,
            options: data.options,
            correctAnswer: data.correctAnswer,
            explanation: data.explanation
        } as QuizQuestion);
    });
    return questions;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionPath);
    return [];
  }
}

function parseMarkdownQuestions(text: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  // Split by Question heading
  const sections = text.split(/#+ Question/i);
  
  for (const section of sections) {
    if (!section.trim() || section.length < 10) continue;
    
    const lines = section.trim().split('\n');
    let questionText = '';
    const options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    let parsingOptions = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Matches "A) text" or "A. text"
        const optionMatch = line.match(/^([A-D])[\)\.]\s*(.*)/i);
        
        if (optionMatch) {
            options.push(optionMatch[2]);
            parsingOptions = true;
        } else if (line.toLowerCase().startsWith('correct:')) {
            correctAnswer = line.split(':')[1].trim().toUpperCase();
            parsingOptions = false;
        } else if (line.toLowerCase().startsWith('explanation:')) {
            // Take the rest of the section as explanation
            explanation = lines.slice(i).join(' ').replace(/explanation:/i, '').trim();
            break;
        } else if (!parsingOptions) {
            questionText += (questionText ? ' ' : '') + line;
        }
    }

    // Validation: Require question, at least 2 options, and an answer
    if (questionText && options.length >= 2 && correctAnswer) {
        questions.push({
            question: questionText,
            options: options.slice(0, 4), // Ensure max 4
            correctAnswer,
            explanation: explanation || "No explanation provided."
        });
    }
  }
  
  return questions;
}

