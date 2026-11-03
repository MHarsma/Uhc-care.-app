"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  Send,
  Heart,
  MessageSquareHeart,
  Sparkles,
  Mic,
  Square,
  Trash2,
  Volume2,
  FileAudio,
  CheckCircle2,
  Smile,
  Paperclip,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { api, getApiBaseUrl } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type Reaction = {
  id: number;
  emoji: string;
  user?: { id: number; name: string } | null;
};

type Note = {
  id: number;
  type: "text" | "voice";
  content?: string | null;
  audio_url?: string | null;
  audio_duration?: number | null;
  created_at?: string | null;
  author?: { id: number; name: string } | null;
  reactions: Reaction[];
};

const REACTION_EMOJIS = [
  "❤️", "💖", "🥰", "😍", "💕", "😘", "🫶", "💝",
  "🤗", "🫂", "✨", "🌟", "👏", "🙌", "💪", "🔥",
  "🌸", "🌷", "💐", "☕", "🍵", "🍫", "🍓", "🍦",
  "🥺", "🥹", "😇", "😊", "😂", "😴", "🩹", "👑",
];

export default function NotesPage() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [noteToDelete, setNoteToDelete] = React.useState<Note | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"text" | "voice">("text");

  // Text note state
  const [draft, setDraft] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Voice note recording state
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = React.useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = React.useState<string | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [expandedReactions, setExpandedReactions] = React.useState<number | null>(null);

  const loadNotes = React.useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setLoadError(null);
    } else {
      setIsRefreshing(true);
    }
    try {
      const result = await api.get<{ notes: Note[] }>("/couple/notes");
      setNotes(result.notes ?? []);
    } catch (err: any) {
      if (!silent) {
        setNotes([]);
        setLoadError(err?.message || "Unable to load notes. Please check connection.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and focus / visibility handlers
  React.useEffect(() => {
    void loadNotes(false);

    // Live polling: check for new messages every 4 seconds when tab is visible
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void loadNotes(true);
      }
    }, 4000);

    const handleFocus = () => {
      void loadNotes(true);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [loadNotes]);

  // Clean up audio URL on unmount
  React.useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [recordedAudioUrl]);

  const handleSubmitTextNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await api.post("/couple/notes", {
        type: "text",
        content: draft.trim(),
      });
      setDraft("");
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post note.");
    } finally {
      setSubmitting(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      setError("");
      audioChunksRef.current = [];

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone access is not supported by this browser. Please ensure you are connected over HTTPS."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported MIME type for Android Chrome / iOS Safari
      let mimeType = "";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const type = mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type });
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            stopVoiceRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setError("Microphone permission was denied. Tap the site settings or lock icon in your browser address bar to allow microphone access.");
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        setError("No microphone was detected on this device.");
      } else {
        setError(err?.message || "Could not start audio recording on this device.");
      }
      console.error(err);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const cancelVoiceRecording = () => {
    stopVoiceRecording();
    setRecordedAudioBlob(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setRecordingSeconds(0);
  };

  const handleSubmitVoiceNote = async () => {
    if (!recordedAudioBlob) return;

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("type", "voice");
      formData.append("audio", recordedAudioBlob, "voicenote.webm");
      formData.append("audio_duration", String(Math.max(1, recordingSeconds)));

      // Use the api client which handles Bearer token, XSRF, and credentials
      const result = await api.post("/couple/notes", formData);

      cancelVoiceRecording();
      await loadNotes();
    } catch (err: any) {
      const serverMsg = err?.data?.message || err?.message;
      setError(serverMsg || "Unable to post voice note.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReaction = async (noteId: number, emoji: string) => {
    try {
      await api.post(`/couple/notes/${noteId}/react`, { emoji });
      await loadNotes();
    } catch (err) {
      console.error("Failed to update reaction:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      await api.delete(`/couple/notes/${noteToDelete.id}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
      setNoteToDelete(null);
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <AppShell
      headerTitle="Couple Notes & Moments"
      headerSubtitle="Leave love notes, reminders & audio moments"
      headerAction={
        <button
          type="button"
          onClick={() => void loadNotes(false)}
          disabled={loading || isRefreshing}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
          title="Refresh messages from partner"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", (loading || isRefreshing) && "animate-spin text-violet-500")} />
          <span className="hidden sm:inline">Sync Live</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* Composition Box */}
        <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm glass-card">
          {/* Tab Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all press-effect",
                  activeTab === "text"
                    ? "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-500/20"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <span>Write Note</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("voice")}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all press-effect",
                  activeTab === "voice"
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Voice Note</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 font-medium">
              {error}
            </div>
          )}

          {/* Text Note Form */}
          {activeTab === "text" ? (
            <form onSubmit={handleSubmitTextNote} className="mt-4 space-y-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Leave a sweet note, daily reminder, or shared thought for your partner..."
                rows={3}
                className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-sm text-[var(--text-primary)] focus:border-violet-500/50 focus:bg-violet-500/5 focus:outline-none focus:ring-4 focus:ring-violet-500/10 resize-none transition-all placeholder:text-[var(--text-muted)]"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-[var(--text-tertiary)]">
                  Visible to both you and your partner
                </div>

                <button
                  type="submit"
                  disabled={submitting || !draft.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:opacity-95 disabled:opacity-40 active:scale-[0.99] transition-all press-effect"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submitting ? "Posting..." : "Post Note"}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Voice Note Form */
            <div className="mt-4 p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Record Voice Memo
                  </h4>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Record a warm audio message up to 60 seconds
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!isRecording && !recordedAudioBlob && (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Start Recording</span>
                    </button>
                  )}

                  {isRecording && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 text-rose-500 px-3 py-1.5 text-xs font-bold animate-pulse border border-rose-500/20">
                        <span className="h-2 w-2 rounded-full bg-rose-600" />
                        <span>0:{recordingSeconds.toString().padStart(2, "0")} / 1:00</span>
                      </div>
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="flex items-center gap-1.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] px-3.5 py-2 text-xs font-bold hover:opacity-90"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        <span>Stop</span>
                      </button>
                    </div>
                  )}

                  {recordedAudioBlob && !isRecording && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSubmitVoiceNote}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{submitting ? "Uploading..." : "Send Audio"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelVoiceRecording}
                        className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                        title="Cancel recording"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {recordedAudioUrl && (
                <div className="pt-2">
                  <audio controls src={recordedAudioUrl} className="w-full h-10" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes Grid Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-3xl shimmer" />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-rose-500/25 bg-rose-500/5 p-8 text-center space-y-4 max-w-md mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">
              Unable to load notes
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              {loadError}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => void loadNotes()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--glass-border)] glass-card p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 shadow-sm">
              <MessageSquareHeart className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              No notes shared yet
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
              Write the first note to surprise your partner or leave a helpful routine reminder.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => {
              const reactionsCountMap = new Map<string, number>();
              note.reactions?.forEach((r) => {
                reactionsCountMap.set(
                  r.emoji,
                  (reactionsCountMap.get(r.emoji) || 0) + 1
                );
              });

              return (
                <div
                  key={note.id}
                  className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5 shadow-2xs glass-card hover:border-violet-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Author + Timestamp + Delete */}
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold text-xs shadow-sm">
                          {note.author?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">
                            {note.author?.name || "Partner"}
                          </p>
                          <p className="text-[10px] text-[var(--text-tertiary)]">
                            {note.created_at
                              ? new Date(note.created_at).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                              : "Recently"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setNoteToDelete(note)}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="mt-3.5">
                      {note.type === "voice" ? (
                        <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-500">
                            <FileAudio className="h-4 w-4" />
                            <span>Voice Memo ({note.audio_duration || 0}s)</span>
                          </div>
                          {(note.audio_url || note.id) && (
                            <div className="space-y-1.5 pt-1">
                              {(() => {
                                const streamUrl = `${getApiBaseUrl()}/couple/notes/${note.id}/audio`;
                                const fallbackUrl = note.audio_url || streamUrl;
                                return (
                                  <>
                                    <audio
                                      controls
                                      preload="metadata"
                                      playsInline
                                      className="w-full h-10 rounded-xl"
                                    >
                                      <source src={streamUrl} type="audio/webm" />
                                      <source src={streamUrl} type="audio/mp4" />
                                      <source src={fallbackUrl} />
                                      Your browser does not support audio playback.
                                    </audio>
                                    <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] px-1">
                                      <a
                                        href={streamUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-violet-500 hover:underline flex items-center gap-1 font-semibold"
                                      >
                                        Open / Replay Audio Directly ↗
                                      </a>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reaction Bar */}
                  <div className="mt-4 pt-3 border-t border-[var(--glass-border)]">
                    {/* Existing reactions pills */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {Array.from(reactionsCountMap.entries()).map(([emoji, count]) => (
                        <span
                          key={emoji}
                          className="inline-flex items-center gap-1 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] px-2 py-0.5 text-xs font-bold text-[var(--text-primary)]"
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">{count}</span>
                        </span>
                      ))}
                    </div>

                    {/* Quick emoji reaction pickers */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {REACTION_EMOJIS.slice(0, expandedReactions === note.id ? REACTION_EMOJIS.length : 5).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleAddReaction(note.id, emoji)}
                          className="h-7 w-7 rounded-lg text-sm hover:bg-[var(--bg-hover)] flex items-center justify-center transition-transform hover:scale-125 active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setExpandedReactions(expandedReactions === note.id ? null : note.id)}
                        className="h-7 px-2 rounded-lg text-[10px] font-bold text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all"
                        title={expandedReactions === note.id ? "Show less" : "More reactions"}
                      >
                        {expandedReactions === note.id ? "−" : `+${REACTION_EMOJIS.length - 5}`}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] p-6 shadow-2xl border border-[var(--glass-border)] text-center animate-in zoom-in-95 duration-150 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
              <Trash2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Delete Note?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete this {noteToDelete.type === "voice" ? "voice memo" : "note"}? This will permanently remove it from the database for both you and your partner.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="rounded-xl border border-[var(--glass-border)] py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
