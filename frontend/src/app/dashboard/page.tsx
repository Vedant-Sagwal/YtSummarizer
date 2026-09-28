"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";

type VideoMetadata = {
  video_id: string;
  title?: string;
  description?: string;
  channel_title?: string;
  published_at?: string;
  thumbnail?: string;
};

type JobResponse = {
  job_id: string;
  video_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  error_message?: string;
  summary?: SummaryResult;
};

type Chapter = {
  timestamp: string;
  title: string;
  summary: string;
};

type KeyConcept = {
  timestamp: string;
  concept: string;
  explanation: string;
};

type KeyQuote = {
  timestamp: string;
  quote: string;
};

type SummaryResult = {
  executive_summary: string;
  chapters: Chapter[];
  key_concepts: KeyConcept[];
  actionable_insights: string[];
  key_quotes: KeyQuote[];
};

export default function Dashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [video, setVideo] =
    useState<VideoMetadata | null>(null);

  const [job, setJob] =
    useState<JobResponse | null>(null);

  const [summary, setSummary] =
    useState<SummaryResult | null>(null);

  const [loadingVideo, setLoadingVideo] =
    useState(false);

  const [creatingSummary, setCreatingSummary] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * Authentication + theme
   */
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");
    }

    loadUser();

    const savedTheme =
      localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, [router]);
  // function toggleTheme() {
  //   const newDarkMode = !darkMode;

  //   setDarkMode(newDarkMode);

  //   if (newDarkMode) {
  //     document.documentElement.classList.add("dark");
  //     localStorage.setItem("theme", "dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //     localStorage.setItem("theme", "light");
  //   }
    // }

  useEffect(() => {
    if (!job?.job_id) {
      return;
    }

    if (
      job.status === "completed" ||
      job.status === "failed"
    ) {
      return;
    }

    const interval = setInterval(
      async () => {
        try {
          const response = await apiFetch(
            `/api/jobs/${job.job_id}`,
          );

          const data: JobResponse =
            await response.json();

          setJob(data);

          if (data.status === "completed") {
            setSummary(data.summary ?? null);
          }

          if (data.status === "failed") {
            setError(
              data.error_message ||
                "Summary generation failed.",
            );
          }
        } catch (err) {
          console.error(
            "Failed to check job:",
            err,
          );
        }
      },
      2000,
    );

    return () => {
      clearInterval(interval);
    };
  }, [job?.job_id, job?.status]);

  /*
   * Logout
   */
  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/");
  }

  /*
   * Get YouTube video
   */
  async function handleGetVideo() {
    setError("");
    setVideo(null);
    setSummary(null);
    setJob(null);

    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }

    setLoadingVideo(true);

    try {
      const response = await apiFetch(
        "/api/videos",
        {
          method: "POST",
          body: JSON.stringify({
            youtube_url: youtubeUrl,
          }),
        },
      );

      const data: VideoMetadata =
        await response.json();

      setVideo(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to get video.",
      );
    } finally {
      setLoadingVideo(false);
    }
  }

  /*
   * Generate summary
   */
  async function handleGenerateSummary() {
    if (!video?.video_id) {
      return;
    }

    setError("");
    setSummary(null);
    setCreatingSummary(true);

    try {
      const response = await apiFetch(
        `/api/videos/${video.video_id}/summary`,
        {
          method: "POST",
        },
      );

      const data: JobResponse =
        await response.json();

      setJob(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create summary job.",
      );
    } finally {
      setCreatingSummary(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between">

          <div>
          <button
            onClick={() => {router.push("/")}}
            className="text-4xl font-bold transition hover:opacity-70">
            Auxiliator          
          </button>

            <p className="mt-2 opacity-60">
              Logged in as {email}
            </p>
          </div>

          <div className="flex items-center gap-3">

            

            <button
              onClick={handleLogout}
              className="
                rounded-lg
                bg-[var(--button)]
                px-5
                py-2.5
                font-medium
                text-[var(--button-text)]
                transition
                hover:opacity-90
              "
            >
              Logout
            </button>

          </div>

        </div>

        {/* Input */}
        <section
          className="
            rounded-xl
            border
            border-[var(--foreground)]
            bg-[var(--card)]
            p-6
          "
        >

          <h2 className="mb-4 text-xl font-semibold">
            Summarize a YouTube video
          </h2>

          <div className="flex gap-3">

            <input
              className="
                flex-1
                rounded-lg
                border
                border-[var(--foreground)]
                bg-transparent
                px-4
                py-3
                outline-none
              "
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) =>
                setYoutubeUrl(e.target.value)
              }
            />

            <button
              onClick={handleGetVideo}
              disabled={loadingVideo}
              className="
                rounded-lg
                bg-[var(--button)]
                px-6
                py-3
                font-medium
                text-[var(--button-text)]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loadingVideo
                ? "Loading..."
                : "Get Video"}
            </button>

          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

        </section>

        {/* Video */}
        {video && (
          <section
            className="
              mt-8
              rounded-xl
              border
              border-[var(--foreground)]
              bg-[var(--card)]
              p-6
            "
          >

            <div className="flex gap-6">

              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.title ?? "YouTube video"}
                  className="w-64 rounded-lg object-cover"
                />
              )}

              <div className="flex-1">

                <h2 className="text-2xl font-semibold">
                  {video.title}
                </h2>

                {video.channel_title && (
                  <p className="mt-2 opacity-60">
                    {video.channel_title}
                  </p>
                )}

                {video.published_at && (
                  <p className="mt-1 text-sm opacity-50">
                    {new Date(
                      video.published_at,
                    ).toLocaleDateString()}
                  </p>
                )}

                <button
                  onClick={
                    handleGenerateSummary
                  }
                  disabled={creatingSummary}
                  className="
                    mt-6
                    rounded-lg
                    bg-blue-600
                    px-6
                    py-3
                    font-medium
                    text-white
                    hover:bg-blue-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {creatingSummary
                    ? "Creating job..."
                    : "Generate Summary"}
                </button>

              </div>

            </div>

          </section>
        )}

        {/* Job status */}
        {job && (
          <section
            className="
              mt-8
              rounded-xl
              border
              border-[var(--foreground)]
              bg-[var(--card)]
              p-6
            "
          >

            <h2 className="text-xl font-semibold">
              Summary Status
            </h2>

            <div className="mt-4 flex items-center gap-3">

              <div
                className={`h-3 w-3 rounded-full ${
                  job.status === "completed"
                    ? "bg-green-500"
                    : job.status === "failed"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              />

              <span className="capitalize">
                {job.status}
              </span>

            </div>

            {job.status === "queued" && (
              <p className="mt-3 opacity-60">
                Your summary job is waiting in the Redis queue.
              </p>
            )}

            {job.status === "processing" && (
              <p className="mt-3 opacity-60">
                Worker is generating your summary...
              </p>
            )}

            {job.status === "completed" && (
              <p className="mt-3 text-green-500">
                Summary generated successfully.
              </p>
            )}

            {job.status === "failed" && (
              <p className="mt-3 text-red-500">
                Summary generation failed.
              </p>
            )}

          </section>
        )}

        {/* Summary */}
        {summary && (
          <section className="mt-8 space-y-8">

            {/* Executive Summary */}
            <div
              className="
                rounded-xl
                border
                border-[var(--foreground)]
                bg-[var(--card)]
                p-6
              "
            >

              <h2 className="text-2xl font-semibold">
                Executive Summary
              </h2>

              <p className="mt-4 leading-7 opacity-80">
                {summary.executive_summary}
              </p>

            </div>

            {/* Chapters */}
            {summary.chapters.length > 0 && (
              <div
                className="
                  rounded-xl
                  border
                  border-[var(--foreground)]
                  bg-[var(--card)]
                  p-6
                "
              >

                <h2 className="text-2xl font-semibold">
                  Chapters
                </h2>

                <div className="mt-6 space-y-6">

                  {summary.chapters.map(
                    (chapter, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-[var(--foreground)] pl-4"
                      >

                        <p className="text-sm text-blue-500">
                          {chapter.timestamp}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          {chapter.title}
                        </h3>

                        <p className="mt-2 opacity-60">
                          {chapter.summary}
                        </p>

                      </div>
                    ),
                  )}

                </div>

              </div>
            )}

            {/* Key Concepts */}
            {summary.key_concepts.length > 0 && (
              <div
                className="
                  rounded-xl
                  border
                  border-[var(--foreground)]
                  bg-[var(--card)]
                  p-6
                "
              >

                <h2 className="text-2xl font-semibold">
                  Key Concepts
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">

                  {summary.key_concepts.map(
                    (concept, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-[var(--foreground)] p-4"
                      >

                        <p className="text-sm text-blue-500">
                          {concept.timestamp}
                        </p>

                        <h3 className="mt-1 font-semibold">
                          {concept.concept}
                        </h3>

                        <p className="mt-2 text-sm leading-6 opacity-60">
                          {concept.explanation}
                        </p>

                      </div>
                    ),
                  )}

                </div>

              </div>
            )}

            {/* Actionable Insights */}
            {summary.actionable_insights.length > 0 && (
              <div
                className="
                  rounded-xl
                  border
                  border-[var(--foreground)]
                  bg-[var(--card)]
                  p-6
                "
              >

                <h2 className="text-2xl font-semibold">
                  Actionable Insights
                </h2>

                <ul className="mt-5 list-disc space-y-3 pl-6 opacity-80">

                  {summary.actionable_insights.map(
                    (insight, index) => (
                      <li key={index}>
                        {insight}
                      </li>
                    ),
                  )}

                </ul>

              </div>
            )}

            {/* Key Quotes */}
            {summary.key_quotes.length > 0 && (
              <div
                className="
                  rounded-xl
                  border
                  border-[var(--foreground)]
                  bg-[var(--card)]
                  p-6
                "
              >

                <h2 className="text-2xl font-semibold">
                  Key Quotes
                </h2>

                <div className="mt-5 space-y-4">

                  {summary.key_quotes.map(
                    (quote, index) => (
                      <blockquote
                        key={index}
                        className="border-l-2 border-[var(--foreground)] pl-4"
                      >

                        <p className="italic opacity-80">
                          "{quote.quote}"
                        </p>

                        <p className="mt-2 text-sm opacity-50">
                          {quote.timestamp}
                        </p>

                      </blockquote>
                    ),
                  )}

                </div>

              </div>
            )}

          </section>
        )}

      </div>
    </main>
  );
}