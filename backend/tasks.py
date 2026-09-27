import asyncio

from services.supabase import supabase
from services.jobs import update_job_status
from services.transcript_pipeline import get_normalized_transcript
from services.summarizer import summarize_transcript
from services.concept_extractor import extract_concepts
from services.mcp_client import search_concept


def process_summary_job(
    job_id: str,
    user_id: str,
    video_id: str,
):

    try:

        print(f"Starting job: {job_id}")

        # -----------------------------
        # Mark processing
        # -----------------------------

        update_job_status(
            job_id,
            "processing"
        )

        # -----------------------------
        # Get transcript
        # -----------------------------

        print("Getting transcript...")

        transcript = get_normalized_transcript(
            video_id
        )

        print("✓ Transcript obtained")

        # -----------------------------
        # Convert transcript to text
        # -----------------------------

        transcript_text = " ".join(
            segment["text"]
            for segment in transcript["segments"]
        )

        # -----------------------------
        # Extract important concepts
        # -----------------------------

        print("Extracting concepts...")

        concepts = extract_concepts(
            transcript_text
        )

        concepts = concepts[:5]

        print("Detected concepts:")
        print(concepts)

        # -----------------------------
        # Get external context through MCP
        # -----------------------------

        mcp_context = {}

        for concept in concepts:

            print(
                f"Searching context for: {concept}"
            )

            try:

                video_context = transcript_text[:3000]
                context = asyncio.run(
                    search_concept(
                    concept,
                    video_context,
                )
)

                mcp_context[concept] = context

            except Exception as e:

                print(
                    f"Failed to get context for "
                    f"{concept}: {e}"
                )

        # -----------------------------
        # Build context for Gemini
        # -----------------------------

        context_text = "\n\n".join(
            f"### {concept}\n{context}"
            for concept, context
            in mcp_context.items()
        )

        # -----------------------------
        # Generate enriched summary
        # -----------------------------

        print("Generating summary...")

        summary = asyncio.run(
            summarize_transcript(
                transcript["segments"],
                additional_context=context_text,
            )
        )

        print("✓ Summary generated")

        # -----------------------------
        # Save summary
        # -----------------------------

        print("Saving summary...")

        supabase.table(
            "summaries"
        ).insert({
            "job_id": job_id,
            "user_id": user_id,
            "video_id": video_id,
            "result": summary.model_dump(),
        }).execute()

        print("✓ Summary saved")

        # -----------------------------
        # Mark completed
        # -----------------------------

        update_job_status(
            job_id,
            "completed"
        )

        print(
            f"✓ Job completed: {job_id}"
        )

        return True

    except Exception as e:

        print(
            f"✗ Job failed: {job_id}"
        )

        print(str(e))

        update_job_status(
            job_id,
            "failed",
            str(e)
        )

        raise