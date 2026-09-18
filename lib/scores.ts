export interface ScoreEntry {
  game: string;
  score: number;
  name: string;
  at: number;
}

export function saveScore(entry: Omit<ScoreEntry, "at">): void {
  try {
    const all = JSON.parse(localStorage.getItem("av_scores") || "[]");
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem("av_scores", JSON.stringify(all));
  } catch {}
}
