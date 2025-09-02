"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"pomodoro" | "break">("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Switch tabs → reset timer
  const handleTabChange = (tab: "pomodoro" | "break") => {
    setActiveTab(tab);
    setIsRunning(false);
    setTimeLeft(tab === "pomodoro" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6 animate-gradient">
      <div className="w-[420px] bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 transition-all duration-700 hover:shadow-pink-500/30 hover:scale-[1.02]">
        
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          {["pomodoro", "break"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as "pomodoro" | "break")}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-500
                ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-110"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
            >
              {tab === "pomodoro" ? "Pomodoro" : "Break"}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-10">
          <h1 className="text-7xl font-extrabold font-mono tracking-wide bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text animate-pulseSlow drop-shadow-lg">
            {formatTime(timeLeft)}
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            {activeTab === "pomodoro" ? "Stay focused 🔥" : "Take a breather 🌿"}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg transition-transform hover:scale-105"
            >
              Start
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-lg transition-transform hover:scale-105"
            >
              Pause
            </button>
          )}
          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(activeTab === "pomodoro" ? 25 * 60 : 5 * 60);
            }}
            className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg transition-transform hover:scale-105"
          >
            Reset
          </button>
        </div>

        {/* Quote */}
        <p className="mt-10 text-center text-sm text-gray-300 italic animate-fadeIn">
          {activeTab === "pomodoro"
            ? "Focus now, reward later 🚀"
            : "Relax... your brain needs it 🌱"}
        </p>
      </div>
    </main>
  );
}
