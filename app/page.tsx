const todayTasks = [
    {
        title: "Morning Exercise",
        time: "7:20 AM",
        done: true,
        completedAt: "Completed at 7:42 AM",
    },
    {
        title: "Read Quran",
        time: "8:00 AM",
        done: true,
        completedAt: "Completed at 8:12 AM",
    },
    { title: "Drink Water", time: "9:00 AM", done: false, completedAt: null },
    {
        title: "Daily Planning",
        time: "10:30 AM",
        done: false,
        completedAt: null,
    },
    {
        title: "Prayer Check-in",
        time: "12:00 PM",
        done: false,
        completedAt: null,
    },
];

const partnerNotes = [
    {
        name: "Harsma",
        status: "Completed 5 tasks today",
        accent: "bg-emerald-500",
    },
    { name: "You", status: "2 tasks left to finish", accent: "bg-violet-500" },
];

const microWins = [
    "Strong routine momentum",
    "You are 68% through today",
    "Your streak is still alive",
];

export default function Home() {
    const completed = todayTasks.filter((task) => task.done).length;
    const total = todayTasks.length;
    const progress = Math.round((completed / total) * 100);

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(145,92,255,0.18),_transparent_35%),linear-gradient(180deg,#f6f3ff_0%,#eef6ff_42%,#f8fafc_100%)] text-slate-900">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <header className="mb-8 flex items-center justify-between rounded-[28px] border border-white/60 bg-white/70 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-lg font-bold text-white shadow-lg shadow-violet-500/30">
                            U
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-500">
                                Couple OS
                            </p>
                            <h1 className="text-lg font-semibold">UHC Care</h1>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
                        <span className="text-slate-900">Today</span>
                        <span>Tasks</span>
                        <span>Partner</span>
                        <span>History</span>
                    </nav>

                    <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800">
                        + Add task
                    </button>
                </header>

                <section className="mb-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
                    <div className="rounded-[32px] border border-violet-100 bg-slate-950 p-6 text-white shadow-[0_30px_70px_rgba(76,29,149,0.35)] sm:p-8">
                        <div className="mb-8 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-violet-200">
                                    Good morning, Harsma
                                </p>
                                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Today
                                </h2>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right backdrop-blur-sm">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-violet-200">
                                    Friday
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    Sep 12
                                </p>
                            </div>
                        </div>

                        <div className="mb-8 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-violet-200">
                                    Progress
                                </p>
                                <p className="mt-3 text-3xl font-semibold">
                                    {progress}%
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-violet-200">
                                    Completed
                                </p>
                                <p className="mt-3 text-3xl font-semibold">
                                    {completed}/{total}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-violet-200">
                                    Streak
                                </p>
                                <p className="mt-3 text-3xl font-semibold">
                                    12 days
                                </p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-violet-400/20 bg-white/5 p-4">
                            <div className="mb-3 flex items-center justify-between text-sm text-violet-100">
                                <span>Routine completion</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <aside className="rounded-[32px] border border-violet-100 bg-white/80 p-5 shadow-[0_16px_50px_rgba(76,29,149,0.08)] backdrop-blur-xl sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Partner sync
                            </h3>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                in sync
                            </span>
                        </div>

                        <div className="space-y-3">
                            {partnerNotes.map((person) => (
                                <div
                                    key={person.name}
                                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-10 w-10 rounded-xl ${person.accent} flex items-center justify-center text-sm font-bold text-white`}
                                        >
                                            {person.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {person.name}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {person.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 p-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-violet-100">
                                Motivation
                            </p>
                            <p className="mt-3 text-lg font-semibold">
                                “Consistency compounds quietly.”
                            </p>
                        </div>
                    </aside>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="rounded-[30px] border border-white/60 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-violet-500">
                                    Today
                                </p>
                                <h3 className="mt-1 text-2xl font-semibold">
                                    Your routine
                                </h3>
                            </div>
                            <button className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                                Quick add
                            </button>
                        </div>

                        <div className="space-y-3">
                            {todayTasks.map((task) => (
                                <div
                                    key={task.title}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 transition hover:border-violet-200 hover:bg-violet-50/70"
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                                                task.done
                                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                                    : "border-slate-300 bg-white text-slate-400"
                                            }`}
                                        >
                                            {task.done ? "✓" : ""}
                                        </button>
                                        <div>
                                            <p
                                                className={`font-medium ${task.done ? "text-slate-500 line-through" : "text-slate-900"}`}
                                            >
                                                {task.title}
                                            </p>
                                            {task.done && task.completedAt ? (
                                                <p className="text-xs text-slate-500">
                                                    {task.completedAt}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-slate-500">
                                                    {task.time}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                                        {task.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[30px] border border-white/60 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Daily focus
                                </h3>
                                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                    Today
                                </span>
                            </div>

                            <div className="space-y-3">
                                {microWins.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 p-3 text-sm font-medium text-slate-700"
                                    >
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                                            ✦
                                        </span>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[30px] border border-violet-100 bg-slate-900 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.25)]">
                            <p className="text-xs uppercase tracking-[0.22em] text-violet-200">
                                Task history
                            </p>
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <div>
                                        <p className="font-semibold">
                                            Morning Exercise
                                        </p>
                                        <p className="text-xs text-slate-300">
                                            Completed 7:42 AM
                                        </p>
                                    </div>
                                    <span className="text-xl">✅</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <div>
                                        <p className="font-semibold">
                                            Read Quran
                                        </p>
                                        <p className="text-xs text-slate-300">
                                            Completed 8:12 AM
                                        </p>
                                    </div>
                                    <span className="text-xl">✅</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
