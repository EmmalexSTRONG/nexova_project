"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { MockCategory } from "@/lib/data";
import { categoryIconMap } from "@/lib/icon-map";
import { addCategory, deleteCategory, updateCategory } from "@/lib/admin/category-store";
import { confirmAndDelete } from "@/lib/shared/confirm-delete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// "HeartPulse" -> "Heart Pulse" — reads more naturally to a screen reader
// than the raw PascalCase Lucide icon identifier.
function humanizeIconName(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2");
}

const ICON_NAMES = Object.keys(categoryIconMap);

export function AdminCategoryForm({ category, nextSortOrder = 0 }: { category?: MockCategory; nextSortOrder?: number }) {
  const router = useRouter();
  const isEdit = Boolean(category);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState<string | undefined>(category?.image);
  const [icon, setIcon] = useState<string>(category?.icon ?? ICON_NAMES[0]);
  const [isActive, setIsActive] = useState<boolean>(category?.isActive !== false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
      setError("Enter a category name.");
      return;
    }
    if (!image) {
      setError("Upload an image for this category.");
      return;
    }

    setSubmitting(true);

    if (isEdit && category) {
      updateCategory(category.slug, { name, icon, image, isActive });
      router.push("/admin/categories");
      router.refresh();
      return;
    }

    addCategory({
      id: `cat-${Date.now()}`,
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      icon,
      image,
      productCount: 0,
      isActive,
      sortOrder: nextSortOrder,
    });

    router.push("/admin/categories");
    router.refresh();
  }

  function handleDelete() {
    if (!category) return;
    confirmAndDelete(`Delete "${category.name}"?`, () => {
      deleteCategory(category.slug);
      router.push("/admin/categories");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5 border-b pb-6">
        <Label>Category image</Label>
        <div className="mt-1.5">
          <AdminImageUpload image={image} onChange={setImage} label="Upload image" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="e.g. Toys & Games" defaultValue={category?.name} required />
      </div>

      <div className="space-y-1.5">
        <Label id="icon-label">Icon</Label>
        <div
          role="radiogroup"
          aria-labelledby="icon-label"
          className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12"
          onKeyDown={(event) => {
            if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
            event.preventDefault();
            const currentIndex = ICON_NAMES.indexOf(icon);
            const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
            setIcon(ICON_NAMES[(currentIndex + direction + ICON_NAMES.length) % ICON_NAMES.length]);
          }}
        >
          {ICON_NAMES.map((name) => {
            const IconComponent = categoryIconMap[name];
            const selected = icon === name;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={humanizeIconName(name)}
                tabIndex={selected ? 0 : -1}
                onClick={() => setIcon(name)}
                className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  selected ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <IconComponent className="h-4.5 w-4.5" strokeWidth={1.75} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
        <Label htmlFor="isActive" className="cursor-pointer font-normal">
          Active — visible to shoppers across the site
        </Label>
      </div>

      <div className="flex items-center justify-between gap-2">
        {isEdit ? (
          <Button type="button" variant="ghost" onClick={handleDelete} className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete category
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Add category"}
          </Button>
        </div>
      </div>
    </form>
  );
}
