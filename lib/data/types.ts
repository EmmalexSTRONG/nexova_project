export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide-react icon name
  image: string; // representative product photo, shown on category cards
  productCount: number;
  isActive?: boolean; // default true when absent
  sortOrder?: number; // default = array index when absent
}

export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";

export type ProductCondition = "NEW" | "REFURBISHED" | "USED";

export type InventoryChangeType = "RESTOCK" | "SALE" | "RETURN" | "ADJUSTMENT";

export interface InventoryLogEntry {
  id: string;
  productSlug: string;
  changeType: InventoryChangeType;
  quantityDelta: number;
  note: string;
  occurredAtLabel: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  shopSlug: string;
  shopName: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  isFlashSale?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  stockPercent?: number; // for flash sale urgency bars
  image?: string; // representative real photo (the "big" cover image); falls back to placeholder art when absent (e.g. vendor drafts)
  seed: number; // drives the deterministic placeholder art (also the cover image)
  galleryImageSeeds: number[]; // additional seeds for the PDP gallery, [0] mirrors `seed`
  galleryImages?: string[]; // real photos for the PDP gallery's "small" thumbnails; when absent, every slot falls back to reusing `image`
  sku: string;
  brand: string;
  model?: string;
  description: string;
  specifications: ProductSpecification[];
  warranty?: string; // undefined = not applicable (e.g. consumables)
  condition: ProductCondition;
  status: ProductStatus;
  stockLevel: number;
}

export interface BusinessHour {
  day: string;
  hours: string; // e.g. "8:00 AM – 6:00 PM", or "Closed"
}

export interface StorePolicy {
  title: string;
  description: string;
}

export interface ShopSellerDetails {
  ownerName: string;
  memberSince: number; // year
  responseRate: number; // percent
  responseTime: string; // e.g. "Within 2 hours"
}

export interface ShopLocation {
  addressLine: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
}

export interface MockShop {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categorySlug: string;
  location: ShopLocation;
  rating: number;
  productCount: number;
  followers: number;
  verified: boolean;
  seed: number;
  bannerSeed: number;
  image?: string; // representative real photo; falls back to placeholder art when absent
  phone: string;
  whatsapp: string;
  email: string;
  businessHours: BusinessHour[];
  policies: StorePolicy[];
  seller: ShopSellerDetails;
}

export interface MockShopReview {
  id: string;
  shopSlug: string;
  customerName: string;
  location: string;
  rating: number;
  text: string;
  createdAtLabel: string; // e.g. "2 weeks ago"
  seed: number;
}

export interface MockService {
  id: string;
  slug: string;
  name: string;
  category: string;
  providerName: string;
  description: string;
  price: number;
  currency: string;
  durationLabel: string;
  rating: number;
  reviewCount: number;
  phone: string;
  whatsapp: string;
  email: string;
  seed: number;
  image?: string; // representative real photo; falls back to placeholder art when absent
}

export interface MockReview {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  text: string;
  productName: string;
  seed: number;
}

export interface MockProductReview {
  id: string;
  productSlug: string;
  customerName: string;
  location: string;
  rating: number;
  text: string;
  createdAtLabel: string;
  verifiedPurchase: boolean;
  seed: number;
}

export type BlogPostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";

export interface MockBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  author: string;
  seed: number;
  image?: string; // representative real photo; falls back to placeholder art when absent
  content: string[]; // article body, one entry per paragraph
  status: BlogPostStatus;
  scheduledAt?: string; // ISO timestamp; when in the past, an admin-scheduled post is treated as published
  publishedAt?: string; // ISO timestamp, set once a post first becomes published
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
