export function buildQuery({ text, mood, energy, focus, cues }: {
  text: string; mood: string; energy: 'low' | 'medium' | 'high'; focus: string[]; cues: any
}) {
  const tags = focus.map(f => `focus:${f}`).join(" ");
  const cueStr = Object.entries(cues || {}).map(([k, v]) => `${k}:${v}`).join(" ");
  return `${text}\n${tags}\nmood:${mood} energy:${energy}\n${cueStr}`;
}
