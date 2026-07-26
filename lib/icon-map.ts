import {
  Smartphone,
  Shirt,
  Sofa,
  Sparkles,
  ShoppingBasket,
  Baby,
  Laptop,
  Dumbbell,
  Car,
  HeartPulse,
  BookOpen,
  Palette,
  Store,
  Wrench,
  Scissors,
  Camera,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

export const categoryIconMap: Record<string, LucideIcon> = {
  Smartphone,
  Shirt,
  Sofa,
  Sparkles,
  ShoppingBasket,
  Baby,
  Laptop,
  Dumbbell,
  Car,
  HeartPulse,
  BookOpen,
  Palette,
};

const categorySlugIconMap: Record<string, LucideIcon> = {
  "phones-electronics": Smartphone,
  "fashion-apparel": Shirt,
  "home-kitchen": Sofa,
  "beauty-personal-care": Sparkles,
  "groceries-food": ShoppingBasket,
  "baby-kids": Baby,
  computing: Laptop,
  "sports-outdoors": Dumbbell,
  automotive: Car,
  "health-wellness": HeartPulse,
  "books-stationery": BookOpen,
  "arts-crafts": Palette,
};

export function getCategoryIcon(categorySlug: string): LucideIcon {
  return categorySlugIconMap[categorySlug] ?? Sparkles;
}

// Prefers the category's own admin-editable `icon` field (a categoryIconMap
// key); falls back to the legacy per-slug map for categories without one.
export function getCategoryIconForCategory(category: { slug: string; icon?: string }): LucideIcon {
  if (category.icon && categoryIconMap[category.icon]) return categoryIconMap[category.icon];
  return getCategoryIcon(category.slug);
}

export const shopIcon: LucideIcon = Store;
export const blogIcon: LucideIcon = Newspaper;

const serviceIcons: LucideIcon[] = [Wrench, Sparkles, Scissors, Sofa, Camera, Laptop];

export function getServiceIcon(seed: number): LucideIcon {
  return serviceIcons[seed % serviceIcons.length];
}
