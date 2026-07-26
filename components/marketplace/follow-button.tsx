"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FollowButton({ initialFollowers }: { initialFollowers: number }) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant={following ? "secondary" : "default"}
        size="sm"
        onClick={() => setFollowing((v) => !v)}
        className="gap-1.5"
      >
        {following ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {following ? "Following" : "Follow"}
      </Button>
      <span className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {(initialFollowers + (following ? 1 : 0)).toLocaleString()}
        </span>{" "}
        followers
      </span>
    </div>
  );
}
