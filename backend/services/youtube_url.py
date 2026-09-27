from urllib.parse import urlparse, parse_qs

def extract_video_id(url: str) -> str | None:
    parsed = urlparse(url)

    if parsed.hostname in {"www.youtube.com", "youtube.com"}:
        query = parse_qs(parsed.query)

        video_id = query.get("v")

        if video_id:
            return video_id[0]

    if parsed.hostname == "youtu.be":
        video_id = parsed.path.strip("/")

        if video_id:
            return video_id

    return None