import { useState } from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import type { Category } from "../../types";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Input } from "../ui/Input";
import { PageHeader } from "../ui/PageHeader";
import { Panel } from "../ui/Panel";

export default function AdminCategories({
  categories,
  statsCategoryCount,
  onChangeCategory,
  onRenameCategory,
  onDeleteCategory,
}: {
  categories: Category[];
  statsCategoryCount: string;
  onChangeCategory: (categoryName: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (category: Category) => void;
}) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);

  const submitCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onChangeCategory(trimmed);
      setName("");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.categoryName);
  };

  const submitRename = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onRenameCategory(id, trimmed);
      setEditingId(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        titleAs="h2"
        title="Categories"
        description="Create and manage the product categories used across the store."
      />

      <Panel className="p-4 sm:p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitCreate();
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="admin-new-category"
              className="mb-1.5 block text-sm font-medium text-ink-2"
            >
              New category
            </label>
            <Input
              id="admin-new-category"
              value={name}
              placeholder="Category name, for example Electronics"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={busy}
            loadingLabel="Adding…"
            disabled={!name.trim() || busy}
            className="sm:w-40"
          >
            <Plus aria-hidden className="size-4" />
            Add category
          </Button>
        </form>
      </Panel>

      <Panel>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">
            All categories
          </h2>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{statsCategoryCount}</span> total
          </p>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No categories yet"
            direction="Create your first category using the form above."
          />
        ) : (
          <ul className="divide-y divide-line">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-pine-soft text-sm font-semibold text-pine">
                  {category.categoryName[0]?.toUpperCase() ?? "?"}
                </span>

                {editingId === category.id ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <Input
                      autoFocus
                      aria-label={`Rename ${category.categoryName}`}
                      className="h-10 max-w-sm flex-1"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") submitRename(category.id);
                        if (event.key === "Escape") setEditingId(null);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="solid"
                      loading={busy}
                      disabled={!editName.trim() || busy}
                      onClick={() => submitRename(category.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {category.categoryName}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title={`Rename ${category.categoryName}`}
                        aria-label={`Rename ${category.categoryName}`}
                        onClick={() => startEdit(category)}
                      >
                        <Pencil aria-hidden className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="danger"
                        title={`Delete ${category.categoryName}`}
                        aria-label={`Delete ${category.categoryName}`}
                        onClick={() => onDeleteCategory(category)}
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
