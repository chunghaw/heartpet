export function HomeIntro({ petName }: { petName: string }) {
  return (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 ring-1 ring-emerald-100">
      <p className="text-sm text-emerald-900/90">
        Hi, I'm your HeartPet{petName ? `, ${petName}` : ""}. Share how you're feeling
        and I'll turn it into a tiny 1–3 min Care Quest. Complete it and I grow! 🌱
      </p>
    </div>
  );
}
