import { Button } from "@/components/ui/button";
import { signOutAction, signOutAllDevicesAction } from "@/lib/auth/actions";

export function SignOutButton({ allDevices = false }: { allDevices?: boolean }) {
  return (
    <form action={allDevices ? signOutAllDevicesAction : signOutAction}>
      <Button type="submit" variant="outline" size="sm">
        {allDevices ? "Sign out everywhere" : "Sign out"}
      </Button>
    </form>
  );
}
