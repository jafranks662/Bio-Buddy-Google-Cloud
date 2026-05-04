import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { AppMode, Standard, ChatMessage, QuizQuestion } from '../types';
import { getStudyResponse, generateQuizQuestion, evaluateAnswer } from '../services/geminiService';
import { SendIcon, UserIcon, AiIcon } from './icons';
import { formatText } from '../utils';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../services/firestoreErrorHandler';

interface ChatInterfaceProps {
  mode: AppMode;
  standard: Standard;
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode, standard, history, setHistory }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<{title: string; completed: boolean}[]>([]);
  const [quizState, setQuizState] = useState<{
    question: QuizQuestion | null;
    score: number;
    total: number;
    isAnswered: boolean;
  }>({ question: null, score: 0, total: 0, isAnswered: false });

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Add a slight delay to ensure the DOM has updated
    const timeout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeout);
  }, [history]);

  useEffect(() => {
    setQuizState({ question: null, score: 0, total: 0, isAnswered: false });
    setTopics([]);
  }, [standard.id]);

  const hasLoadedHistory = useRef<string | null>(null);

  useEffect(() => {
    const loadChatHistory = async () => {
      // Don't reload if we already loaded for this standard+mode combination
      const loadKey = `${standard.id}-${mode}`;
      if (!auth.currentUser || mode !== AppMode.Study || hasLoadedHistory.current === loadKey) return;

      try {
        const q = query(
          collection(db, 'chats'),
          where('userId', '==', auth.currentUser.uid),
          where('standardId', '==', standard.id),
          orderBy('timestamp', 'desc'),
          limit(30)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const persistedHistory = snapshot.docs.map(doc => ({
            role: doc.data().role as 'user' | 'ai' | 'system',
            content: doc.data().content
          })).reverse();
          
          setHistory(prev => {
            // If the user already started a session, we don't want to lose it
            // but we want to show the history before the current session's "welcome"
            if (prev.length <= 1) {
              return persistedHistory;
            }
            return prev; // Or we could merge, but usually if they started fresh they want fresh
          });
          hasLoadedHistory.current = loadKey;
        }
      } catch (error) {
        console.warn("Failed to load chat history:", error);
      }
    };

    if (mode === AppMode.Study) {
      loadChatHistory();
    }
  }, [standard.id, mode, setHistory]);

  // Reset the load tracker when standard changes
  useEffect(() => {
    hasLoadedHistory.current = null;
  }, [standard.id]);

  const handleNewQuizQuestion = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      setHistory(prev => [...prev, { role: 'system', content: 'Generating a new question...' }]);
      
      const geminiHistory = history
          .filter(m => m.role === 'user' || m.role === 'ai')
          .slice(-10) // Limit to last 10 messages for context
          .map(m => ({
            role: m.role === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: m.content }]
          }));

      const newQuestion = await generateQuizQuestion(standard, geminiHistory);
      if (newQuestion) {
        setQuizState(prev => ({ ...prev, question: newQuestion, isAnswered: false }));
        setHistory(prev => [...prev.slice(0, -1), { role: 'ai', content: newQuestion.question }]);
      } else {
        setHistory(prev => [...prev.slice(0, -1), { role: 'system', content: 'Could not generate a question. Please try again.' }]);
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      setHistory(prev => [...prev.slice(0, -1), { role: 'system', content: 'Something went wrong while generating the question.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [standard, isLoading, history]);

  useEffect(() => {
    if (mode === AppMode.Quiz && !quizState.question) {
      handleNewQuizQuestion();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, handleNewQuizQuestion]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    setHistory(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      if (mode === AppMode.Study) {
        // Save User Message
        if (auth.currentUser) {
          addDoc(collection(db, 'chats'), {
            userId: auth.currentUser.uid,
            standardId: standard.id,
            role: 'user',
            content: currentInput,
            timestamp: serverTimestamp()
          }).catch(err => console.warn("Failed to persist user message:", err));
        }

        const geminiHistory = history
          .filter(m => m.role === 'user' || m.role === 'ai')
          .slice(-10) // Limit to last 10 messages to keep context focused and prevent service errors
          .map(m => ({
            role: m.role === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: m.content }]
          }));
        geminiHistory.push({ role: 'user', parts: [{ text: currentInput }] });

        const responseData = await getStudyResponse(geminiHistory, standard);
        const aiResponse = responseData.text;
        
        if (responseData.topics && responseData.topics.length > 0) {
            setTopics(responseData.topics);
        }

        setHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);

        // Save AI Message
        if (auth.currentUser) {
          addDoc(collection(db, 'chats'), {
            userId: auth.currentUser.uid,
            standardId: standard.id,
            role: 'ai',
            content: aiResponse,
            timestamp: serverTimestamp()
          }).catch(err => console.warn("Failed to persist AI message:", err));
        }
      } else if (mode === AppMode.Quiz && quizState.question && !quizState.isAnswered) {
        await handleOptionSelect(currentInput);
      }
    } catch (error) {
      console.error("Submit error:", error);
      setHistory(prev => [...prev, { role: 'ai', content: "I'm sorry, I ran into an error processing that. Could you try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (option: string) => {
    if (isLoading || quizState.isAnswered || !quizState.question) return;

    setIsLoading(true);
    try {
      setHistory(prev => [...prev, { role: 'user', content: option }]);

      const result = await evaluateAnswer(quizState.question, option);
      const newScore = result.isCorrect ? quizState.score + 1 : quizState.score;

      // Save result to Firestore if user is logged in
      if (auth.currentUser) {
        try {
          await addDoc(collection(db, 'quiz_results'), {
            userId: auth.currentUser.uid,
            standardId: standard.id,
            score: result.isCorrect ? 1 : 0,
            totalQuestions: 1,
            timestamp: serverTimestamp(),
            question: quizState.question.question,
            isCorrect: result.isCorrect
          });
        } catch (error) {
          console.warn("Failed to save quiz result:", error);
        }
      }

      setQuizState(prev => ({
        ...prev,
        score: newScore,
        total: prev.total + 1,
        isAnswered: true,
      }));

      setHistory(prev => [
        ...prev,
        { 
          role: 'ai', 
          content: `${result.isCorrect ? "Correct! 🌟" : "Not quite. 💡"}\n\n${result.feedback}\n\n**The correct answer was:** ${quizState.question?.correctAnswer}\n\n**Explanation:** ${quizState.question?.explanation}` 
        }
      ]);
    } catch (error) {
      console.error("Option select error:", error);
      setHistory(prev => [...prev, { role: 'ai', content: "Sorry, I had trouble checking that answer. Let's move on." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextQuestion = () => {
      setQuizState(prev => ({ ...prev, question: null, isAnswered: false }));
      handleNewQuizQuestion();
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
        {mode === AppMode.Study && topics.length > 0 && (
            <div className="bg-gray-800 p-2 sm:p-3 text-xs sm:text-sm border-b border-gray-700/50 flex-shrink-0 flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2 w-full">
                    <span className="font-semibold text-gray-200 whitespace-nowrap hidden sm:inline">Topic Progress:</span>
                    <span className="font-semibold text-gray-200 whitespace-nowrap sm:hidden">Progress:</span>
                    <div className="flex-1 flex gap-1 h-1.5 sm:h-2">
                        {topics.map((t, idx) => (
                            <div 
                                key={idx} 
                                className={`h-full flex-1 rounded ${t.completed ? 'bg-teal-500' : 'bg-gray-600'}`} 
                                title={t.title}
                            />
                        ))}
                    </div>
                    <span className="text-gray-400 whitespace-nowrap text-[10px] sm:text-xs">
                        {topics.filter(t => t.completed).length}/{topics.length}
                    </span>
                </div>
                <div className="flex items-center gap-2 w-full overflow-hidden text-gray-300">
                    <span className="text-gray-400 whitespace-nowrap flex-shrink-0 hidden sm:inline">Current Topic:</span>
                    <span className="text-gray-400 whitespace-nowrap flex-shrink-0 sm:hidden">Current:</span>
                    <div className="truncate markdown-container no-margins flex-1 text-gray-200 font-medium">
                        <ReactMarkdown 
                            remarkPlugins={[remarkMath, remarkGfm]} 
                            rehypePlugins={[rehypeKatex]}
                            components={{ p: React.Fragment }}
                        >
                            {topics.find(t => !t.completed)?.title || "All Topics Completed!"}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        )}
        {mode === AppMode.Quiz && (
            <div className="bg-indigo-800/50 p-3 text-center border-b border-indigo-700/50 flex-shrink-0">
                <p className="font-bold text-lg">Quiz Score: {quizState.score} / {quizState.total}</p>
            </div>
        )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'ai' && <AiIcon className="w-8 h-8 flex-shrink-0 text-teal-400 mt-1" />}
            {msg.role === 'system' && <div className="w-full text-center text-sm text-gray-400 italic py-2">{msg.content}</div>}
            {msg.role !== 'system' && (
              <div
                className={`max-w-xl p-3 rounded-xl shadow ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <div className="text-white markdown-container">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath, remarkGfm]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
             {msg.role === 'user' && <UserIcon className="w-8 h-8 flex-shrink-0 text-indigo-400 mt-1" />}
          </div>
        ))}
         
         {mode === AppMode.Quiz && quizState.question && !quizState.isAnswered && !isLoading && (
            <div className="ml-11 max-w-xl flex flex-col gap-2 mt-2">
                {quizState.question.options?.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        className="p-3 bg-gray-700 hover:bg-indigo-600 border border-gray-600 rounded-lg text-left transition-all duration-200 shadow-sm active:scale-95 text-sm"
                    >
                        <span className="text-white markdown-container no-margins inline-block">
                            <ReactMarkdown 
                                remarkPlugins={[remarkMath, remarkGfm]} 
                                rehypePlugins={[rehypeKatex]}
                                components={{ p: 'span' }}
                            >
                                {option}
                            </ReactMarkdown>
                        </span>
                    </button>
                ))}
            </div>
        )}

         {isLoading && (
            <div className="flex items-start gap-3 mt-4">
                <AiIcon className="w-8 h-8 flex-shrink-0 text-teal-400 mt-1" />
                <div className="max-w-xl p-3 rounded-xl shadow bg-gray-700">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        {/* Removed chatEndRef div in favor of scrollRef.scrollTop */}
      </div>

       {mode === AppMode.Quiz && quizState.isAnswered && (
            <div className="p-4 flex justify-center">
                <button 
                    onClick={handleNextQuestion}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    Next Question
                </button>
            </div>
        )}
      
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800/80 border-t border-gray-700 flex items-center gap-3 flex-shrink-0">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={
              isLoading ? "Thinking..." : 
              (mode === AppMode.Quiz && quizState.question && !quizState.isAnswered) ? "Type your answer..." :
              mode === AppMode.Quiz ? "Waiting for next question..." : "Ask me anything..."
          }
          disabled={isLoading || (mode === AppMode.Quiz && quizState.isAnswered)}
          className="flex-1 p-3 bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-100 disabled:opacity-50 text-base" /* text-base prevents auto-zoom on iOS */
        />
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="p-3 bg-teal-600 rounded-full hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon className="w-6 h-6 text-white" />
        </button>
      </form>
    </div>
  );
};
