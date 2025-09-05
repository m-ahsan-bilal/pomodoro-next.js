"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"pomodoro" | "break">("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [longBreakDue, setLongBreakDue] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  });
  const [tempSettings, setTempSettings] = useState(settings);
  const [showSettings, setShowSettings] = useState(false);

  const audioRefs = useRef({
    start: null as HTMLAudioElement | null,
    stop: null as HTMLAudioElement | null,
    timeUp: null as HTMLAudioElement | null,
  });

  // Initialize audio safely for build
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRefs.current = {
        start: new Audio("/sound/start.mp3"),
        stop: new Audio("/sound/stop.mp3"),
        timeUp: new Audio("/sound/time-up.mp3"),
      };
    }
  }, []);

  // Track focus time
  useEffect(() => {
    if (isRunning && activeTab === "pomodoro") {
      const interval = setInterval(() => {
        setTotalFocusTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, activeTab]);

  const playSound = (type: "start" | "stop" | "timeUp") => {
    if (!isMuted && audioRefs.current[type] && typeof window !== "undefined") {
      try {
        audioRefs.current[type]!.currentTime = 0;
        audioRefs.current[type]!.play().catch(() => {});
      } catch (error) {
        console.warn("Audio playback failed:", error);
      }
    }
  };

  const getTimerDuration = () => {
    if (activeTab === "pomodoro") return settings.pomodoro * 60;
    return longBreakDue ? settings.longBreak * 60 : settings.shortBreak * 60;
  };

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Handle timer completion with auto-start
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      playSound("timeUp");
      setIsRunning(false);

      if (activeTab === "pomodoro") {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        const shouldTakeLongBreak =
          newSessions % settings.sessionsUntilLongBreak === 0;
        setLongBreakDue(shouldTakeLongBreak);
        setActiveTab("break");
        const nextDuration = shouldTakeLongBreak
          ? settings.longBreak * 60
          : settings.shortBreak * 60;
        setTimeLeft(nextDuration);

        if (autoStart) {
          setTimeout(() => {
            setIsRunning(true);
            playSound("start");
          }, 2000);
        }
      } else {
        setLongBreakDue(false);
        setActiveTab("pomodoro");
        setTimeLeft(settings.pomodoro * 60);

        if (autoStart) {
          setTimeout(() => {
            setIsRunning(true);
            playSound("start");
          }, 2000);
        }
      }
    }
  }, [timeLeft, isRunning, activeTab, sessions, settings, autoStart]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    playSound(isRunning ? "stop" : "start");
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getTimerDuration());
    playSound("stop");
  };

  const resetStats = () => {
    setSessions(0);
    setTotalFocusTime(0);
    setLongBreakDue(false);
  };

  const switchTab = (tab: "pomodoro" | "break" | "longBreak") => {
    if (isRunning) return;

    if (tab === "longBreak") {
      setActiveTab("break");
      setLongBreakDue(true);
      setTimeLeft(settings.longBreak * 60);
    } else {
      setActiveTab(tab);
      setLongBreakDue(false);
      setTimeLeft(
        tab === "pomodoro" ? settings.pomodoro * 60 : settings.shortBreak * 60
      );
    }
    playSound("stop");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };


  const openSettings = () => {
    setTempSettings({ ...settings });
    setShowSettings(true);
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    setTimeLeft(
      activeTab === "pomodoro"
        ? tempSettings.pomodoro * 60
        : longBreakDue
        ? tempSettings.longBreak * 60
        : tempSettings.shortBreak * 60
    );
    setIsRunning(false);
    setShowSettings(false);
    playSound("stop");
  };

  const cancelSettings = () => {
    setTempSettings(settings);
    setShowSettings(false);
  };

  const updateTempSetting = (key: keyof typeof settings, value: number) => {
    setTempSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Calculate progress percentage
  const totalDuration = getTimerDuration();
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl animate-spin"
          style={{ animationDuration: "60s" }}
        ></div>
      </div>

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-pink-400/30 rounded-full animate-bounce"
          style={{
            left: `${15 + i * 12}%`,
            top: `${20 + (i % 4) * 20}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3 + i * 0.3}s`,
          }}
        ></div>
      ))}

      {/* Header */}
      <div className="w-full max-w-5xl mb-10 relative z-10">
        <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 rounded-3xl p-6 shadow-2xl border border-white/10 hover:shadow-pink-500/20 transition-all duration-700">
          <div className="group">
            <h1 className="text-4xl font-bold flex items-center gap-3 group-hover:scale-105 transition-transform duration-500">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
               Focusflow
              </span>
            </h1>
            <p className="text-gray-300 text-base mt-2 group-hover:text-white transition-colors duration-300">
              An online Pomodoro Timer to boost your productivity
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex gap-10 text-center">
              <div className="group cursor-pointer">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text mb-1 group-hover:scale-110 transition-transform duration-300">
                  {sessions}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  Sessions
                </div>
              </div>
            
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30"
                title={isMuted ? "Unmute" : "Mute"}
              >
                <span className="text-2xl">{isMuted ? "🔇" : "🔊"}</span>
              </button>
              <button
                onClick={openSettings}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30 hover:rotate-90"
                title="Settings"
              >
                <span className="text-2xl">⚙️</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Container */}
      <div className="w-[550px] relative z-10">
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 transition-all duration-700 hover:shadow-pink-500/30 hover:scale-[1.02]">
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-10">
            {[
              { key: "pomodoro", label: "Pomodoro" },
              { key: "break", label: "Short Break" },
              { key: "longBreak", label: "Long Break" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() =>
                  switchTab(key as "pomodoro" | "break" | "longBreak")
                }
                disabled={isRunning}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-500 transform ${
                  (key === "pomodoro" && activeTab === "pomodoro") ||
                  (key === "break" && activeTab === "break" && !longBreakDue) ||
                  (key === "longBreak" && activeTab === "break" && longBreakDue)
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-110 shadow-pink-500/30"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-105"
                } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-center mb-10 relative">
            <div className="relative inline-block">
              {/* Glowing effect behind timer */}
              {isRunning && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 blur-xl animate-pulse"></div>
              )}

              <h2
                className={`text-8xl font-extrabold font-mono tracking-wide bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text drop-shadow-lg relative transition-all duration-500 ${
                  isRunning ? "animate-pulse" : ""
                }`}
              >
                {formatTime(timeLeft)}
              </h2>
            </div>

            <p className="mt-4 text-lg text-gray-300 transition-all duration-500">
              {activeTab === "pomodoro"
                ? "Stay focused 🔥"
                : "Take a breather 🌿"}
            </p>

            {timeLeft === 0 && !isRunning && (
              <div className="text-xl font-semibold mt-4 animate-bounce bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text">
                {autoStart ? "🎉 Auto-starting in 2s..." : "✨ Timer Complete!"}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`px-12 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isRunning
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/30"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/30"
              }`}
            >
              {isRunning ? "PAUSE" : "START"}
            </button>
            <button
              onClick={resetTimer}
              className="px-8 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-red-500/30"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="mt-8 text-center relative z-10">
        {sessions > 0 && (
          <p className="text-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text font-semibold mb-3 animate-pulse">
            Session #{sessions + 1}
          </p>
        )}
        <p className="text-lg text-gray-300 italic transition-all duration-500">
          {isRunning
            ? activeTab === "pomodoro"
              ? "Focus now, reward later 🚀"
              : "Relax... your brain needs it 🌱"
            : timeLeft === 0
            ? "🎉 Excellent work! Ready for the next session?"
            : "🚀 Ready to boost your productivity?"}
        </p>
      </div>
{/* Settings Overlay */}
{showSettings && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20 transform animate-in zoom-in duration-500 p-8">
      <h3 className="text-center font-bold text-3xl mb-8 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
        Timer Settings
      </h3>

      <div className="space-y-8">
        {/* Timer Settings */}
        <div className="space-y-6">
          {Object.entries(tempSettings).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <label className="text-gray-200 font-semibold text-lg">
                {key === "sessionsUntilLongBreak"
                  ? "🔄 Long break interval"
                  : key === "pomodoro"
                  ? "Pomodoro"
                  : key === "shortBreak"
                  ? "Short Break"
                  : key === "longBreak"
                  ? "Long Break"
                  : key}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    updateTempSetting(
                      key as keyof typeof settings,
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-24 p-3 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white focus:border-pink-500 focus:outline-none text-center text-lg font-semibold shadow-inner transition-all duration-300 hover:shadow-md focus:shadow-lg"
                  min={key === "sessionsUntilLongBreak" ? 2 : 1}
                  max={key === "sessionsUntilLongBreak" ? 10 : 120}
                />
                <span className="text-gray-400 text-base font-medium w-16">
                  {key === "sessionsUntilLongBreak" ? "sessions" : "minutes"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* App Settings */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 mb-6">
            <label className="text-gray-200 font-semibold text-lg flex items-center gap-2">
              Auto-start next session
            </label>
            <button
              onClick={() => setAutoStart(!autoStart)}
              className={`w-16 h-8 rounded-full transition-all duration-500 shadow-inner ${
                autoStart
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-500/30"
                  : "bg-gray-600"
              } relative group hover:scale-105`}
            >
              <div
                className={`w-7 h-7 bg-white rounded-full absolute top-0.5 transition-all duration-500 shadow-lg group-hover:shadow-xl ${
                  autoStart ? "translate-x-8" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <button
            onClick={resetStats}
            className="w-full py-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border-2 border-red-500/30 font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Reset All Statistics
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-6 mt-10 sticky bottom-0 bg-white/5 p-4 rounded-2xl backdrop-blur-lg">
        <button
          onClick={cancelSettings}
          className="flex-1 py-4 rounded-xl bg-gray-600/50 hover:bg-gray-600/70 text-gray-200 font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={saveSettings}
          className="flex-1 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    {/* Footer */}
<footer className="mt-16 w-full text-center relative z-10">
  <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 shadow-2xl border border-white/10 mx-auto max-w-3xl flex items-center justify-center hover:shadow-pink-500/20 transition-all duration-700">
    <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
      Developed with <span className="text-pink-500 animate-pulse">❤️</span> by 
      <a
        href="https://github.com/m-ahsan-bilal"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text hover:underline hover:scale-105 transition-transform duration-300"
      >
        M. Ahsan
      </a>
    </p>
  </div>
</footer>

    </main>
  );
}
