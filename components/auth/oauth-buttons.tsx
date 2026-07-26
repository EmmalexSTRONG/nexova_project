import { signIn } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";

export function OAuthButtons({ callbackUrl = "/account" }: { callbackUrl?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: callbackUrl });
        }}
      >
        <Button type="submit" variant="outline" size="lg" className="w-full">
          Google
        </Button>
      </form>
      <form
        action={async () => {
          "use server";
          await signIn("facebook", { redirectTo: callbackUrl });
        }}
      >
        <Button type="submit" variant="outline" size="lg" className="w-full">
          Facebook
        </Button>
      </form>
    </div>
  );
}
