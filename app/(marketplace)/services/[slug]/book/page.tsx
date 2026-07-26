import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/data";
import { auth } from "@/lib/auth/config";
import { BookingPageContent } from "@/components/booking/booking-page-content";

export const metadata: Metadata = {
  title: "Book a service — Nexora",
};

export default async function BookServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const session = await auth();

  return (
    <BookingPageContent
      service={service}
      defaultName={session?.user.name ?? undefined}
      defaultEmail={session?.user.email ?? undefined}
    />
  );
}
