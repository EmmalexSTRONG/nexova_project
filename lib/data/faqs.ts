import { tokenizeQuery, scoreMatch } from "@/lib/search/tokenize";

export interface MockFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqs: MockFaq[] = [
  {
    id: "faq-1",
    question: "How long does delivery take?",
    answer:
      "Delivery within Greater Accra usually takes 1–2 business days. Other regions take 2–7 business days depending on location — you'll see an exact estimate at checkout once you enter your address.",
    category: "Shipping",
  },
  {
    id: "faq-2",
    question: "What payment methods do you accept?",
    answer:
      "You can pay by card, bank transfer, or mobile money through Paystack or Flutterwave, or choose cash on delivery/pickup for most orders.",
    category: "Payments",
  },
  {
    id: "faq-3",
    question: "How do I track my order?",
    answer:
      "Go to My Orders in your account, or open the order confirmation email and click 'Track order'. You can also just give me your order number and I'll look it up for you.",
    category: "Orders",
  },
  {
    id: "faq-4",
    question: "Can I return a product?",
    answer:
      "Most items can be returned within 7 days of delivery in their original condition — exact policies vary a little by vendor, so check the store policies section on the shop's page.",
    category: "Returns",
  },
  {
    id: "faq-5",
    question: "How do I become a vendor on Nexora?",
    answer: "Click Register at the top of the site and choose 'Sell on Nexora' to start a vendor application.",
    category: "Vendors",
  },
  {
    id: "faq-6",
    question: "Is it safe to shop on Nexora?",
    answer:
      "Yes — payments are processed through Paystack and Flutterwave, both PCI-DSS compliant providers, and your card details never touch our servers directly.",
    category: "Trust & Safety",
  },
  {
    id: "faq-7",
    question: "How do I book a service like CCTV installation or tutoring?",
    answer:
      "Go to the Services page, pick a service, and click Book now. You'll choose a date and time, enter your details, and pay online or in person.",
    category: "Services",
  },
  {
    id: "faq-8",
    question: "What if my order arrives damaged?",
    answer:
      "Contact the vendor directly using the contact details on your order, or reach our support team — damaged items are eligible for a replacement or refund.",
    category: "Returns",
  },
  {
    id: "faq-9",
    question: "Do you deliver outside Ghana?",
    answer: "Not yet — Nexora currently only ships within Ghana.",
    category: "Shipping",
  },
  {
    id: "faq-10",
    question: "How do I apply a coupon code?",
    answer: "Enter your coupon code in the cart or at checkout, right below the order summary, and click Apply.",
    category: "Payments",
  },
  {
    id: "faq-11",
    question: "What is Nexora?",
    answer:
      "Nexora is a marketplace built for Ghana, connecting 3,000+ independent vendors across all 16 regions through a single, trusted checkout. Vendors keep full control of their own shop, pricing, and inventory — Nexora doesn't hold stock itself, so every listing ships directly from the vendor who made or sourced it.",
    category: "About",
  },
  {
    id: "faq-12",
    question: "What's the difference between an order and a booking?",
    answer:
      "An order is for a physical product bought from a vendor's shop. A booking is for a bookable local service (like home cleaning or AC repair) scheduled for a specific date and time. Order numbers look like MKT-YYYYMMDD-XXXXX, booking numbers look like BKG-YYYYMMDD-XXXXX — give me either and I'll look up its status.",
    category: "Orders",
  },
  {
    id: "faq-13",
    question: "Do I need an account to shop?",
    answer:
      "No — you can browse and check out as a guest. Creating an account just makes it easier to track orders, save items to your wishlist, and check out faster next time.",
    category: "Account",
  },
  {
    id: "faq-14",
    question: "How does the wishlist work?",
    answer:
      "Tap the heart icon on any product to save it to your wishlist for later. You'll find your saved items under the wishlist icon in the header, or in My Account.",
    category: "Account",
  },
  {
    id: "faq-15",
    question: "How do vendors advertise on Nexora?",
    answer:
      "Vendors can boost visibility with homepage banners, sponsored product placements, or a featured shop slot — priced per placement and booked directly from the Advertising section of the vendor dashboard.",
    category: "Vendors",
  },
  {
    id: "faq-16",
    question: "How do I contact support directly?",
    answer: "Email gokahemma1999@gmail.com, call 0550262636, or use the contact form on our Contact us page.",
    category: "Support",
  },
];

// Stopword-filtered tokens rather than every word longer than two
// characters — otherwise generic words like "need" or "how" (present in
// nearly every FAQ answer) would produce false-positive matches on
// unrelated questions. The question field counts double so a term that
// names the actual topic outranks one that only appears incidentally in
// the answer body.
function rankFaqs(query: string) {
  const terms = tokenizeQuery(query);
  if (terms.length === 0) return [];

  return faqs
    .map((faq) => {
      const question = faq.question.toLowerCase();
      const rest = `${faq.answer} ${faq.category}`.toLowerCase();
      const score = scoreMatch(terms, question) * 2 + scoreMatch(terms, rest);
      return { faq, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function searchFaqs(query: string): MockFaq[] {
  return rankFaqs(query).map((entry) => entry.faq);
}

// Used by the chat fallback responder to compare FAQ relevance against
// product/service search results — see search_faqs's topScore in tools.ts.
export function getFaqTopScore(query: string): number {
  return rankFaqs(query)[0]?.score ?? 0;
}
