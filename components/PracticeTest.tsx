import React, { useState, useEffect, useCallback } from 'react';
import { Standard, QuizQuestion } from '../types';
import { loadPracticeQuestions } from '../services/practiceService';
import { GraduationCapIcon, BrainIcon } from './icons';
import { motion, AnimatePresence } from 'motion/react';

interface PracticeTestProps {
  standards: Standard[];
}

export const PracticeTest: React.FC<PracticeTestProps> = ({ standards }) => {
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const startPractice = async (id: string) => {
    setLoading(true);
    setSelectedStandardId(id);
    const loadedQuestions = await loadPracticeQuestions(id);
    setQuestions(loadedQuestions);
    setLoading(false);
    setCurrentIndex(0);
    setScore(0);
    setCompleted(false);
    setUserAnswer(null);
    setShowFeedback(false);
  };

  const handleOptionSelect = (optionLabel: string) => {
    if (showFeedback) return;
    setUserAnswer(optionLabel);
    setShowFeedback(true);
    
    // Check if correct (optionLabel is A, B, C, or D)
    const currentQuestion = questions[currentIndex];
    if (optionLabel === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer(null);
      setShowFeedback(false);
    } else {
      setCompleted(true);
    }
  };

  const reset = () => {
    setSelectedStandardId(null);
    setQuestions([]);
    setCompleted(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-xl text-gray-400">Loading State Test questions...</p>
      </div>
    );
  }

  if (!selectedStandardId) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <GraduationCapIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Biology State Test Practice</h2>
            <p className="text-gray-400">Select a standard to begin practicing with official-style questions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standards.map(standard => (
              <button
                key={standard.id}
                onClick={() => startPractice(standard.id)}
                className="p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl text-left transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-900/50 text-amber-400 mb-2">
                       Standard {standard.id}
                    </span>
                    <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                      {standard.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                      {standard.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-800">
        <div className="bg-gray-700 p-8 rounded-2xl border border-gray-600 max-w-md">
            <h3 className="text-2xl font-bold text-white mb-4">No Questions Found</h3>
            <p className="text-gray-400 mb-6">
                Questions for Standard {selectedStandardId} haven't been uploaded yet. 
                Ask your teacher to add the .md files to the project.
            </p>
            <button onClick={reset} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold text-white transition-colors">
                Back to Selection
            </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-800">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-700 p-8 rounded-2xl border border-gray-600 max-w-md w-full"
        >
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🎓
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Practice Complete!</h3>
            <p className="text-gray-400 mb-8">Standard {selectedStandardId}: {standards.find(s => s.id === selectedStandardId)?.title}</p>
            
            <div className="bg-gray-800 rounded-xl p-6 mb-8 text-center">
                <span className="block text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Your Score</span>
                <span className="text-5xl font-black text-amber-400">{score} <small className="text-2xl text-gray-600">/ {questions.length}</small></span>
                <p className="mt-4 text-emerald-400 font-bold">
                    {Math.round((score / questions.length) * 100)}% Accurate
                </p>
            </div>
            
            <div className="flex space-x-3">
                <button 
                    onClick={() => startPractice(selectedStandardId)} 
                    className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold text-white transition-colors border border-gray-500"
                >
                    Retry Standard
                </button>
                <button 
                    onClick={reset} 
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold text-white transition-colors"
                >
                    Other Standards
                </button>
            </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex-1 flex flex-col bg-gray-800 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
            <button onClick={reset} className="text-gray-500 hover:text-white transition-colors flex items-center space-x-1">
                <span>← Back to Selection</span>
            </button>
            <div className="text-right">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Progress</span>
                <span className="text-white font-bold">{currentIndex + 1} of {questions.length}</span>
            </div>
        </div>

        <div className="w-full bg-gray-700 h-2 rounded-full mb-8 overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
               className="bg-amber-500 h-full"
            />
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={currentIndex}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-gray-700/50 p-6 md:p-10 rounded-2xl border border-gray-600 shadow-xl"
            >
                <h4 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                    {currentQuestion.question}
                </h4>

                <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((label, idx) => {
                        const optionText = currentQuestion.options?.[idx];
                        if (!optionText) return null;

                        const isSelected = userAnswer === label;
                        const isCorrect = label === currentQuestion.correctAnswer;
                        
                        let buttonClass = "w-full p-4 rounded-xl text-left transition-all border-2 flex items-center space-x-4 ";
                        if (showFeedback) {
                            if (isCorrect) buttonClass += "bg-emerald-900/30 border-emerald-500 text-emerald-100";
                            else if (isSelected) buttonClass += "bg-red-900/30 border-red-500 text-red-100";
                            else buttonClass += "bg-gray-800/50 border-transparent text-gray-500";
                        } else {
                            buttonClass += "bg-gray-800/50 border-transparent hover:border-gray-500 text-gray-100 hover:bg-gray-800";
                        }

                        return (
                            <button
                                key={label}
                                onClick={() => handleOptionSelect(label)}
                                disabled={showFeedback}
                                className={buttonClass}
                            >
                                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                    showFeedback && isCorrect ? 'bg-emerald-500 text-white' : 
                                    showFeedback && isSelected ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
                                }`}>
                                    {label}
                                </span>
                                <span className="flex-1">{optionText}</span>
                            </button>
                        );
                    })}
                </div>

                {showFeedback && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-8 pt-8 border-t border-gray-600"
                    >
                        <div className={`p-4 rounded-xl mb-6 flex items-start space-x-3 ${
                            userAnswer === currentQuestion.correctAnswer ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'
                        }`}>
                            <div className="text-xl mt-0.5">
                                {userAnswer === currentQuestion.correctAnswer ? '✨' : '❌'}
                            </div>
                            <div>
                                <p className="font-bold">
                                    {userAnswer === currentQuestion.correctAnswer ? 'Correct!' : `Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`}
                                </p>
                                <p className="text-sm mt-1 opacity-90">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={nextQuestion}
                            className="w-full py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white transition-all transform active:scale-95 flex items-center justify-center space-x-2"
                        >
                            <span>{currentIndex === questions.length - 1 ? 'Finish Practice' : 'Continue to Next Question'}</span>
                            <span className="text-xl">→</span>
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>

        <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
                Mississippi College and Career Ready Standards for Science - Biology Focus
            </p>
        </div>
      </div>
    </div>
  );
};
