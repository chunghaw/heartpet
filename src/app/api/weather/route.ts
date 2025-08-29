export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";

function deriveAffinity(c: any) {
  const t = Math.round(c?.temperature_2m ?? 0);
  const precip = (c?.precipitation ?? 0) > 0;
  const isDay = Boolean(c?.is_day);

  let tag: "clear" | "cloudy" | "rain" | "cold" | "hot" | "night" | "day" = "clear";
  if (!isDay) tag = "night";
  else if (precip) tag = "rain";
  else if (t <= 8) tag = "cold";
  else if (t >= 29) tag = "hot";
  else tag = "clear";

  const good_outdoor_brief = isDay && !precip && t >= 8 && t <= 30;   // 1–3 min outside OK
  const good_outdoor_sheltered = isDay && precip && t >= 5;                // doorway/porch/rain listen
  const good_window_nature = (!isDay || precip || t < 8 || t > 30);    // prefer window/indoor-nature

  return {
    temp_c: t, precip, daylight: isDay, weather: tag,
    good_outdoor_brief, good_outdoor_sheltered, good_window_nature
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) return NextResponse.json({ error: "missing_lat_lon" }, { status: 400 });

  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,is_day`,
    { cache: "no-store" }
  );
  const j = await r.json();
  return NextResponse.json(deriveAffinity(j?.current ?? {}));
}
