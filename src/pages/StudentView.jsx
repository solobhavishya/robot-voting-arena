import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, runTransaction, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const robotImages = {
  arduino_basix: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
  fire_fighting: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=500&q=80",
  food_serving: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=500&q=80",
  floor_cleaner: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=500&q=80",
  water_cleaner: "https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?auto=format&fit=crop&w=500&q=80",
  high_beam: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&q=80",
  smart_dustbin: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=500&q=80",
  otto_bot: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=500&q=80",
  home_automation: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=500&q=80",
  water_level: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=500&q=80"
};

export default function StudentView() {
  const [projects, setProjects] = useState([]);
  const [appStatus, setAppStatus] = useState("waiting");
  const [hasVoted, setHasVoted] = useState(localStorage.getItem("votedFor") || null);
  
  // New States for Feedback
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(localStorage.getItem("feedbackSubmitted") === "true");

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;
    const moveCursor = (e) => cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  useEffect(() => {
    const unsubStatus = onSnapshot(doc(db, "settings", "app_state"), (doc) => {
      if (doc.exists()) setAppStatus(doc.data().status);
    });
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubStatus(); unsubProjects(); };
  }, []);

  useEffect(() => {
    if (appStatus === "ended") {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#ffffff', '#00f5d4'], disableForReducedMotion: true });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700', '#ffffff', '#00f5d4'], disableForReducedMotion: true });
        if (Date.now() < animationEnd) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [appStatus]);

  const triggerWowFactor = (projectId) => {
    const colors = projectId === "fire_fighting" ? ['#ff4500', '#ff8c00'] : projectId.includes("water") ? ['#00f5d4', '#00bfff'] : ['#00f5d4', '#ffffff'];
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors, disableForReducedMotion: true });
  };

  const handleVote = async (projectId) => {
    if (hasVoted) return;
    try {
      const projectRef = doc(db, "projects", projectId);
      await runTransaction(db, async (transaction) => {
        const projectDoc = await transaction.get(projectRef);
        if (!projectDoc.exists()) throw "Project missing";
        transaction.update(projectRef, { voteCount: projectDoc.data().voteCount + 1 });
      });
      localStorage.setItem("votedFor", projectId);
      setHasVoted(projectId);
      triggerWowFactor(projectId);
    } catch (e) { console.error("Voting failed: ", e); }
  };

  // Feedback Submission Handler
  const submitFeedback = async () => {
    if (!feedback.trim()) return;
    try {
      await addDoc(collection(db, "feedbacks"), {
        projectId: hasVoted,
        text: feedback,
        timestamp: new Date()
      });
      setFeedbackSubmitted(true);
      localStorage.setItem("feedbackSubmitted", "true");
    } catch (err) {
      console.error("Feedback failed: ", err);
    }
  };

  if (appStatus === "waiting") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#00f5d4_0%,_transparent_50%)]"></div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center z-10">
          <div className="w-16 h-16 border-2 border-[#00f5d4] border-r-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>SYSTEM LOCKED</h1>
          <p className="text-[#00f5d4] tracking-[0.2em] text-sm md:text-base uppercase font-mono">Awaiting Admin Override Sequence</p>
        </motion.div>
      </div>
    );
  }

  // --- THE MASTERPIECE FINAL RESULTS SCREEN ---
  if (appStatus === "ended") {
    const sortedProjects = [...projects].sort((a, b) => b.voteCount - a.voteCount);
    const [winner, second, third] = sortedProjects;

    const getRankStyle = (index) => {
      if (index === 0) return { card: "border-[#FFD700] bg-[#FFD700]/10", text: "text-[#FFD700]" };
      if (index === 1) return { card: "border-[#C0C0C0] bg-[#C0C0C0]/10", text: "text-[#C0C0C0]" };
      if (index === 2) return { card: "border-[#CD7F32] bg-[#CD7F32]/10", text: "text-[#CD7F32]" };
      return { card: "border-white/5 bg-white/5", text: "text-zinc-500" };
    };

    return (
      <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_#FFD700_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10 pt-4 md:pt-8 text-center">
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#FFD700] text-sm font-bold tracking-[0.3em] mb-2 uppercase font-mono">Voting Concluded</motion.p>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mb-12 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400" style={{ fontFamily: "'Syne', sans-serif" }}>
            Final <span className="text-[#FFD700]">Results</span>
          </motion.h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16 md:items-end">
            {second && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="w-full md:w-1/3 order-2 md:order-1 border border-[#C0C0C0] bg-[#C0C0C0]/10 p-6 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(192,192,192,0.15)]">
                <div className="text-2xl mb-2">🥈</div>
                <img src={robotImages[second.id]} className="w-24 h-24 object-cover rounded-full border-2 border-[#C0C0C0] mb-4" alt="" />
                <h2 className="text-lg font-bold uppercase text-white mb-2 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{second.name}</h2>
                <p className="text-3xl font-black text-[#C0C0C0] font-mono">{second.voteCount}</p>
              </motion.div>
            )}
            
            {winner && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8 }} className="w-full md:w-[40%] order-1 md:order-2 border-2 border-[#FFD700] bg-[#FFD700]/20 p-8 rounded-3xl flex flex-col items-center shadow-[0_0_40px_rgba(255,215,0,0.3)] z-10 relative">
                <div className="absolute -top-6 text-5xl">👑</div>
                <img src={robotImages[winner.id]} className="w-32 h-32 object-cover rounded-full border-4 border-[#FFD700] mb-4 shadow-[0_0_20px_rgba(255,215,0,0.5)]" alt="" />
                <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-2 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{winner.name}</h2>
                <p className="text-5xl font-black text-[#FFD700] font-mono">{winner.voteCount}</p>
                <p className="text-xs font-bold tracking-[0.3em] text-[#FFD700] mt-2 uppercase">Champion</p>
              </motion.div>
            )}

            {third && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="w-full md:w-1/3 order-3 md:order-3 border border-[#CD7F32] bg-[#CD7F32]/10 p-6 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(205,127,50,0.15)]">
                <div className="text-2xl mb-2">🥉</div>
                <img src={robotImages[third.id]} className="w-24 h-24 object-cover rounded-full border-2 border-[#CD7F32] mb-4" alt="" />
                <h2 className="text-lg font-bold uppercase text-white mb-2 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{third.name}</h2>
                <p className="text-3xl font-black text-[#CD7F32] font-mono">{third.voteCount}</p>
              </motion.div>
            )}
          </div>

          <div className="text-left mt-8 max-w-2xl mx-auto">
            <h3 className="text-zinc-500 font-mono text-sm tracking-[0.2em] mb-6 uppercase border-b border-zinc-800 pb-4 text-center md:text-left">Complete System Records</h3>
            <div className="flex flex-col gap-3">
              {sortedProjects.map((project, index) => {
                const style = getRankStyle(index);
                return (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + (index * 0.05) }} key={project.id} className={`flex items-center justify-between p-4 rounded-xl backdrop-blur-sm border ${style.card}`}>
                    <div className="flex items-center gap-4">
                      <span className={`font-black text-xl w-6 text-center ${style.text}`} style={{ fontFamily: "'Syne', sans-serif" }}>{index + 1}</span>
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 hidden sm:block">
                         <img src={robotImages[project.id]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className={`font-bold uppercase tracking-tight text-sm sm:text-base ${index < 3 ? 'text-white' : 'text-zinc-400'}`} style={{ fontFamily: "'Syne', sans-serif" }}>{project.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-2xl font-mono ${style.text}`}>{project.voteCount}</span>
                      <span className="text-xs opacity-40 font-mono uppercase hidden sm:block">Votes</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- STANDARD VOTING SCREEN WITH FEEDBACK ---
  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pb-32 relative overflow-hidden selection:bg-[#00f5d4] selection:text-black">
      <div id="custom-cursor" className="custom-cursor hidden md:block"></div>
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_#0d1b2a_0%,_transparent_70%)]"></div>

      <div className="max-w-4xl mx-auto relative z-10 pt-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-12 text-center md:text-left">
          <p className="text-[#00f5d4] text-xs font-bold tracking-[0.2em] mb-4 uppercase font-mono">Phase 01 // Initiation</p>
          <h1 className="text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Select Your <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5d4] to-white">Champion.</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed mx-auto md:mx-0">
            One student. One authorization. Cast your vote to lock in your choice for the 2026 Robotics Showcase.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={project.id} className={`glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-5 group relative overflow-hidden ${hasVoted === project.id ? '!border-[#00f5d4] !bg-[#00f5d4]/5 shadow-[0_0_30px_rgba(0,245,212,0.15)] items-start' : ''}`}>
              
              <div className={`w-full sm:w-28 shrink-0 rounded-xl overflow-hidden border border-white/10 relative ${hasVoted === project.id ? 'h-28 sm:h-full sm:min-h-[140px]' : 'h-40 sm:h-28'}`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img src={robotImages[project.id]} alt="" className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-110" loading="lazy" decoding="async" />
              </div>

              <div className="flex-1 w-full text-center sm:text-left flex flex-col justify-center">
                <span className="text-[#00f5d4]/60 font-bold text-xs tracking-widest mb-1 font-mono">0{i + 1}</span>
                <h3 className="font-bold text-xl uppercase tracking-tight text-white group-hover:text-[#00f5d4] transition-colors mb-3 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{project.name}</h3>
                
                {hasVoted === project.id ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="bg-[#00f5d4] text-black py-2 px-4 rounded-lg text-xs font-bold tracking-[0.1em] text-center shadow-[0_0_15px_rgba(0,245,212,0.4)] w-full font-mono">
                      AUTHORIZED
                    </div>
                    
                    {/* INLINE FEEDBACK SYSTEM */}
                    <AnimatePresence>
                      {!feedbackSubmitted ? (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-2 mt-2">
                          <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Optional Transmission:</p>
                          <textarea 
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="What did you love about this robot?"
                            className="w-full bg-black/40 border border-[#00f5d4]/30 rounded-lg p-3 text-sm text-[#00f5d4] placeholder:text-[#00f5d4]/30 focus:outline-none focus:border-[#00f5d4] font-mono resize-none transition-colors"
                            rows="2"
                          />
                          <button onClick={submitFeedback} className="bg-transparent border border-[#00f5d4]/50 text-[#00f5d4] hover:bg-[#00f5d4] hover:text-black py-2 rounded-lg text-xs font-bold tracking-[0.1em] transition-all font-mono">
                            TRANSMIT FEEDBACK
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center text-[#00f5d4] text-xs font-mono tracking-widest mt-2 bg-[#00f5d4]/10 border border-[#00f5d4]/30 py-2 rounded-lg">
                          ✓ TRANSMISSION RECEIVED
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                ) : (
                  <button onClick={() => handleVote(project.id)} disabled={hasVoted} className="py-2.5 px-4 rounded-lg text-xs font-bold tracking-[0.1em] transition-all w-full bg-white/5 border border-white/10 text-white hover:bg-[#00f5d4] hover:text-black hover:border-[#00f5d4] hover:shadow-[0_0_20px_rgba(0,245,212,0.3)] active:scale-95 font-mono">AUTHORIZE VOTE</button>
                )}
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}