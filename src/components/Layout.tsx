import { User } from 'firebase/auth';
import { Microscope, LogOut, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-deep text-slate-200 font-sans selection:bg-accent-blue selection:text-white flex flex-col" id="app-container">
      <nav className="h-16 border-b border-border-subtle bg-bg-deep/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between" id="navbar">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-accent-blue rounded-sm flex items-center justify-center font-bold text-white">G</div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium tracking-tight text-white">
              SciVerify <span className="text-accent-blue font-light italic">AI</span>
            </h1>
          </div>
        </div>
        
        {user ? (
          <div className="flex items-center gap-6" id="nav-user-controls">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <span className="text-accent-blue border-b-2 border-accent-blue py-5">Analysis Mode</span>
              <span className="text-slate-400 opacity-70 cursor-pointer hover:opacity-100 transition-opacity">Verification Queue</span>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-xs font-medium hidden sm:inline">{user.displayName}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Logout"
                id="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-slate-300 uppercase tracking-widest">Neural Clusters Active</span>
          </div>
        )}
      </nav>
      
      <main className="flex-1 flex flex-col" id="main-content">
        {children}
      </main>
      
      <footer className="h-8 border-t border-border-subtle bg-black/40 flex items-center px-6 justify-between text-[10px] text-slate-500" id="footer">
        <div className="flex space-x-6">
          <span>ENGINE: GEMINI-PRO v3.1</span>
          <span className="hidden sm:inline">LATENCY: 42ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-pulse"></span>
          <span className="uppercase tracking-tighter">Streaming verification to cloud node...</span>
        </div>
      </footer>
    </div>
  );
}
