import type { SessionSummary } from "@/types";
import { auth } from "@/lib/auth/config";
import { expressFetch } from "@/lib/api/express";
import { revokeSessionAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export async function SessionsList() {
  const session = await auth();
  if (!session?.accessToken) return null;

  const result = await expressFetch<SessionSummary[]>("/auth/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  if (!result.success) {
    return <p className="text-sm text-muted-foreground">Couldn&apos;t load active sessions.</p>;
  }

  return (
    <ul className="space-y-3">
      {result.data.map((s) => (
        <SessionRow key={s.id} session={s} />
      ))}
    </ul>
  );
}

function SessionRow({ session }: { session: SessionSummary }) {
  return (
    <li className="flex items-center justify-between rounded-md border p-3 text-sm">
      <div>
        <p className="font-medium">
          {session.userAgent ?? "Unknown device"} {session.current && <span className="text-primary">(this device)</span>}
        </p>
        <p className="text-muted-foreground">
          {session.ipAddress ?? "Unknown IP"} · last used {new Date(session.lastUsedAt).toLocaleString()}
        </p>
      </div>
      {!session.current && (
        <form
          action={async () => {
            "use server";
            await revokeSessionAction(session.id);
          }}
        >
          <Button type="submit" variant="ghost" size="sm">
            Revoke
          </Button>
        </form>
      )}
    </li>
  );
}
