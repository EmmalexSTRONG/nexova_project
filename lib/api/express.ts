import type { ApiResult } from "@/types";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function expressFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  return (await res.json()) as ApiResult<T>;
}

export async function expressInternalFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  return expressFetch<T>(path, {
    ...init,
    headers: { "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "", ...init?.headers },
  });
}
