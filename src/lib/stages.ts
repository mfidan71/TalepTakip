export const STAGES = [
  { key: "talep", label: "Talep", color: "stage-talep" },
  { key: "degerlendirme", label: "Değerlendirme", color: "stage-degerlendirme" },
  { key: "planlama", label: "Planlama", color: "stage-planlama" },
  { key: "gelistirme", label: "Geliştirme", color: "stage-gelistirme" },
  { key: "test", label: "Test", color: "stage-test" },
  { key: "canli", label: "Canlı", color: "stage-canli" },
] as const;

export type StageKey = typeof STAGES[number]["key"];

export const getStageLabel = (key: string) =>
  STAGES.find((s) => s.key === key)?.label ?? key;

export const getStageColor = (key: string) =>
  STAGES.find((s) => s.key === key)?.color ?? "stage-talep";

export const CATEGORIES = [
  "Yeni Özellik",
  "İyileştirme",
  "Hata Düzeltme",
  "Altyapı",
  "Tasarım",
  "Diğer",
];
