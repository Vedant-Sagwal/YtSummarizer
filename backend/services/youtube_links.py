def youtube_timestamp_url(
    video_id: str,
    timestamp: float,
) -> str:

    seconds = int(timestamp)

    return (
        f"https://www.youtube.com/watch?v="
        f"{video_id}&t={seconds}s"
    )