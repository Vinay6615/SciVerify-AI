/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, logout } from './lib/firebase';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
import { LogIn, Microscope } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue" id="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={logout}>
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
            id="login-view"
          >
            <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm">
              <Microscope className="w-16 h-16 text-accent-blue" />
            </div>
            <h1 className="text-5xl font-light italic tracking-tight text-white mb-6">
              SciVerify <span className="text-accent-blue not-italic font-bold">AI</span>
            </h1>
            <p className="text-slate-400 max-w-lg mb-12 leading-relaxed text-lg">
              Advanced neural verification for scientific integrity. Audits derivations, detects bias, and ensures authenticity in complex modeling.
            </p>
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-lg hover:bg-slate-200 transition-all font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95"
              id="google-login-btn"
            >
              <LogIn className="w-4 h-4" />
              Initialize Session
            </button>
          </motion.div>
        ) : (
          <Dashboard key="dashboard" userId={user.uid} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
