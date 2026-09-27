import os
import httpx
from dotenv import load_dotenv
from services.time import parse_youtube_duration

load_dotenv()

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/videos"


async def get_video_metadata(video_id: str):
    api_key = os.getenv("YOUTUBE_API_KEY")

    if not api_key:
        raise RuntimeError("YOUTUBE_API_KEY is not configured")

    params = {
        "part": "snippet,contentDetails",
        "id": video_id,
        "key": api_key,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            YOUTUBE_API_URL,
            params=params,
            timeout=10,
        )

    response.raise_for_status()

    data = response.json()

    if not data.get("items"):
        return None

    item = data["items"][0]

    return {
        "video_id": video_id,
        "title": item["snippet"]["title"],
        "channel": item["snippet"]["channelTitle"],
        "description": item["snippet"]["description"],
        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
        "published_at": item["snippet"]["publishedAt"],
        "duration": parse_youtube_duration(item["contentDetails"]["duration"]),
    }