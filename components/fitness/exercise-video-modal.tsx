"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DetailedExerciseVideo,
  EXERCISE_VIDEO_LIBRARY,
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

export function ExerciseVideoModal({
  exerciseId,
  onClose,
}: ExerciseVideoModalProps) {
  const [isSlowMo, setIsSlowMo] = React.useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = React.useState<number>(0);
  const [timerSeconds, setTimerSeconds] = React.useState(() =>
    exerciseId ? (EXERCISE_VIDEO_LIBRARY[exerciseId]?.durationSec ?? 60) : 60,
  );
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [timerCompleted, setTimerCompleted] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const videoData: DetailedExerciseVideo | null = React.useMemo(() => {
    if (!exerciseId) return null;
    return EXERCISE_VIDEO_LIBRARY[exerciseId] ?? null;
  }, [exerciseId]);

  // Countdown timer logic with notification chime & vibration
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setTimerCompleted(true);
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

  const currentVideoId = videoData.videoId;

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
            {/* Video tutorial and exercise timer */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
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
                    title="Toggle slow-motion playback"
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
                        <span>Start {videoData.durationSec}s Timer</span>
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
                    <span>Interval complete. Take a moment before continuing.</span>
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

              {/* Embedded video with an external fallback for privacy or regional restrictions */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-[var(--glass-border)] shadow-inner">
                {currentVideoId ? (
                  <iframe
                    ref={iframeRef}
                    key={currentVideoId}
                    src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
                    title={`${videoData.name} tutorial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="h-full w-full object-cover border-0"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-white/70 space-y-2 p-6 text-center">
                    <Dumbbell className="h-10 w-10 text-violet-400" />
                    <p className="text-sm font-bold">Dedicated HD Posture Video</p>
                  </div>
                )}

                {/* Tutorial label and external fallback */}
                <div className="absolute top-3 left-3 pointer-events-none rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white border border-white/20">
                  Video tutorial
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

              <div className="grid gap-3 sm:grid-cols-2">
                {[videoData.frontAngleCue, videoData.sideAngleCue].map((cue, index) => (
                  <div
                    key={cue}
                    className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-3.5 text-xs text-violet-800 dark:text-violet-200 flex items-start gap-2.5"
                  >
                    <Compass className="h-4 w-4 shrink-0 mt-0.5 text-violet-600 dark:text-violet-400" />
                    <p className="leading-relaxed">
                      <strong className="text-violet-900 dark:text-violet-100 font-bold">
                        {index === 0 ? "Front-view cue:" : "Side-view cue:"}
                      </strong>{" "}
                      {cue}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Posture Checkpoints Interactive Strip */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Biomechanics & Posture Checkpoints:
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  Use these as general form reminders
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
                          Form cue
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

            {/* Breathing guide and general safety note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> Breathing Cadence
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {videoData.breathingGuide}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Move at your pace
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Cycle phases do not prescribe a specific workout. Choose a comfortable range and stop if pain, dizziness, or other symptoms worsen.
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
