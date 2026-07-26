import { auth } from "@/lib/auth/config";
import { AdminSettingsContent } from "@/components/admin/admin-settings-content";

export default async function AdminSettingsPage() {
  const session = await auth();
  return <AdminSettingsContent userName={session?.user.name ?? ""} userEmail={session?.user.email ?? ""} />;
}
