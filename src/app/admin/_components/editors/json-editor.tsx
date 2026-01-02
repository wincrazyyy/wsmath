// app/admin/_components/editors/json-editor.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { getByPath, setByPath } from "@/app/admin/_lib/json-path";
import {
  resolveImageUploadTarget,
  type ImageUploadTarget,
  type ResolvedImageUploadTarget,
} from "@/app/admin/_lib/image-upload-targets";
import {
  JsonEditorTabConfig,
  toStringArray,
} from "@/app/admin/_lib/json-editor-helpers";
import { TableInput } from "./table-input";
import { ImageUploadInput } from "./image-upload-input";
import { MultiImageUploadInput } from "./multi-image-upload-input";

export type JsonEditorProps<T extends object> = {
  title: string;
  description?: string;
  data: T;

  /** Used when there are no tabs */
  fields?: FieldConfig[];

  /** For backwards compatibility – still required to turn tabs on */
  enableTabs?: boolean;
  tabs?: JsonEditorTabConfig[];

  jsonFileHint?: string;
  slug?: string;
  onChangeData: (next: T) => void;
};

export function JsonEditor<T extends object>({
  title,
  description,
  data,
  fields = [],
  enableTabs,
  tabs,
  jsonFileHint = "",
  slug,
  onChangeData,
}: JsonEditorProps<T>) {
  const hasTabs = !!enableTabs && !!tabs && tabs.length > 0;

  const [draftByPath, setDraftByPath] = useState<Record<string, string>>({});

  // ----- state for parent + sub-tabs -----

  const [activeTabKey, setActiveTabKey] = useState<string | undefined>(
    hasTabs ? tabs![0].key : undefined,
  );

  const [activeSubTabByParent, setActiveSubTabByParent] = useState<
    Record<string, string | undefined>
  >(() => {
    if (!hasTabs) return {};
    const initial: Record<string, string | undefined> = {};
    for (const tab of tabs!) {
      if (tab.subTabs && tab.subTabs.length > 0) {
        initial[tab.key] = tab.subTabs[0].key;
      }
    }
    return initial;
  });

  // ----- change helpers -----

  const handleChange = (field: FieldConfig, rawValue: string) => {
    const next = structuredClone(data) as T;

    if (field.type === "string" || field.type === "textarea") {
      setByPath(next, field.path, rawValue);
    } else if (field.type === "string[]") {
      const arr = rawValue
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      setByPath(next, field.path, arr);
    }

    onChangeData(next);
  };

  const renderFieldInput = (field: FieldConfig) => {
    const keyWithSlug = slug ? `${slug}.${field.path}` : field.path;
    const resolved: ResolvedImageUploadTarget | null =
      resolveImageUploadTarget(keyWithSlug) ??
      resolveImageUploadTarget(field.path);

    const uploadTarget: ImageUploadTarget | undefined = resolved?.target;

    // image upload integration
    if (uploadTarget) {
      if (uploadTarget.mode === "multi" && field.type === "string[]") {
        return (
          <MultiImageUploadInput<T>
            field={field}
            target={uploadTarget}
            data={data}
            onChangeData={onChangeData}
          />
        );
      }

      return (
        <ImageUploadInput<T>
          field={field}
          target={uploadTarget}
          data={data}
          onChangeData={onChangeData}
          forcedPublicPath={resolved?.forcedPublicPath}
          forcedFileName={resolved?.forcedFileName}
          allowDelete={!!uploadTarget.allowDelete}
        />
      );
    }

    const raw = getByPath(data, field.path);

    if (field.type === "string") {
      const value = typeof raw === "string" ? raw : "";
      return (
        <input
          type="text"
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      );
    }

    if (field.type === "textarea") {
      const value = typeof raw === "string" ? raw : "";
      return (
        <textarea
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          rows={4}
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          onKeyDownCapture={(e) => {
            if (e.key === "Enter") e.stopPropagation();
          }}
        />
      );
    }

    if (field.type === "string[]") {
      const arr = toStringArray(raw);
      const canonical = arr.join("\n");
      const draft = draftByPath[field.path];
      const value = typeof draft === "string" ? draft : canonical;

      return (
        <textarea
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          rows={5}
          value={value}
          onChange={(e) => {
            const text = e.target.value;
            setDraftByPath((prev) => ({ ...prev, [field.path]: text }));
            handleChange(field, text);
          }}
          onBlur={() => {
            setDraftByPath((prev) => {
              const next = { ...prev };
              delete next[field.path];
              return next;
            });
          }}
        />
      );
    }

    if (field.type === "table") {
      return (
        <TableInput<T>
          field={field}
          data={data}
          onChangeData={onChangeData}
        />
      );
    }

    if (field.type === "boolean") {
      const value = typeof raw === "boolean" ? raw : false;

      return (
        <label className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900">
          <input
            type="checkbox"
            className="h-4 w-4 accent-violet-600"
            checked={value}
            onChange={(e) => {
              const next = structuredClone(data) as T;
              setByPath(next, field.path, e.target.checked);
              onChangeData(next);
            }}
          />
          <span className="text-sm">{field.checkboxLabel}</span>
        </label>
      );
    }

    return null;
  };

  const renderFieldsGrid = (list: FieldConfig[]) => {
    if (!list || list.length === 0) return null;

    const isFullWidth = (field: FieldConfig) => {
      return (
        field.type !== "string" &&
        field.type !== "textarea" &&
        field.type !== "string[]"
      );
    };

    return (
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {list.map((field) => (
          <section
            key={field.path}
            className={isFullWidth(field) ? "md:col-span-2" : "md:col-span-1"}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-neutral-900">
                  {field.label}
                </h4>
                {field.description && (
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {field.description}
                  </p>
                )}
              </div>
              <code className="rounded bg-neutral-100 px-2 py-1 text-[10px] text-neutral-500">
                {field.path}
              </code>
            </div>

            <div className="mt-2">{renderFieldInput(field)}</div>
          </section>
        ))}
      </div>
    );
  };

  // ----- choose active tab + subtab -----

  const activeTab: JsonEditorTabConfig | undefined = hasTabs
    ? tabs!.find((t) => t.key === activeTabKey) ?? tabs![0]
    : undefined;

  const subTabs = activeTab?.subTabs ?? [];
  const activeSubKey =
    subTabs.length > 0
      ? activeSubTabByParent[activeTab!.key] ?? subTabs[0].key
      : undefined;

  const activeSubTab =
    subTabs.length > 0
      ? subTabs.find((s) => s.key === activeSubKey) ?? subTabs[0]
      : undefined;

  // Base fields always visible for that tab
  const baseFields = hasTabs ? activeTab?.fields ?? [] : fields;
  // Sub-tab fields swap below
  const subFields = hasTabs ? activeSubTab?.fields ?? [] : [];
  // Add sub tab optional
  const addCfg = hasTabs ? activeTab?.subTabAdd : undefined;

  const panelTitle = hasTabs ? activeTab?.panelTitle ?? title : title;

  const panelDescription = hasTabs
    ? activeTab?.panelDescription ?? (description ?? "")
    : description ?? "";

  function handleAddSubTab() {
    if (!activeTab || !addCfg) return;

    const next = structuredClone(data) as T;

    const raw = getByPath(next, addCfg.listPath);
    const arr = Array.isArray(raw) ? [...raw] : [];

    if (typeof addCfg.maxItems === "number" && arr.length >= addCfg.maxItems)
      return;

    arr.push(structuredClone(addCfg.defaultItem));
    setByPath(next, addCfg.listPath, arr);

    onChangeData(next);

    const newIndex = arr.length - 1;
    const newKey = `${addCfg.listPath}[${newIndex}]`;

    setActiveSubTabByParent((prev) => ({
      ...prev,
      [activeTab.key]: newKey,
    }));
  }

  function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function parseIndexFromSubKey(
    subKey: string,
    listPath: string,
  ): number | null {
    const re = new RegExp(`^${escapeRegExp(listPath)}\\[(\\d+)\\]$`);
    const m = subKey.match(re);
    if (!m) return null;
    const idx = Number(m[1]);
    return Number.isFinite(idx) ? idx : null;
  }

  function handleDeleteSubTab() {
    if (!activeTab || !addCfg) return;
    if (!activeSubKey) return;

    const idx = parseIndexFromSubKey(activeSubKey, addCfg.listPath);
    if (idx === null) return;

    const ok = window.confirm("Delete this item? This cannot be undone.");
    if (!ok) return;

    const next = structuredClone(data) as T;

    const raw = getByPath(next, addCfg.listPath);
    const arr = Array.isArray(raw) ? [...raw] : [];

    if (idx < 0 || idx >= arr.length) return;

    arr.splice(idx, 1);
    setByPath(next, addCfg.listPath, arr);

    onChangeData(next);

    const nextKey =
      arr.length === 0
        ? undefined
        : `${addCfg.listPath}[${Math.min(idx, arr.length - 1)}]`;

    setActiveSubTabByParent((prev) => ({
      ...prev,
      [activeTab.key]: nextKey,
    }));
  }

  // ----- Sub-tab strip UX helpers (scroll + prev/next) -----

  const activeSubBtnRef = useRef<HTMLButtonElement | null>(null);

  const activeSubIndex = subTabs.findIndex((s) => s.key === activeSubKey);
  const activeSubNumber = activeSubIndex >= 0 ? activeSubIndex + 1 : 1;

  useEffect(() => {
    // Smooth scroll active subtab into view when it changes (desktop strip)
    if (activeSubBtnRef.current) {
      activeSubBtnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeSubKey]);

  const goPrev = () => {
    if (!activeTab || subTabs.length === 0) return;
    const idx = Math.max(0, (activeSubIndex >= 0 ? activeSubIndex : 0) - 1);
    const key = subTabs[idx]!.key;
    setActiveSubTabByParent((prev) => ({ ...prev, [activeTab.key]: key }));
  };

  const goNext = () => {
    if (!activeTab || subTabs.length === 0) return;
    const idx = Math.min(
      subTabs.length - 1,
      (activeSubIndex >= 0 ? activeSubIndex : 0) + 1,
    );
    const key = subTabs[idx]!.key;
    setActiveSubTabByParent((prev) => ({ ...prev, [activeTab.key]: key }));
  };

  return (
    <div className="mt-6">
      {/* Top-level heading */}
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      )}

      {/* Parent tabs ONLY */}
      {hasTabs && (
        <div className="mt-6">
          <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1 text-xs font-medium">
            {tabs!.map((tab) => {
              const isActive = tab.key === activeTabKey;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTabKey(tab.key);
                    if (tab.subTabs?.length) {
                      setActiveSubTabByParent((prev) => {
                        const prevKey = prev[tab.key];
                        const exists =
                          prevKey &&
                          tab.subTabs!.some((s) => s.key === prevKey);
                        return {
                          ...prev,
                          [tab.key]: exists ? prevKey : tab.subTabs![0].key,
                        };
                      });
                    }
                  }}
                  className={`rounded-full px-4 py-1.5 transition ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fields section */}
      {hasTabs ? (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                {panelTitle}
              </h3>
              {panelDescription && (
                <p className="mt-1 text-xs text-neutral-500">
                  {panelDescription}
                </p>
              )}
            </div>
            {jsonFileHint && (
              <p className="text-[11px] text-neutral-400">
                Backed by{" "}
                <code className="rounded bg-neutral-100 px-1 py-0.5">
                  {jsonFileHint}
                </code>
              </p>
            )}
          </div>

          {/* Base fields always visible */}
          {renderFieldsGrid(baseFields)}

          {/* Sub-tabs */}
          {subTabs.length > 0 && (
            <div className="mt-6 border-t border-neutral-200 pt-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h4 className="text-base font-semibold text-neutral-900">
                    {activeSubTab?.panelTitle ?? "Items"}
                  </h4>
                  {activeSubTab?.panelDescription && (
                    <p className="mt-1 text-xs text-neutral-500">
                      {activeSubTab.panelDescription}
                    </p>
                  )}
                </div>

                {/* Controls: mobile dropdown + desktop strip (no visible scrollbar) + add/delete */}
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
                    <div className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                      Sub Tabs
                    </div>

                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={subTabs.length <= 1 || activeSubIndex <= 0}
                      className={[
                        "shrink-0 rounded-md border px-2 py-1 text-xs font-semibold transition",
                        subTabs.length <= 1 || activeSubIndex <= 0
                          ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                      ].join(" ")}
                      aria-label="Previous item"
                      title="Previous"
                    >
                      ‹
                    </button>

                    {/* Mobile: dropdown */}
                    <div className="min-w-0 flex-1 lg:hidden">
                      <label className="sr-only" htmlFor="subtab-select">
                        Select item
                      </label>
                      <select
                        id="subtab-select"
                        value={activeSubKey ?? ""}
                        onChange={(e) => {
                          const key = e.target.value;
                          if (!activeTab) return;
                          setActiveSubTabByParent((prev) => ({
                            ...prev,
                            [activeTab.key]: key,
                          }));
                        }}
                        className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs font-semibold text-neutral-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      >
                        {subTabs.map((sub) => (
                          <option key={sub.key} value={sub.key}>
                            {sub.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Desktop: scroll strip, scrollbar hidden */}
                    <div
                      className={[
                        "hidden min-w-0 flex-1 overflow-x-auto lg:block",
                        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                      ].join(" ")}
                    >
                      <div className="flex w-max items-center gap-1 rounded-lg bg-neutral-100 p-1">
                        {subTabs.map((sub) => {
                          const isActive = sub.key === activeSubKey;
                          return (
                            <button
                              key={sub.key}
                              ref={(el) => {
                                if (isActive) activeSubBtnRef.current = el;
                              }}
                              type="button"
                              onClick={() => {
                                if (!activeTab) return;
                                setActiveSubTabByParent((prev) => ({
                                  ...prev,
                                  [activeTab.key]: sub.key,
                                }));
                              }}
                              className={`min-w-[2.25rem] snap-center rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                isActive
                                  ? "bg-neutral-900 text-white shadow"
                                  : "text-neutral-700 hover:bg-white"
                              }`}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={goNext}
                      disabled={
                        subTabs.length <= 1 ||
                        activeSubIndex >= subTabs.length - 1
                      }
                      className={[
                        "shrink-0 rounded-md border px-2 py-1 text-xs font-semibold transition",
                        subTabs.length <= 1 ||
                        activeSubIndex >= subTabs.length - 1
                          ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                      ].join(" ")}
                      aria-label="Next item"
                      title="Next"
                    >
                      ›
                    </button>

                    <div className="shrink-0 text-[11px] font-medium text-neutral-500">
                      {activeSubNumber}/{subTabs.length}
                    </div>
                  </div>

                  {/* Add / Delete */}
                  {addCfg && (
                    <>
                      <button
                        type="button"
                        onClick={handleAddSubTab}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
                      >
                        + {addCfg.buttonLabel ?? "Add"}
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteSubTab}
                        disabled={subTabs.length === 0 || !activeSubKey}
                        className={[
                          "rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm transition",
                          subTabs.length === 0 || !activeSubKey
                            ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                            : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
                        ].join(" ")}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {renderFieldsGrid(subFields)}
            </div>
          )}

          {subTabs.length === 0 && addCfg && (
            <div className="mt-6 border-t border-neutral-200 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-semibold text-neutral-900">
                    Items
                  </h4>
                  <p className="mt-1 text-xs text-neutral-500">
                    No items yet. Click Add to create one.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSubTab}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
                >
                  + {addCfg.buttonLabel ?? "Add"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Non-tabbed layout
        <div className="mt-6 grid gap-6">
          {fields.map((field) => (
            <section
              key={field.path}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {field.label}
                  </h3>
                  {field.description && (
                    <p className="mt-1 text-xs text-neutral-600">
                      {field.description}
                    </p>
                  )}
                </div>
                <code className="rounded bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">
                  {field.path}
                </code>
              </div>

              <div className="mt-3">{renderFieldInput(field)}</div>
            </section>
          ))}
        </div>
      )}

      {/* JSON preview */}
      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">JSON preview</h3>
          {jsonFileHint && !hasTabs && (
            <p className="text-[11px] text-neutral-500">
              Backed by <code>{jsonFileHint}</code>
            </p>
          )}
        </div>
        <pre className="mt-3 max-h-80 overflow-auto bg-neutral-900 p-3 text-[0.75rem] leading-relaxed text-neutral-50">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
