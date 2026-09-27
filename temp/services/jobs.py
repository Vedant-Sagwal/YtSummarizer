from services.supabase import supabase


def update_job_status(
    job_id: str,
    status: str,
    error_message=None,
):
    data = {
        "status": status
    }

    if error_message:
        data["error_message"] = error_message

    supabase.table("summary_jobs").update(
        data
    ).eq(
        "id",
        job_id
    ).execute()