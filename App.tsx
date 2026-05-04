
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppMode, Standard, ChatMessage } from './types';
import { BIO_STANDARDS } from './constants';
import { Header } from './components/Header';
import { StandardsList } from './components/StandardsList';
import { ChatInterface } from './components/ChatInterface';
import { PracticeTest } from './components/PracticeTest';
import { findStandardByKeyword } from './utils';
import { seedStandards } from './services/seedData';
import { db, auth } from './services/firebase';
import { collection, getDocs, query, orderBy, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './services/firestoreErrorHandler';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { XIcon } from './components/icons';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.Study);
  const [standards, setStandards] = useState<Standard[]>(BIO_STANDARDS);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(BIO_STANDARDS[0]);
  const welcomeMessage = useCallback((standard: Standard): ChatMessage => {
    return {
      role: 'ai',
      content: `I'm Bio Buddy, your AI tutor! We're looking at **${standard.title}**. \n\nWhat theme do you want to study with? You can choose:\n- 🌾 Mississippi (Farming, Wildlife, Southern food)\n- 📱 Social Media\n- ⚔️ Anime\n- 🎮 Gaming\n- 🧽 SpongeBob\n- 🦸 Invincible\n- 🧠 "67" Meme\n- 💡 ...or tell me your own theme! (e.g., Pirates, Sports Team, Superheroes, etc.)\n\nJust let me know your choice below, and ask me anything to start studying! (Or switch to Quiz Mode to test your knowledge).`
    };
  }, []);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([welcomeMessage(BIO_STANDARDS[0])]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initApp = async () => {
      try {
        await seedStandards();
        
        const q = query(collection(db, 'standards'), orderBy('id'));
        let snapshot;
        try {
          snapshot = await getDocs(q);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'standards');
        }

        if (isMounted && snapshot && !snapshot.empty) {
          const fetchedStandards = snapshot.docs.map(doc => doc.data() as Standard);
          setStandards(fetchedStandards);
          
          if (!selectedStandard) {
             const first = fetchedStandards[0];
             setSelectedStandard(first);
             setChatHistory([welcomeMessage(first)]);
          }
        }
      } catch (error) {
        console.error("Error initializing app with Firestore:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initApp();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      }
    });

    return () => { 
      isMounted = false; 
      unsubscribe();
    };
  }, [selectedStandard, welcomeMessage]);

  const handleSelectStandard = useCallback((standard: Standard) => {
    if (selectedStandard && standard.id === selectedStandard.id) {
        setIsMenuOpen(false);
        return;
    }
    setSelectedStandard(standard);
    setChatHistory([welcomeMessage(standard)]);
    setMode(AppMode.Study);
    setIsMenuOpen(false);
  }, [selectedStandard, welcomeMessage]);

  useEffect(() => {
    const handleVisualViewportResize = () => {
      if (window.visualViewport) {
        document.documentElement.style.setProperty('--vh', `${window.visualViewport.height}px`);
      }
    };

    window.visualViewport?.addEventListener('resize', handleVisualViewportResize);
    window.visualViewport?.addEventListener('scroll', handleVisualViewportResize);
    handleVisualViewportResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleVisualViewportResize);
      window.visualViewport?.removeEventListener('scroll', handleVisualViewportResize);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full font-sans bg-gray-900 text-gray-100 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-xl text-gray-400">Loading Bio Buddy brain...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full font-sans bg-gray-900 text-gray-100">
      <Header 
        mode={mode} 
        setMode={(newMode) => {
          setMode(newMode);
          setIsMenuOpen(false);
        }} 
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} 
      />
      <main className="flex flex-1 overflow-hidden relative min-h-0">
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Mobile Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 md:hidden"
              />
              {/* Mobile Menu */}
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-gray-800 z-50 p-4 shadow-2xl border-r border-gray-700 flex flex-col md:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-teal-400">Chapters</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="overflow-y-auto flex-1">
                  <StandardsList 
                    standards={standards} 
                    selectedStandard={selectedStandard} 
                    onSelectStandard={handleSelectStandard} 
                  />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {mode !== AppMode.Practice && (
          <aside className="w-1/4 min-w-[300px] max-w-[400px] bg-gray-800 p-4 overflow-y-auto hidden md:block border-r border-gray-700">
            <StandardsList 
              standards={standards} 
              selectedStandard={selectedStandard} 
              onSelectStandard={handleSelectStandard} 
            />
          </aside>
        )}
        <div className="flex-1 flex flex-col bg-gray-800/50 min-h-0">
          {mode === AppMode.Practice ? (
            <PracticeTest standards={standards} />
          ) : selectedStandard ? (
            <ChatInterface
              mode={mode}
              standard={selectedStandard}
              history={chatHistory}
              setHistory={setChatHistory}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xl text-gray-400">Select a standard to begin your review.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}