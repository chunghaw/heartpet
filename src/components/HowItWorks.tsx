const items = [
  { emoji: "📝", title: "Check in", desc: "Say a few words or add a selfie/surroundings." },
  { emoji: "💬", title: "AI reflects", desc: "One gentle acknowledgement + a curious question." },
  { emoji: "🎯", title: "Care Quest", desc: "One safe action · 1–3 minutes." },
  { emoji: "🌸", title: "Bloom", desc: "Earn XP, evolve, unlock cozy props." },
];

export function HowItWorks() {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.title} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-lg">{it.emoji}</div>
          <div className="mt-1 text-sm font-medium">{it.title}</div>
          <div className="text-xs text-slate-600">{it.desc}</div>
        </div>
      ))}
    </div>
  );
}
