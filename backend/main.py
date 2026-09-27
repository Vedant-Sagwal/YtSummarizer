from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from services.youtube import get_video_metadata
from services.youtube_url import extract_video_id
from services.transcript_pipeline import get_normalized_transcript

from queue1 import summary_queue
from tasks import process_summary_job

# You already have your Supabase client
from services.supabase import supabase


app = FastAPI(
    title="YT Summarizer API",
    version="0.1.0",
)


class VideoRequest(BaseModel):
    youtube_url: str


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "backend",
    }


@app.post("/api/videos")
async def get_video(video: VideoRequest):

    video_id = extract_video_id(
        video.youtube_url
    )

    if not video_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL",
        )

    metadata = await get_video_metadata(
        video_id
    )

    if metadata is None:
        raise HTTPException(
            status_code=404,
            detail="YouTube video not found",
        )

    return metadata


@app.get("/api/videos/{video_id}/transcript")
def get_video_transcript(video_id: str):

    try:

        return get_normalized_transcript(
            video_id
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Transcript processing failed: {str(e)}",
        )


@app.post("/api/videos/{video_id}/summary")
async def summarize_video(
    video_id: str,
    user_id: str,
):

    try:

        # --------------------------------
        # 1. Create job in Supabase
        # --------------------------------

        job_response = supabase.table(
            "summary_jobs"
        ).insert({
            "user_id": user_id,
            "video_id": video_id,
            "status": "queued",
        }).execute()

        if not job_response.data:
            raise Exception(
                "Failed to create summary job"
            )

        job = job_response.data[0]

        job_id = job["id"]

        print(
            f"Created summary job: {job_id}"
        )

        # --------------------------------
        # 2. Put job into Redis
        # --------------------------------

        summary_queue.enqueue(
            process_summary_job,
            job_id,
            user_id,
            video_id,
        )

        print(
            f"Queued summary job: {job_id}"
        )

        # --------------------------------
        # 3. Return immediately
        # --------------------------------

        return {
            "job_id": job_id,
            "video_id": video_id,
            "status": "queued",
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create summary job: {str(e)}",
        )

@app.get("/api/jobs/{job_id}")
def get_job_status(job_id: str):

    try:
        # Get the job from Supabase
        job_response = (
            supabase
            .table("summary_jobs")
            .select("*")
            .eq("id", job_id)
            .single()
            .execute()
        )

        job = job_response.data

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )

        # If the job isn't completed yet,
        # there is no summary to return.
        if job["status"] != "completed":

            return {
                "job_id": job["id"],
                "status": job["status"],
                "video_id": job["video_id"],
            }

        # --------------------------------
        # Job completed → get summary
        # --------------------------------

        summary_response = (
            supabase
            .table("summaries")
            .select("*")
            .eq("job_id", job_id)
            .single()
            .execute()
        )

        summary = summary_response.data

        if not summary:
            raise HTTPException(
                status_code=500,
                detail="Job completed but summary not found",
            )

        return {
            "job_id": job["id"],
            "status": job["status"],
            "video_id": job["video_id"],
            "summary": summary["result"],
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to get job status: {str(e)}",
        )