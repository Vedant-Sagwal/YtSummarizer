"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";

interface VideoMetadata {
  video_id?: string;
  id?: string;
  title?: string;
  channel_title?: string;
  channel?: string;
  description?: string;
  thumbnail?: string;
  thumbnail_url?: string;
}

interface SummaryJob {
  job_id?: string;
  id?: string;
  status?: string;
  message?: string;
}

export default function Dashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [video, setVideo] = useState<VideoMetadata | null>(null);

  const [job, setJob] = useState<SummaryJob | null>(null);

  const [error, setError] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);


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
      setLoading(false);
    }

    loadUser();
  }, [router]);

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }


  async function getVideo() {
    setError("");
    setVideo(null);
    setJob(null);

    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }

    try {
      setLoadingVideo(true);

      const response = await apiFetch("/api/videos", {
        method: "POST",
        body: JSON.stringify({
          youtube_url: youtubeUrl.trim(),
        }),
      });

      const data = await response.json();

      console.log("Video metadata:", data);

      setVideo(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to get video information."
      );
    } finally {
      setLoadingVideo(false);
    }
  }


  async function generateSummary() {
    setError("");

    const videoId =
      video?.video_id ??
      video?.id;

    if (!videoId) {
      setError("Video ID not found.");
      return;
    }

    try {
      setLoadingSummary(true);

      console.log("Generating summary for:", videoId);

      const response = await apiFetch(
        `/api/videos/${videoId}/summary`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log("Summary job:", data);

      setJob(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate summary."
      );
    } finally {
      setLoadingSummary(false);
    }
  }


  if (loading) {
    return (
      <main className="p-8">
        <p>Loading...</p>
      </main>
    );
  }

  

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              YouTube AI Summarizer
            </h1>

            <p className="mt-2 text-gray-500">
              Logged in as: {email}
            </p>
          </div>

          <button
            className="rounded bg-black px-4 py-2 text-white"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        

        <div className="mt-12 rounded-lg border p-6">

          <h2 className="text-xl font-semibold">
            Summarize a YouTube Video
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Paste a YouTube video URL below.
          </p>

          <div className="mt-6 flex gap-3">

            <input
              className="flex-1 rounded border p-3"
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) =>
                setYoutubeUrl(e.target.value)
              }
              disabled={
                loadingVideo ||
                loadingSummary
              }
            />

            <button
              className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
              onClick={getVideo}
              disabled={
                loadingVideo ||
                loadingSummary
              }
            >
              {loadingVideo
                ? "Loading..."
                : "Get Video"}
            </button>

          </div>

        </div>

        

        {error && (
          <div className="mt-6 rounded border border-red-400 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        

        {video && (
          <div className="mt-6 rounded-lg border p-6">

            <h2 className="text-xl font-semibold">
              Video
            </h2>

            <div className="mt-4">

              {video.thumbnail_url && (
                <img
                  src={video.thumbnail_url}
                  alt="Video thumbnail"
                  className="mb-4 max-w-sm rounded"
                />
              )}

              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt="Video thumbnail"
                  className="mb-4 max-w-sm rounded"
                />
              )}

              <p className="font-medium">
                {video.title ?? "YouTube Video"}
              </p>

              {(video.channel_title ||
                video.channel) && (
                <p className="mt-1 text-sm text-gray-500">
                  {video.channel_title ??
                    video.channel}
                </p>
              )}

            </div>

            <button
              className="mt-6 rounded bg-black px-5 py-3 text-white disabled:opacity-50"
              onClick={generateSummary}
              disabled={loadingSummary}
            >
              {loadingSummary
                ? "Creating Summary..."
                : "Generate Summary"}
            </button>

          </div>
        )}

        

        {job && (
          <div className="mt-6 rounded-lg border p-6">

            <h2 className="text-xl font-semibold">
              Summary Job
            </h2>

            <div className="mt-4 space-y-2">

              {job.job_id && (
                <p>
                  <span className="font-medium">
                    Job ID:
                  </span>{" "}
                  {job.job_id}
                </p>
              )}

              {job.id && !job.job_id && (
                <p>
                  <span className="font-medium">
                    Job ID:
                  </span>{" "}
                  {job.id}
                </p>
              )}

              {job.status && (
                <p>
                  <span className="font-medium">
                    Status:
                  </span>{" "}
                  {job.status}
                </p>
              )}

              {job.message && (
                <p className="text-gray-500">
                  {job.message}
                </p>
              )}

            </div>

          </div>
        )}

      </div>
    </main>
  );
}