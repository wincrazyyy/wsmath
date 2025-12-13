// app/admin/_components/editors/json-editor.tsx
"use client";

import { useState } from "react";
import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { getByPath, setByPath } from "@/app/admin/_lib/json-path";
import {
  IMAGE_UPLOAD_TARGETS,
  type ImageUploadTarget,
} from "@/app/admin/_lib/image-upload-targets";
import { JsonEditorTabConfig, toStringArray } from "@/app/admin/_lib/json-editor-helpers";
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
    const uploadTarget: ImageUploadTarget | undefined =
      IMAGE_UPLOAD_TARGETS[keyWithSlug] ?? IMAGE_UPLOAD_TARGETS[field.path];

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
        />
      );
    }

    // string[]
    const arr = toStringArray(raw);
    return (
      <textarea
        className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        rows={5}
        value={arr.join("\n")}
        onChange={(e) => handleChange(field, e.target.value)}
      />
    );
  };

  // ----- select visible fields + panel copy -----

  let visibleFields: FieldConfig[] = fields;
  let panelTitle = title;
  let panelDescription = description ?? "";

  if (hasTabs) {
    const allTabs = tabs!;
    const activeTab =
      allTabs.find((t) => t.key === activeTabKey) ?? allTabs[0];

    const subTabs = activeTab.subTabs ?? [];
    const activeSubKey =
      subTabs.length > 0
        ? activeSubTabByParent[activeTab.key] ?? subTabs[0].key
        : undefined;

    const activeSubTab =
      subTabs.length > 0
        ? subTabs.find((s) => s.key === activeSubKey) ?? subTabs[0]
        : undefined;

    if (subTabs.length > 0 && activeSubTab) {
      visibleFields = activeSubTab.fields;
      panelTitle =
        activeSubTab.panelTitle ??
        activeTab.panelTitle ??
        panelTitle;
      panelDescription =
        activeSubTab.panelDescription ??
        activeTab.panelDescription ??
        panelDescription;
    } else {
      visibleFields = activeTab.fields ?? [];
      panelTitle = activeTab.panelTitle ?? panelTitle;
      panelDescription = activeTab.panelDescription ?? panelDescription;
    }
  }

  return (
    <div className="mt-6">
      {/* Top-level heading */}
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      )}

      {/* Tabs + sub-tabs */}
      {hasTabs && (
        <div className="mt-6 space-y-2">
          {/* Parent tabs */}
          <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1 text-xs font-medium">
            {tabs!.map((tab) => {
              const isActive = tab.key === activeTabKey;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTabKey(tab.key);
                    if (tab.subTabs && tab.subTabs.length > 0) {
                      setActiveSubTabByParent((prev) => ({
                        ...prev,
                        [tab.key]: prev[tab.key] ?? tab.subTabs![0].key,
                      }));
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

          {/* Sub-tabs for active parent */}
          {(() => {
            const active =
              tabs!.find((t) => t.key === activeTabKey) ?? tabs![0];
            const subTabs = active.subTabs ?? [];
            const activeSubKey =
              subTabs.length > 0
                ? activeSubTabByParent[active.key] ?? subTabs[0].key
                : undefined;

            if (subTabs.length === 0) return null;

            return (
              <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1 text-[11px] font-medium">
                {subTabs.map((sub) => {
                  const isActive = sub.key === activeSubKey;
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      onClick={() =>
                        setActiveSubTabByParent((prev) => ({
                          ...prev,
                          [active.key]: sub.key,
                        }))
                      }
                      className={`rounded-full px-3 py-1 transition ${
                        isActive
                          ? "bg-neutral-900 text-white shadow-sm"
                          : "text-neutral-600 hover:bg-white"
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Fields section */}
      {hasTabs ? (
        // Tabbed layout: single panel + 2-column grid
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
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

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {visibleFields.map((field) => (
              <section key={field.path} className="md:col-span-1">
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
        </div>
      ) : (
        // Non-tabbed layout: one card per field
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
          <h3 className="text-sm font-semibold text-neutral-900">
            JSON preview
          </h3>
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
