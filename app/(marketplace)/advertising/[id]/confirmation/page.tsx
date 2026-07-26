import type { Metadata } from "next";
import { AdCampaignConfirmationContent } from "@/components/advertising/ad-campaign-confirmation-content";

export const metadata: Metadata = {
  title: "Ad purchase confirmation — Nexora",
};

export default async function AdCampaignConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdCampaignConfirmationContent campaignId={id} />;
}
