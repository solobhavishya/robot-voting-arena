import { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, collection, getDocs, writeBatch, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem("adminAuth") === "true");
  const [password, setPassword] = useState('');
  
  // FIX 1: Don't hardcode 'waiting' initially. Start as 'loading' to prevent flashes.
  const [appStatus, setAppStatus] = useState('loading'); 
  const [projects, setProjects] = useState([]);
  const [isResetting, setIsResetting] = useState(false); // Add a loading state for the reset button

  useEffect(() => {
    // Listen to global status
    const unsubStatus = onSnapshot(doc(db, "settings", "app_state"), (docSnap) => {
      if (docSnap.exists()) {
        setAppStatus(docSnap.data().status);
      }
    });

    // Listen to live votes
    const q = query(collection(db, "projects"), orderBy("voteCount", "desc"));
    const unsubProjects = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubStatus(); unsubProjects(); };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin123") {
      sessionStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
    } else {
      alert("ACCESS DENIED: INSUFFICIENT CLEARANCE.");
    }
  };

  const changeStatus = async (newStatus) => {
    if (appStatus === newStatus || appStatus === 'loading') return; 
    
    const confirmChange = window.confirm(`OVERRIDE PROTOCOL: Switch arena to ${newStatus.toUpperCase()}?`);
    if (confirmChange) {
      try {
        await updateDoc(doc(db, "settings", "app_state"), { status: newStatus });
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status. Check permissions.");
      }
    }
  };

  // FIX 2: Bulletproof Reset Function
  const resetVotes = async () => {
    const confirm1 = window.confirm("WARNING: THIS WILL PURGE ALL DATABASE RECORDS.");
    if (!confirm1) return;
    
    const confirm2 = window.confirm("ARE YOU ABSOLUTELY SURE? This cannot be undone.");
    if (!confirm2) return;

    setIsResetting(true);
    try {
      // 1. Get all project documents
      const projectsSnapshot = await getDocs(collection(db, "projects"));
      
      // 2. Initialize a new batch
      const batch = writeBatch(db);
      
      // 3. Queue up the updates (setting voteCount to 0)
      projectsSnapshot.docs.forEach((document) => {
        const projectRef = doc(db, "projects", document.id);
        batch.update(projectRef, { voteCount: 0 });
      });
      
      // 4. Commit the batch to Firebase
      await batch.commit();
      alert("PURGE COMPLETE: All votes reset to 0.");
      
      // Optional: Clear local storage so you can test voting again yourself
      localStorage.removeItem("votedFor"); 
      
    } catch (error) {
      console.error("Error resetting votes:", error);
      alert("Failed to reset votes. Check console for errors.");
    } finally {
      setIsResetting(false);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-[#00f5d4] font-mono">
        <form onSubmit={handleLogin} className="flex flex-col gap-6 p-10 border border-[#00f5d4]/30 bg-[#0d1b2a]/50 backdrop-blur-md w-full max-w-md">
          <h1 className="text-2xl font-bold tracking-[0.2em] mb-4">ROOT ACCESS REQUIRED</h1>
          <input 
            type="password" 
            placeholder="Enter Override Key" 
            onChange={(e) => setPassword(e.target.value)} 
            className="p-4 bg-black border border-[#00f5d4]/50 text-[#00f5d4] outline-none focus:border-[#00f5d4] focus:shadow-[0_0_15px_rgba(0,245,212,0.3)] font-mono tracking-widest placeholder:text-[#00f5d4]/30"
          />
          <button type="submit" className="bg-[#00f5d4] text-black p-4 font-bold tracking-[0.2em] hover:bg-white transition-colors">
            AUTHENTICATE
          </button>
        </form>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-[#050505] text-white p-10 selection:bg-[#00f5d4] selection:text-black">
      <header className="mb-12 border-b border-zinc-800 pb-6 flex justify-between items-end">
        <div>
          <p className="text-[#00f5d4] font-mono tracking-[0.2em] text-sm mb-2">SYSTEM DASHBOARD</p>
          <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>
            Override Terminal
          </h1>
        </div>
        <div className="text-right font-mono">
          <p className="text-zinc-500 text-sm">CURRENT STATE</p>
          <p className={`text-xl font-bold tracking-[0.1em] uppercase ${
            appStatus === 'loading' ? 'text-zinc-500 animate-pulse' 
            : appStatus === 'live' ? 'text-[#00f5d4]' 
            : appStatus === 'waiting' ? 'text-yellow-500' 
            : 'text-red-500'
          }`}>
            {appStatus === 'loading' ? 'FETCHING...' : appStatus}
          </p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="border border-zinc-800 bg-[#0d1b2a]/30 p-8">
            <h2 className="font-mono text-zinc-400 mb-6 tracking-[0.1em]">MASTER TOGGLES</h2>
            <div className="flex flex-col md:flex-row gap-4 font-mono">
              <button 
                onClick={() => changeStatus('waiting')} 
                disabled={appStatus === 'loading'}
                className={`flex-1 p-6 border transition-all duration-300 ${appStatus === 'waiting' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-zinc-800 text-zinc-500 hover:border-yellow-500/50 hover:text-yellow-500/80'}`}
              >
                1. STANDBY
              </button>
              <button 
                onClick={() => changeStatus('live')} 
                disabled={appStatus === 'loading'}
                className={`flex-1 p-6 border transition-all duration-300 ${appStatus === 'live' ? 'bg-[#00f5d4]/20 border-[#00f5d4] text-[#00f5d4] shadow-[0_0_20px_rgba(0,245,212,0.2)]' : 'border-zinc-800 text-zinc-500 hover:border-[#00f5d4]/50 hover:text-[#00f5d4]/80'}`}
              >
                2. EXECUTE LIVE
              </button>
              <button 
                onClick={() => changeStatus('ended')} 
                disabled={appStatus === 'loading'}
                className={`flex-1 p-6 border transition-all duration-300 ${appStatus === 'ended' ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-zinc-800 text-zinc-500 hover:border-red-500/50 hover:text-red-500/80'}`}
              >
                3. TERMINATE
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-900/50 bg-red-950/10 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
            <h2 className="font-mono text-red-500 mb-4 tracking-[0.1em]">DANGER ZONE</h2>
            <p className="text-zinc-400 font-mono text-sm mb-6">Wipes all current database voting records permanently. Cannot be undone.</p>
            <button 
              onClick={resetVotes} 
              disabled={isResetting}
              className={`bg-transparent border border-red-600 text-red-500 p-4 font-mono tracking-widest transition-colors w-full sm:w-auto ${
                isResetting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600 hover:text-white'
              }`}
            >
              {isResetting ? 'PURGING...' : 'PURGE ALL DATA'}
            </button>
          </div>
        </div>

        {/* Live Feed Sidebar */}
        <div className="border border-zinc-800 bg-[#0d1b2a]/30 p-6 flex flex-col h-[600px]">
          <h2 className="font-mono text-[#00f5d4] mb-6 tracking-[0.1em] flex justify-between items-center">
            <span>LIVE FEED</span>
            <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse"></span>
          </h2>
          <div className="overflow-y-auto pr-2 space-y-3 font-mono flex-1 custom-scrollbar">
            <AnimatePresence>
              {projects.map((project, i) => (
                <motion.div layout key={project.id} className="flex justify-between items-center p-3 bg-black border border-zinc-800">
                  <div className="flex gap-3 items-center">
                    <span className="text-zinc-600 text-xs">0{i+1}</span>
                    <span className="text-zinc-300 text-sm truncate max-w-[150px] uppercase">{project.name}</span>
                  </div>
                  <span className="text-[#00f5d4] font-bold">{project.voteCount}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}