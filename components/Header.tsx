
import React, { useEffect, useState } from 'react';
import { AppMode } from '../types';
import { BrainIcon, ClipboardCheckIcon, LogInIcon, LogOutIcon, GraduationCapIcon, MenuIcon } from './icons';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  onToggleMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, setMode, onToggleMenu }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const studyModeClasses = mode === AppMode.Study ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600';
  const quizModeClasses = mode === AppMode.Quiz ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600';
  const practiceModeClasses = mode === AppMode.Practice ? 'bg-amber-600 text-white' : 'bg-gray-700 hover:bg-gray-600';

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-md">
      <div className="flex items-center">
        <button 
          onClick={onToggleMenu}
          className="p-2 mr-2 md:hidden rounded-md hover:bg-gray-700 text-gray-400"
          aria-label="Toggle Menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-2xl font-bold text-teal-400 truncate max-w-[150px] sm:max-w-none">
          Mississippi Biology Tutor
        </h1>
      </div>
      <div className="flex items-center space-x-1 md:space-x-2">
        <button
          onClick={() => setMode(AppMode.Study)}
          className={`flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md transition-colors duration-200 font-semibold ${studyModeClasses}`}
        >
          <BrainIcon className="w-5 h-5" />
          <span className="hidden lg:inline">Study</span>
        </button>
        <button
          onClick={() => setMode(AppMode.Quiz)}
          className={`flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md transition-colors duration-200 font-semibold ${quizModeClasses}`}
        >
          <ClipboardCheckIcon className="w-5 h-5" />
          <span className="hidden lg:inline">Quiz</span>
        </button>
        <button
          onClick={() => setMode(AppMode.Practice)}
          className={`flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md transition-colors duration-200 font-semibold ${practiceModeClasses}`}
        >
          <GraduationCapIcon className="w-5 h-5" />
          <span className="hidden lg:inline">Practice Test</span>
        </button>
        <div className="border-l border-gray-600 h-8 mx-2 hidden sm:block"></div>
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-700 hover:bg-red-900 transition-colors duration-200 font-semibold"
          >
            <LogOutIcon className="w-5 h-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 transition-colors duration-200 font-semibold"
          >
            <LogInIcon className="w-5 h-5" />
            <span className="hidden md:inline">Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
