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

  const [error, setError] =
    useState("");

  

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setEmail(user.email ?? "");
    }

    loadUser();
  }, [router]);


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
            setSummary(
              data.summary ?? null,
            );
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


  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/");
  }


  async function handleGetVideo() {
    setError("");
    setVideo(null);
    setSummary(null);
    setJob(null);

    if (!youtubeUrl.trim()) {
      setError(
        "Please enter a YouTube URL.",
      );
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
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">


        <div className="mb-10 flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold">
              YouTube AI Summarizer
            </h1>

            <p className="mt-2 text-gray-400">
              Logged in as {email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded bg-white px-5 py-2 font-medium text-black hover:bg-gray-200"
          >
            Logout
          </button>

        </div>


        <section className="rounded-xl border border-gray-800 bg-gray-950 p-6">

          <h2 className="mb-4 text-xl font-semibold">
            Summarize a YouTube video
          </h2>

          <div className="flex gap-3">

            <input
              className="flex-1 rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-gray-400"
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
              className="rounded-lg bg-white px-6 py-3 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
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


        {video && (
          <section className="mt-8 rounded-xl border border-gray-800 bg-gray-950 p-6">

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
                  <p className="mt-2 text-gray-400">
                    {video.channel_title}
                  </p>
                )}

                {video.published_at && (
                  <p className="mt-1 text-sm text-gray-500">
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
                  className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingSummary
                    ? "Creating job..."
                    : "Generate Summary"}
                </button>

              </div>

            </div>

          </section>
        )}


        {job && (
          <section className="mt-8 rounded-xl border border-gray-800 bg-gray-950 p-6">

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
              <p className="mt-3 text-gray-400">
                Your summary job is waiting
                in the Redis queue.
              </p>
            )}

            {job.status === "processing" && (
              <p className="mt-3 text-gray-400">
                Worker is generating your
                summary...
              </p>
            )}

            {job.status === "completed" && (
              <p className="mt-3 text-green-400">
                Summary generated successfully.
              </p>
            )}

            {job.status === "failed" && (
              <p className="mt-3 text-red-400">
                Summary generation failed.
              </p>
            )}

          </section>
        )}



        {summary && (
          <section className="mt-8 space-y-8">

            

            <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">

              <h2 className="text-2xl font-semibold">
                Executive Summary
              </h2>

              <p className="mt-4 leading-7 text-gray-300">
                {summary.executive_summary}
              </p>

            </div>

            

            {summary.chapters.length > 0 && (
              <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">

                <h2 className="text-2xl font-semibold">
                  Chapters
                </h2>

                <div className="mt-6 space-y-6">

                  {summary.chapters.map(
                    (chapter, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-gray-700 pl-4"
                      >

                        <p className="text-sm text-blue-400">
                          {chapter.timestamp}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          {chapter.title}
                        </h3>

                        <p className="mt-2 text-gray-400">
                          {chapter.summary}
                        </p>

                      </div>
                    ),
                  )}

                </div>

              </div>
            )}

            

            {summary.key_concepts.length > 0 && (
              <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">

                <h2 className="text-2xl font-semibold">
                  Key Concepts
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">

                  {summary.key_concepts.map(
                    (concept, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-800 p-4"
                      >

                        <p className="text-sm text-blue-400">
                          {concept.timestamp}
                        </p>

                        <h3 className="mt-1 font-semibold">
                          {concept.concept}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-400">
                          {concept.explanation}
                        </p>

                      </div>
                    ),
                  )}

                </div>

              </div>
            )}

            

            {summary.actionable_insights.length > 0 && (
              <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">

                <h2 className="text-2xl font-semibold">
                  Actionable Insights
                </h2>

                <ul className="mt-5 list-disc space-y-3 pl-6 text-gray-300">

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

            

            {summary.key_quotes.length > 0 && (
              <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">

                <h2 className="text-2xl font-semibold">
                  Key Quotes
                </h2>

                <div className="mt-5 space-y-4">

                  {summary.key_quotes.map(
                    (quote, index) => (
                      <blockquote
                        key={index}
                        className="border-l-2 border-gray-600 pl-4"
                      >

                        <p className="italic text-gray-300">
                          "{quote.quote}"
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
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