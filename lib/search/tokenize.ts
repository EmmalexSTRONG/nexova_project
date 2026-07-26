// Shared query tokenizer for the site's lightweight keyword search (product,
// service, and FAQ matching) — strips punctuation, drops short/common words
// that would otherwise produce false-positive matches on nearly every query.
const SEARCH_STOPWORDS = new Set([
  "the", "a", "an", "for", "and", "with", "under", "over", "good", "best",
  "recommend", "suggest", "some", "any", "me", "please", "want", "need",
  "looking", "find", "show", "get", "buy", "your", "you", "can", "what",
  "how", "do", "does", "is", "are", "to", "of", "in", "on", "my", "have",
  // short connector words — kept separate from the length filter below so
  // meaningful short terms (AC, TV, PC) aren't discarded along with these
  "at", "by", "up", "no", "so", "as", "if", "or", "it", "be", "i",
]);

// A handful of common conversational-vs-catalog word mismatches. Customers
// say "fix my AC" or "teach me computers"; listings are written as "repair"
// or "training" — plain substring matching misses these entirely without a
// (deliberately small, curated) synonym expansion.
const SYNONYMS: Record<string, string[]> = {
  fix: ["repair"],
  fixing: ["repair"],
  broken: ["repair"],
  repair: ["fix"],
  clean: ["cleaning"],
  install: ["installation", "setup"],
  installation: ["install"],
  teach: ["tutoring", "training", "classes"],
  tutor: ["tutoring", "classes", "lessons"],
  lessons: ["tutoring", "training"],
  photo: ["photography"],
  photos: ["photography"],
  makeup: ["beauty"],
  computer: ["laptop"],
  laptop: ["computer"],
  phone: ["smartphone", "mobile"],
  mobile: ["smartphone", "phone"],
  tv: ["television"],
};

export function tokenizeQuery(query: string): string[] {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 1 && !SEARCH_STOPWORDS.has(term));

  const expanded = terms.flatMap((term) => [term, ...(SYNONYMS[term] ?? [])]);
  return Array.from(new Set(expanded));
}

// Substring containment works fine for longer terms ("clean" inside
// "cleaning"), but short terms need a real word-boundary match — otherwise
// "ac" silently matches inside "account", "package", "track", etc. Returns
// how many of the given terms were found in the haystack.
export function scoreMatch(terms: string[], haystack: string): number {
  return terms.reduce((sum, term) => {
    if (term.length <= 3) {
      return sum + (new RegExp(`\\b${term}\\b`).test(haystack) ? 1 : 0);
    }
    return sum + (haystack.includes(term) ? 1 : 0);
  }, 0);
}
