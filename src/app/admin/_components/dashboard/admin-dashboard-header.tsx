// src/app/admin/_components/dashboard/admin-dashboard-header.tsx

type SaveStatus = "idle" | "success" | "error";

type AdminDashboardHeaderProps = {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  onSaveAll: () => void;
};

export function AdminDashboardHeader({
  isSaving,
  hasUnsavedChanges,
  saveStatus,
  saveError,
  onSaveAll,
}: AdminDashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Edit homepage, About, testimonials, packages, and misc content.
          When you&apos;re ready, publish all changes in one go.
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={onSaveAll}
          disabled={isSaving}
          className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {isSaving ? "Saving all…" : "Save all changes"}
          {hasUnsavedChanges && !isSaving && (
            <span className="ml-2 h-2 w-2 rounded-full bg-amber-400" />
          )}
        </button>

        {hasUnsavedChanges && !isSaving && (
          <p className="text-[11px] text-amber-600">
            You have unsaved changes (content or images). Remember to click{" "}
            <span className="font-semibold">
              &quot;Save all changes&quot;
            </span>
            .
          </p>
        )}

        {saveStatus === "success" && !hasUnsavedChanges && (
          <p className="text-[11px] text-emerald-600">
            Saved. Cloudflare will redeploy with all updates in a single
            commit.
          </p>
        )}
        {saveStatus === "error" && (
          <p className="text-[11px] text-red-600">
            {saveError || "Failed to save changes."}
          </p>
        )}
      </div>
    </div>
  );
}
