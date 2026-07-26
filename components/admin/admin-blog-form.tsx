"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { MockBlogPost } from "@/lib/data";
import { addAdminBlogPost, deleteBlogPost, saveBlogPostEdit, updateAdminBlogPost } from "@/lib/admin/blog-store";
import { addBlogCategory, getBlogCategories } from "@/lib/admin/blog-categories-store";
import { confirmAndDelete } from "@/lib/shared/confirm-delete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { OptionPicker } from "@/components/shared/option-picker";

const SELECT_CLASSNAME =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toDatetimeLocalValue(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

type StatusChoice = "DRAFT" | "SCHEDULED" | "PUBLISHED";

export function AdminBlogForm({
  post,
  isAdminCreated = false,
}: {
  post?: MockBlogPost;
  isAdminCreated?: boolean;
}) {
  const router = useRouter();
  const isEdit = Boolean(post);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState<string | undefined>(post?.image);
  const [categories, setCategories] = useState<string[]>(() => getBlogCategories());
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [statusChoice, setStatusChoice] = useState<StatusChoice>(post?.status ?? "DRAFT");
  const [scheduledAtInput, setScheduledAtInput] = useState(toDatetimeLocalValue(post?.scheduledAt));

  const defaultCategory = useMemo(() => post?.category ?? categories[0] ?? "", [post, categories]);

  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    addBlogCategory(trimmed);
    setCategories(getBlogCategories());
    setNewCategory("");
    setShowAddCategory(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const excerpt = String(formData.get("excerpt") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const readMinutes = Number(formData.get("readMinutes"));
    const contentRaw = String(formData.get("content") ?? "").trim();

    if (!title || !excerpt || !category || !author || !contentRaw) {
      setError("Please fill in the title, excerpt, category, author, and content.");
      return;
    }
    if (statusChoice === "SCHEDULED" && !scheduledAtInput) {
      setError("Choose a date and time to schedule this post.");
      return;
    }

    const content = contentRaw
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const scheduledAt = statusChoice === "SCHEDULED" ? new Date(scheduledAtInput).toISOString() : undefined;
    const publishedAt = statusChoice === "PUBLISHED" ? (post?.publishedAt ?? now) : undefined;

    setSubmitting(true);

    const patch: Partial<MockBlogPost> = {
      title,
      excerpt,
      category,
      author,
      readMinutes: Number.isFinite(readMinutes) && readMinutes > 0 ? readMinutes : 1,
      content,
      image,
      status: statusChoice,
      scheduledAt,
      publishedAt,
      updatedAt: now,
    };

    if (isEdit && post) {
      if (isAdminCreated) {
        updateAdminBlogPost(post.slug, patch);
      } else {
        saveBlogPostEdit(post.slug, patch);
      }
      router.push("/admin/blog");
      router.refresh();
      return;
    }

    const seed = Math.floor(Math.random() * 1_000_000);
    addAdminBlogPost({
      id: `blog-${Date.now()}`,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      seed,
      createdAt: now,
      ...patch,
    } as MockBlogPost);

    router.push("/admin/blog");
    router.refresh();
  }

  function handleDelete() {
    if (!post) return;
    confirmAndDelete(`Delete "${post.title}"? This can't be undone.`, () => {
      deleteBlogPost(post.slug);
      router.push("/admin/blog");
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
        <Label>Featured image</Label>
        <div className="mt-1.5">
          <AdminImageUpload image={image} onChange={setImage} label="Upload featured image" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="e.g. How to Shop Smart During Flash Sales" defaultValue={post?.title} required />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            placeholder="A short teaser shown on cards and the homepage..."
            defaultValue={post?.excerpt}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select id="category" name="category" className={SELECT_CLASSNAME} defaultValue={defaultCategory} required>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {showAddCategory ? (
            <div className="flex gap-2 pt-1.5">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="h-8 text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddCategory}>
                Add
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="h-3 w-3" />
              Add new category
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="author">Author</Label>
          <Input id="author" name="author" defaultValue={post?.author ?? "Nexora Editorial"} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="readMinutes">Read time (minutes)</Label>
          <Input id="readMinutes" name="readMinutes" type="number" min="1" step="1" defaultValue={post?.readMinutes ?? 4} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
            rows={10}
            placeholder="Write the article body here. Leave a blank line between paragraphs."
            defaultValue={post?.content.join("\n\n")}
            required
          />
          <p className="text-xs text-muted-foreground">Separate paragraphs with a blank line.</p>
        </div>
      </div>

      <div className="space-y-3 border-t pt-6">
        <Label>Publication</Label>
        <OptionPicker
          label="Publication"
          columns={3}
          value={statusChoice}
          onChange={setStatusChoice}
          options={[
            { value: "DRAFT", label: "Save as draft", description: "Not visible to shoppers" },
            { value: "SCHEDULED", label: "Schedule", description: "Auto-publishes at a set time" },
            { value: "PUBLISHED", label: "Publish now", description: "Live on the homepage & blog" },
          ]}
        />
        {statusChoice === "SCHEDULED" && (
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="scheduledAt">Publish at</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAtInput}
              onChange={(e) => setScheduledAtInput(e.target.value)}
              required
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {isEdit ? (
          <Button type="button" variant="ghost" onClick={handleDelete} className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete post
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
