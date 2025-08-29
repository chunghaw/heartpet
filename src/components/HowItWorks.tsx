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
        <div key={it.title} className="rounded-xl border border-slate-200 bg-white p-3 min-h-[120px] flex flex-col">
          <div className="text-lg mb-2">{it.emoji}</div>
          <div className="text-sm font-medium text-black mb-2">{it.title}</div>
          <div className="text-xs text-black leading-tight flex-1">{it.desc}</div>
        </div>
      ))}
    </div>
  );
}
