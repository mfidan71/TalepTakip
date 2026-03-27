import { Sparkles, TrendingUp, Bug, Server, Palette, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  className: string;
  bgClassName: string;
}

export const CATEGORIES: string[] = [
  "Yeni Özellik",
  "İyileştirme",
  "Hata Düzeltme",
  "Altyapı",
  "Tasarım",
  "Diğer",
];

export const categoryConfig: Record<string, CategoryConfig> = {
  "Yeni Özellik": {
    label: "Yeni Özellik",
    icon: Sparkles,
    className: "text-emerald-600 dark:text-emerald-400",
    bgClassName: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  "İyileştirme": {
    label: "İyileştirme",
    icon: TrendingUp,
    className: "text-blue-600 dark:text-blue-400",
    bgClassName: "bg-blue-100 text-blue-700 border-blue-200",
  },
  "Hata Düzeltme": {
    label: "Hata Düzeltme",
    icon: Bug,
    className: "text-red-600 dark:text-red-400",
    bgClassName: "bg-red-100 text-red-700 border-red-200",
  },
  "Altyapı": {
    label: "Altyapı",
    icon: Server,
    className: "text-amber-600 dark:text-amber-400",
    bgClassName: "bg-amber-100 text-amber-700 border-amber-200",
  },
  "Tasarım": {
    label: "Tasarım",
    icon: Palette,
    className: "text-purple-600 dark:text-purple-400",
    bgClassName: "bg-purple-100 text-purple-700 border-purple-200",
  },
  "Diğer": {
    label: "Diğer",
    icon: MoreHorizontal,
    className: "text-gray-600 dark:text-gray-400",
    bgClassName: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

export const getCategoryConfig = (category: string): CategoryConfig =>
  categoryConfig[category] ?? categoryConfig["Diğer"];
