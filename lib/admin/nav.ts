import {
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  FileText,
  LayoutGrid,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Newspaper,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
      { href: "/admin/vendors", label: "Shops", icon: Store },
      { href: "/admin/services", label: "Services", icon: Wrench },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/coupons", label: "Coupons", icon: Tag },
      { href: "/admin/flash-sales", label: "Flash Sales", icon: Zap },
      { href: "/admin/advertisements", label: "Advertisements", icon: Megaphone },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/permissions", label: "Permissions", icon: ShieldCheck },
      { href: "/admin/reports", label: "Reports", icon: FileText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];
