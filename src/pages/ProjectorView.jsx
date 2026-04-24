import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

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

export default function ProjectorView() {
  const [projects, setProjects] = useState([]);
  const [appStatus, setAppStatus] = useState("waiting");

  useEffect(() => {
    const unsubStatus = onSnapshot(doc(db, "settings", "app_state"), (doc) => {
      if (doc.exists()) setAppStatus(doc.data().status);
    });

    const q = query(collection(db, "projects"), orderBy("voteCount", "desc"));
    const unsubProjects = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubStatus(); unsubProjects(); };
  }, []);

  // THE WOW FACTOR: Continuous Fireworks on the Podium
  useEffect(() => {
    if (appStatus === "ended") {
      const duration = 15 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#FFD700', '#ffffff', '#00f5d4'] });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#FFD700', '#ffffff', '#00f5d4'] });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [appStatus]);

  const getRankStyle = (index) => {
    if (index === 0) return { card: "border-[#FFD700] bg-[#FFD700]/10 shadow-[0_0_30px_rgba(255,215,0,0.3)]", text: "text-[#FFD700]", img: "border-[#FFD700]" };
    if (index === 1) return { card: "border-[#C0C0C0] bg-[#C0C0C0]/10 shadow-[0_0_20px_rgba(192,192,192,0.2)]", text: "text-[#C0C0C0]", img: "border-[#C0C0C0]" };
    if (index === 2) return { card: "border-[#CD7F32] bg-[#CD7F32]/10 shadow-[0_0_20px_rgba(205,127,50,0.2)]", text: "text-[#CD7F32]", img: "border-[#CD7F32]" };
    return { card: "border-[#00f5d4]/20 bg-[#0d1b2a]/40", text: "text-white", img: "border-white/10" };
  };

  // --- FINAL RESULTS SCREEN (Includes Podium + Full List) ---
  if (appStatus === "ended") {
    const winner = projects[0];
    const second = projects[1];
    const third = projects[2];

    return (
      <div className="min-h-screen bg-[#050505] p-10 font-sans relative flex flex-col items-center pb-32">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(ellipse at top, #FFD700 0%, transparent 60%)' }}></div>
        
        <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-7xl font-black uppercase tracking-tighter text-white mb-12 mt-10 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] relative z-10" style={{ fontFamily: "'Syne', sans-serif" }}>
          FINAL RESULTS
        </motion.h1>

        {/* --- TOP 3 PODIUM --- */}
        <div className="flex items-end justify-center gap-10 w-full max-w-6xl relative z-10 mb-24">
          {second && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="flex-1 border-2 border-[#C0C0C0] bg-[#C0C0C0]/10 p-6 rounded-t-3xl text-center h-[400px] flex flex-col justify-end shadow-[0_0_30px_rgba(192,192,192,0.2)]">
              <img src={robotImages[second.id]} className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-[#C0C0C0] mb-4" />
              <h2 className="text-3xl font-bold uppercase text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{second.name}</h2>
              <p className="text-4xl font-black text-[#C0C0C0]">{second.voteCount}</p>
              <p className="text-sm font-bold tracking-[0.3em] text-[#C0C0C0]/60 mt-2">2ND PLACE</p>
            </motion.div>
          )}

          {winner && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5, type: "spring" }} className="flex-[1.2] border-4 border-[#FFD700] bg-[#FFD700]/20 p-8 rounded-t-3xl text-center h-[550px] flex flex-col justify-end shadow-[0_0_80px_rgba(255,215,0,0.4)] relative z-20">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-6xl">👑</div>
              <img src={robotImages[winner.id]} className="w-48 h-48 object-cover rounded-full mx-auto border-8 border-[#FFD700] mb-6 shadow-[0_0_40px_rgba(255,215,0,0.6)]" />
              <h2 className="text-5xl font-black uppercase text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>{winner.name}</h2>
              <p className="text-6xl font-black text-[#FFD700] drop-shadow-md">{winner.voteCount}</p>
              <p className="text-lg font-black tracking-[0.4em] text-[#FFD700] mt-4">CHAMPION</p>
            </motion.div>
          )}

          {third && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="flex-1 border-2 border-[#CD7F32] bg-[#CD7F32]/10 p-6 rounded-t-3xl text-center h-[350px] flex flex-col justify-end shadow-[0_0_30px_rgba(205,127,50,0.2)]">
              <img src={robotImages[third.id]} className="w-24 h-24 object-cover rounded-full mx-auto border-4 border-[#CD7F32] mb-4" />
              <h2 className="text-2xl font-bold uppercase text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{third.name}</h2>
              <p className="text-3xl font-black text-[#CD7F32]">{third.voteCount}</p>
              <p className="text-sm font-bold tracking-[0.3em] text-[#CD7F32]/60 mt-2">3RD PLACE</p>
            </motion.div>
          )}
        </div>

        {/* --- BIG SCREEN COMPLETE STANDINGS --- */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="w-full max-w-6xl relative z-10">
          <h3 className="text-zinc-500 font-mono text-2xl tracking-[0.3em] mb-10 uppercase text-center border-b border-zinc-800 pb-6">Complete System Records</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {projects.map((project, index) => {
              const style = getRankStyle(index);
              return (
                <div key={project.id} className={`flex items-center justify-between p-6 rounded-xl border backdrop-blur-md ${style.card}`}>
                   <div className="flex items-center gap-6">
                      <span className={`font-black text-3xl w-10 text-right ${style.text}`} style={{ fontFamily: "'Syne', sans-serif" }}>{index + 1}</span>
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                         <img src={robotImages[project.id]} alt="" className="w-full h-full object-cover opacity-90" />
                      </div>
                      <span className={`text-2xl font-bold uppercase tracking-wide ${index < 3 ? 'text-white' : 'text-zinc-300'}`} style={{ fontFamily: "'Syne', sans-serif" }}>{project.name}</span>
                   </div>
                   <span className={`text-4xl font-black font-mono tracking-tighter ${style.text}`}>{project.voteCount}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // --- STANDARD PROJECTOR FEED ---
  return (
    <div className="min-h-screen bg-[#050505] p-10 font-sans overflow-hidden relative selection:bg-[#00f5d4] selection:text-black">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#00f5d4 1px, transparent 1px), linear-gradient(90deg, #00f5d4 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)' }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] pointer-events-none"></div>

      <div className="text-center mb-16 relative z-10">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 drop-shadow-2xl mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
          LIVE ARENA STANDINGS
        </h1>
        <div className={`inline-flex items-center gap-3 px-8 py-2 rounded border-2 text-xl font-bold tracking-[0.2em] uppercase backdrop-blur-sm ${appStatus === 'live' ? 'bg-[#00f5d4]/10 border-[#00f5d4] text-[#00f5d4] shadow-[0_0_20px_rgba(0,245,212,0.4)]' : appStatus === 'waiting' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
          {appStatus === 'live' && <span className="w-3 h-3 rounded-full bg-[#00f5d4] animate-pulse"></span>}
          STATUS: {appStatus}
        </div>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-4 relative z-10">
        <AnimatePresence>
          {projects.map((project, index) => {
            const rankStyle = getRankStyle(index);
            return (
              <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className={`flex items-center justify-between p-4 md:p-6 rounded-2xl border backdrop-blur-xl ${rankStyle.card}`}>
                <div className="flex items-center gap-6 md:gap-8">
                  <h2 className={`text-4xl md:text-6xl font-black opacity-80 w-12 md:w-16 ${rankStyle.text}`} style={{ fontFamily: "'Syne', sans-serif" }}>#{index + 1}</h2>
                  <div className={`hidden sm:block w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 ${rankStyle.img}`}>
                    <img src={robotImages[project.id]} alt="" className="w-full h-full object-cover opacity-90" />
                  </div>
                  <h3 className={`text-2xl md:text-4xl font-bold uppercase tracking-tight ${rankStyle.text}`} style={{ fontFamily: "'Syne', sans-serif" }}>{project.name}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden md:block text-sm font-bold uppercase tracking-[0.2em] opacity-60 mt-2">Votes</span>
                  <motion.div key={project.voteCount} initial={{ scale: 1.5, color: '#00f5d4' }} animate={{ scale: 1, color: index < 3 ? 'inherit' : '#ffffff' }} className={`text-5xl md:text-7xl font-black tabular-nums tracking-tighter ${rankStyle.text}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{project.voteCount}</motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}