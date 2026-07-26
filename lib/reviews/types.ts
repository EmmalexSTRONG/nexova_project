export interface ReviewPhoto {
  id: string;
  dataUrl: string;
}

export interface SellerReply {
  text: string;
  repliedAt: string;
  shopName: string;
}

export interface SubmittedReview {
  id: string;
  productSlug: string;
  shopSlug: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string;
  text: string;
  photos: ReviewPhoto[];
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface ReviewEngagement {
  likes: string[];
  helpfulVotes: string[];
  sellerReply?: SellerReply;
}

// Unified shape rendered by ReviewCard, merging seed (static mock) reviews,
// submitted reviews, and their engagement overlay into one consistent type.
export interface DisplayReview {
  id: string;
  productSlug: string;
  shopSlug?: string;
  customerName: string;
  location?: string;
  rating: number;
  title?: string;
  text: string;
  photos: ReviewPhoto[];
  createdAtLabel: string;
  sortKey: number;
  verifiedPurchase: boolean;
  likeCount: number;
  helpfulCount: number;
  likedByMe: boolean;
  markedHelpfulByMe: boolean;
  sellerReply?: SellerReply;
}
