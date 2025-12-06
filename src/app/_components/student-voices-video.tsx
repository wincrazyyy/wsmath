// app/_components/student-voices-video.tsx
"use client";

// Placeholder for now
const VIDEO_SRC = "/video/student-voices.mp4";
const VIDEO_POSTER = "/video/student-voices-poster.jpg";

export function StudentVoicesVideo() {
  return (
    <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Student voices
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
            Real students talking about their WSMath journey
          </h3>
          <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
            Short clips from different students sharing how they improved with Winson’s coaching.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-black/90">
        <div className="relative aspect-video w-full">
          <video
            src={VIDEO_SRC}
            poster={VIDEO_POSTER}
            controls
            className="h-full w-full object-cover object-center"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
