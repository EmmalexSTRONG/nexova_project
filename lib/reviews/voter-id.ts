const VOTER_ID_KEY = "nexora:voter-id:v1";

// An anonymous per-browser identity for likes/helpful votes, since there's
// no live account system to key engagement off of — mirrors the "single
// browser simulates all actors" model used for orders and push subscriptions
// elsewhere in this app.
export function getVoterId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(VOTER_ID_KEY);
  if (!id) {
    id = `voter-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(VOTER_ID_KEY, id);
  }
  return id;
}
