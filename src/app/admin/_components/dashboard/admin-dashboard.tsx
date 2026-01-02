// src/app/admin/_components/dashboard/admin-dashboard.tsx
"use client";

import { useState } from "react";

import homeContent from "@/app/_lib/content/json/home.json";
import aboutContent from "@/app/_lib/content/json/about.json";
import packagesContent from "@/app/_lib/content/json/packages.json";
import testimonialsContent from "@/app/_lib/content/json/testimonials.json";
import resultsContent from "@/app/_lib/content/json/results.json";
import faqContent from "@/app/_lib/content/json/faq.json";
import miscContent from "@/app/_lib/content/json/misc.json";

import { HomeEditor } from "../editors/home-editor";
import { AboutEditor } from "../editors/about-editor";
import { PackagesEditor } from "../editors/packages-editor";
import { TestimonialsEditor } from "../editors/testimonials-editor";
import { ResultsEditor } from "../editors/results-editor";
import { FaqEditor } from "../editors/faq-editor";
import { MiscEditor } from "../editors/misc-editor";

import {
  getQueuedImageUploads,
  clearQueuedImageUploads,
  type QueuedImageUpload,
} from "../../_lib/pending-image-uploads";

import type { TabKey } from "@/app/admin/_lib/admin-tabs-config";
import { AdminDashboardHeader } from "./admin-dashboard-header";
import { AdminTabs } from "./admin-tabs";

type HomeContent = typeof homeContent;
type AboutContent = typeof aboutContent;
type PackagesContent = typeof packagesContent;
type TestimonialsContent = typeof testimonialsContent;
type ResultsContent = typeof resultsContent;
type FaqContent = typeof faqContent;
type MiscContent = typeof miscContent;

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

// Type guard for the queue union
function isUpload(
  item: QueuedImageUpload,
): item is Extract<QueuedImageUpload, { kind: "upload" }> {
  return item.kind === "upload";
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const [homeData, setHomeData] = useState<HomeContent>(homeContent);
  const [aboutData, setAboutData] = useState<AboutContent>(aboutContent);
  const [packagesData, setPackagesData] =
    useState<PackagesContent>(packagesContent);
  const [testimonialsData, setTestimonialsData] =
    useState<TestimonialsContent>(testimonialsContent);
  const [resultsData, setResultsData] =
    useState<ResultsContent>(resultsContent);
  const [faqData, setFaqData] = useState<FaqContent>(faqContent);
  const [miscData, setMiscData] = useState<MiscContent>(miscContent);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  // Track whether *any* JSON fields have been edited since last successful save
  const [hasJsonChanges, setHasJsonChanges] = useState(false);

  // Wrap setters so we can mark JSON as dirty whenever an editor changes data
  const handleHomeChange = (next: HomeContent) => {
    setHomeData(next);
    setHasJsonChanges(true);
  };

  const handleAboutChange = (next: AboutContent) => {
    setAboutData(next);
    setHasJsonChanges(true);
  };

  const handlePackagesChange = (next: PackagesContent) => {
    setPackagesData(next);
    setHasJsonChanges(true);
  };

  const handleTestimonialsChange = (next: TestimonialsContent) => {
    setTestimonialsData(next);
    setHasJsonChanges(true);
  };

  const handleResultsChange = (next: ResultsContent) => {
    setResultsData(next);
    setHasJsonChanges(true);
  };

  const handleFaqChange = (next: FaqContent) => {
    setFaqData(next);
    setHasJsonChanges(true);
  };

  const handleMiscChange = (next: MiscContent) => {
    setMiscData(next);
    setHasJsonChanges(true);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setSaveError(null);

    try {
      // 1) Prepare JSON updates
      const updates = [
        { slug: "home", content: homeData },
        { slug: "about", content: aboutData },
        { slug: "packages", content: packagesData },
        { slug: "testimonials", content: testimonialsData },
        { slug: "results", content: resultsData },
        { slug: "faq", content: faqData },
        { slug: "misc", content: miscData },
      ];

      // 2) Read queued image ops from memory (upload/delete)
      const queued = getQueuedImageUploads();

      // 3) Convert queue -> API payload (uploads become base64, deletes become delete:true)
      const images = await Promise.all(
        queued.map(async (item) => {
          if (item.kind === "delete") {
            return {
              targetPath: item.repoPath, // e.g. "public/avatars/x.png"
              delete: true,
            };
          }

          // upload
          const arrayBuffer = await item.file.arrayBuffer();
          const contentBase64 = arrayBufferToBase64(arrayBuffer);

          return {
            targetPath: item.repoPath, // e.g. "public/hero.png"
            contentBase64,
          };
        }),
      );

      // 4) Send everything in one atomic request
      const resp = await fetch("/api/update-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates,
          images: images.length > 0 ? images : undefined,
        }),
      });

      if (!resp.ok) {
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
        clearQueuedImageUploads();
        setHasJsonChanges(false);
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
        <HomeEditor<HomeContent> data={homeData} onChangeData={handleHomeChange} />
      );
    }

    if (activeTab === "about") {
      return (
        <AboutEditor<AboutContent> data={aboutData} onChangeData={handleAboutChange} />
      );
    }

    if (activeTab === "packages") {
      return (
        <PackagesEditor<PackagesContent>
          data={packagesData}
          onChangeData={handlePackagesChange}
        />
      );
    }

    if (activeTab === "testimonials") {
      return (
        <TestimonialsEditor data={testimonialsData} onChangeData={handleTestimonialsChange} />
      );
    }

    if (activeTab === "results") {
      return <ResultsEditor data={resultsData} onChangeData={handleResultsChange} />;
    }

    if (activeTab === "faq") {
      return <FaqEditor data={faqData} onChangeData={handleFaqChange} />;
    }

    // misc
    return <MiscEditor<MiscContent> data={miscData} onChangeData={handleMiscChange} />;
  };

  // unsaved changes: json dirty OR any queued image ops (upload/delete)
  const queuedNow = getQueuedImageUploads();
  const hasQueuedImages = queuedNow.length > 0;
  const hasUnsavedChanges = hasJsonChanges || hasQueuedImages;

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <AdminDashboardHeader
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          saveStatus={saveStatus}
          saveError={saveError}
          onSaveAll={handleSaveAll}
        />

        <AdminTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        <div className="mt-6">{renderActiveEditor()}</div>
      </div>
    </main>
  );
}
