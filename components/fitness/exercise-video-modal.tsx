"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DetailedExerciseVideo,
  EXERCISE_VIDEO_LIBRARY,
  PostureCheckpoint,
} from "@/lib/data/exercise-videos";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Dumbbell,
  Compass,
  Check,
  ChevronRight,
  Maximize2,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseVideoModalProps {
  exerciseId: string | null;
  onClose: () => void;
}

function playCompletionChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch {}
}

export function ExerciseVideoModal({
  exerciseId,
  onClose,
}: ExerciseVideoModalProps) {
  const [selectedAngle, setSelectedAngle] = React.useState<"front" | "side">(
    "side"
  );
  const [isSlowMo, setIsSlowMo] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [activeCheckpoint, setActiveCheckpoint] = React.useState<number>(0);
  const [timerSeconds, setTimerSeconds] = React.useState(0);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [timerCompleted, setTimerCompleted] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const videoData: DetailedExerciseVideo | null = React.useMemo(() => {
    if (!exerciseId) return null;
    return (
      EXERCISE_VIDEO_LIBRARY[exerciseId] ||
      Object.values(EXERCISE_VIDEO_LIBRARY).find(
        (v) =>
          v.name.toLowerCase().includes(exerciseId.toLowerCase()) ||
          exerciseId.toLowerCase().includes(v.id)
      ) ||
      EXERCISE_VIDEO_LIBRARY.childs_pose
    );
  }, [exerciseId]);

  // Reset angle & timer when exercise changes
  React.useEffect(() => {
    if (videoData) {
      setSelectedAngle("side");
      setTimerSeconds(videoData.durationSec || 60);
      setIsTimerRunning(false);
      setTimerCompleted(false);
      setActiveCheckpoint(0);
      setIsSlowMo(false);
    }
  }, [videoData]);

  // Countdown timer logic with notification chime & vibration
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setTimerCompleted(true);
            playCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const togglePlaybackSpeed = () => {
    const nextSlow = !isSlowMo;
    setIsSlowMo(nextSlow);
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "setPlaybackRate",
            args: [nextSlow ? 0.5 : 1],
          }),
          "*"
        );
      }
    } catch {}
  };

  if (!videoData) return null;

  const currentVideoId =
    selectedAngle === "front"
      ? videoData.frontVideoId
      : videoData.sideVideoId;

  const currentAngleCue =
    selectedAngle === "front"
      ? videoData.frontAngleCue
      : videoData.sideAngleCue;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-2xl max-h-[94vh] flex flex-col overflow-hidden"
        >
          {/* Modal Header — Cleaned up hierarchy & spacing */}
          <div className="flex items-start justify-between border-b border-[var(--glass-border)] px-5 py-4 bg-[var(--bg-secondary)] shrink-0 gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-500/15 border border-violet-500/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  {videoData.category}
                </span>
                {videoData.subtitle && (
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    {videoData.subtitle}
                  </span>
                )}
                <span className="text-[11px] font-bold text-[var(--text-tertiary)]">
                  • {videoData.reps || `${videoData.durationSec}s hold`}
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-[var(--text-primary)] leading-snug">
                {videoData.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors shrink-0"
              aria-label="Close tutorial"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
            {/* Video Player & Angle Perspective Switcher */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                  <button
                    type="button"
                    onClick={() => setSelectedAngle("side")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                      selectedAngle === "side"
                        ? "bg-violet-600 text-white shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <span>📐</span>
                    <span>Side Profile Angle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAngle("front")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                      selectedAngle === "front"
                        ? "bg-violet-600 text-white shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <span>👁️</span>
                    <span>Front Facing Angle</span>
                  </button>
                </div>

                {/* Slow-mo & Timer Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlaybackSpeed}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 active:scale-95",
                      isSlowMo
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/30"
                        : "border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                    title="Toggle slow-motion 0.5x playback for granular biomechanics examination"
                  >
                    <span>⚡</span>
                    <span>{isSlowMo ? "0.5x Slow-Mo (Active)" : "Normal Speed (1.0x)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTimerCompleted(false);
                      setIsTimerRunning(!isTimerRunning);
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all active:scale-95",
                      isTimerRunning
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-sm animate-pulse"
                        : "border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-violet-500/40"
                    )}
                    title="Pacing Timer: Measures isometric posture hold & deep breathing interval"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>{timerSeconds}s Remaining</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Start {videoData.durationSec}s Hold Timer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Timer Completion Feedback Banner */}
              {timerCompleted && (
                <div className="flex items-center justify-between rounded-2xl bg-emerald-500/15 border border-emerald-500/35 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>🎉 Interval Complete! Great job holding proper posture.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTimerCompleted(false)}
                    className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* High Definition Video Embed Player */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-[var(--glass-border)] shadow-inner">
                {currentVideoId ? (
                  <iframe
                    ref={iframeRef}
                    key={`${currentVideoId}-${selectedAngle}`}
                    src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&mute=1&loop=1&playlist=${currentVideoId}&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
                    title={`${videoData.name} Form Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full object-cover border-0"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-white/70 space-y-2 p-6 text-center">
                    <Dumbbell className="h-10 w-10 text-violet-400" />
                    <p className="text-sm font-bold">Dedicated HD Posture Video</p>
                  </div>
                )}

                {/* Angle Overlay Badge & External Link */}
                <div className="absolute top-3 left-3 pointer-events-none rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white border border-white/20">
                  {selectedAngle === "front" ? "Front Perspective" : "Side Alignment Perspective"}
                </div>

                {currentVideoId && (
                  <a
                    href={`https://www.youtube.com/watch?v=${currentVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white/90 hover:text-white border border-white/20 flex items-center gap-1.5 transition-all hover:bg-black/90"
                  >
                    <span>Watch on YouTube</span>
                    <Maximize2 className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Angle Form Coaching Cue */}
              <div className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-3.5 text-xs text-violet-800 dark:text-violet-200 flex items-start gap-2.5">
                <Compass className="h-4 w-4 shrink-0 mt-0.5 text-violet-600 dark:text-violet-400" />
                <p className="leading-relaxed">
                  <strong className="text-violet-900 dark:text-violet-100 font-bold">
                    {selectedAngle === "front" ? "Front Angle Cue:" : "Side Profile Cue:"}
                  </strong>{" "}
                  {currentAngleCue}
                </p>
              </div>
            </div>

            {/* Posture Checkpoints Interactive Strip */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Biomechanics & Posture Checkpoints:
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  Tap to verify joint alignment
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {videoData.postureCheckpoints.map((cp, idx) => {
                  const isActive = activeCheckpoint === idx;

                  return (
                    <button
                      key={cp.part}
                      type="button"
                      onClick={() => setActiveCheckpoint(idx)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all space-y-1",
                        isActive
                          ? "border-emerald-500/50 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30"
                          : "border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-violet-500/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{cp.part}</span>
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {cp.cue}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DO vs DON'T (Correct Form vs Common Mistakes) Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Correct Form DOs */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Correct Form (Do This)</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  {videoData.correctFormPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes DON'Ts */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Common Mistakes (Avoid This)</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  {videoData.mistakesToAvoid.map((ms, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{ms}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Breathing Guide & Hormonal Benefit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> Breathing Cadence
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {videoData.breathingGuide}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Endocrine & Phase Benefit
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {videoData.hormonalBenefit}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-[var(--glass-border)] px-5 py-3.5 bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
            <span className="text-xs text-[var(--text-tertiary)] font-medium">
              Equipment: {videoData.equipment}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-500/25 active:scale-95 transition-all"
            >
              Done / Close Video
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
