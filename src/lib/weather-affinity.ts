type Cues = Partial<{
  weather: "clear" | "cloudy" | "rain" | "cold" | "hot" | "night" | "day";
  good_outdoor_brief: boolean;
  good_outdoor_sheltered: boolean;
  good_window_nature: boolean;
}>;

export function weatherAffinity(tags: string[] = [], cues: Cues = {}) {
  const set = new Set(tags.map(t => t.toLowerCase()));
  let score = 0;

  // Positive matches
  if (cues.good_outdoor_brief && (set.has("outdoor") || set.has("brief"))) score += 0.04;
  if (cues.good_outdoor_brief && (set.has("sunlight") || set.has("nature") || set.has("look_far"))) score += 0.02;

  if (cues.good_outdoor_sheltered && set.has("outdoor") && (set.has("sheltered") || set.has("doorway") || set.has("porch") || set.has("rain_listen")))
    score += 0.05;

  if (cues.good_window_nature && (set.has("window_nature") || set.has("indoor") || set.has("light")))
    score += 0.04;

  // Gentle down-weights
  if (!cues.good_outdoor_brief && set.has("outdoor") && !set.has("sheltered")) score -= 0.04; // avoid full outdoor when not ideal
  if (cues.weather === "night" && set.has("sunlight")) score -= 0.03;
  if (cues.weather === "rain" && !set.has("sheltered") && set.has("outdoor")) score -= 0.04;

  return score; // typically between -0.06 … +0.08
}
