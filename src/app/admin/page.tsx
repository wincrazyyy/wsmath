// src/app/admin/page.tsx
"use client";

import { useState } from "react";

import homeContent from "@/app/_lib/content/json/home.json";
import aboutContent from "@/app/_lib/content/json/about.json";
import packagesContent from "@/app/_lib/content/json/packages.json";
import testimonialsContent from "@/app/_lib/content/json/testimonials.json";
import miscContent from "@/app/_lib/content/json/misc.json";

import { HomeEditor } from "./_components/home-editor";
import { AboutEditor } from "./_components/about-editor";
import { MiscEditor } from "./_components/misc-editor";
import { TestimonialsEditor } from "./_components/testimonials-editor";
import { PackagesEditor } from "./_components/packages-editor";

import {
  getQueuedImageUploads,
  clearQueuedImageUploads,
} from "./_lib/pending-image-uploads";

type HomeContent = typeof homeContent;
type AboutContent = typeof aboutContent;
type PackagesContent = typeof packagesContent;
type TestimonialsContent = typeof testimonialsContent;
type MiscContent = typeof miscContent;

type TabKey = "home" | "about" | "testimonials" | "packages" | "misc";

const TABS: { key: TabKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "packages", label: "Packages" },
  { key: "testimonials", label: "Testimonials" },
  { key: "misc", label: "Misc" },
];

// Helper: ArrayBuffer -> base64 (matches server expectation)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  // btoa is available in browsers
  return btoa(binary);
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const [homeData, setHomeData] = useState<HomeContent>(homeContent);
  const [aboutData, setAboutData] = useState<AboutContent>(aboutContent);
  const [testimonialsData, setTestimonialsData] =
    useState<TestimonialsContent>(testimonialsContent);
  const [packagesData, setPackagesData] =
    useState<PackagesContent>(packagesContent);
  const [miscData, setMiscData] = useState<MiscContent>(miscContent);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setSaveError(null);

    try {
      // 1) Prepare JSON updates
      const updates = [
        { slug: "home", content: homeData },
        { slug: "about", content: aboutData },
        { slug: "testimonials", content: testimonialsData },
        { slug: "packages", content: packagesData },
        { slug: "misc", content: miscData },
      ];

      // 2) Read queued image uploads from memory
      const queued = getQueuedImageUploads();

      // 3) Convert each File -> base64
      const images = await Promise.all(
        queued.map(async (item) => {
          const arrayBuffer = await item.file.arrayBuffer();
          const contentBase64 = arrayBufferToBase64(arrayBuffer);
          return {
            targetPath: item.repoPath,   // e.g. "public/hero.png"
            contentBase64,               // PNG content (no data URI prefix)
          };
        }),
      );

      // 4) Send everything in one atomic request
      const resp = await fetch("/api/update-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates,
          images,
        }),
      });

      if (!resp.ok) {
        // try to read JSON error first
        let msg = "Failed to save all changes.";
        try {
          const json = await resp.json();
          if (json?.error || json?.detail) {
            msg = `${json.error || "Error"}: ${json.detail || ""}`;
          }
        } catch {
          const text = await resp.text().catch(() => "");
          if (text) msg = text;
        }
        console.error("Save all failed:", msg);
        setSaveStatus("error");
        setSaveError(msg);
      } else {
        setSaveStatus("success");
        setSaveError(null);
        // 5) Clear queue only on success
        clearQueuedImageUploads();
      }
    } catch (err) {
      console.error("Save all error:", err);
      setSaveStatus("error");
      setSaveError("Network or server error while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderActiveEditor = () => {
    if (activeTab === "home") {
      return (
        <HomeEditor<HomeContent>
          data={homeData}
          onChangeData={setHomeData}
        />
      );
    }

    if (activeTab === "about") {
      return (
        <AboutEditor<AboutContent>
          data={aboutData}
          onChangeData={setAboutData}
        />
      );
    }

    if (activeTab === "testimonials") {
      return (
        <TestimonialsEditor
          data={testimonialsData}
          onChangeData={setTestimonialsData}
        />
      );
    }

    if (activeTab === "packages") {
      return (
        <PackagesEditor<PackagesContent>
          data={packagesData}
          onChangeData={setPackagesData}
        />
      );
    }

    // misc
    return (
      <MiscEditor<MiscContent>
        data={miscData}
        onChangeData={setMiscData}
      />
    );
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header + Save all */}
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
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {isSaving ? "Saving all…" : "Save all changes"}
            </button>
            {saveStatus === "success" && (
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

        {/* Top nav tabs */}
        <div className="mt-8 inline-flex rounded-full border border-neutral-200 bg-white p-1 text-xs font-medium">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
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

        {/* Active editor */}
        <div className="mt-6">{renderActiveEditor()}</div>
      </div>
    </main>
  );
}
