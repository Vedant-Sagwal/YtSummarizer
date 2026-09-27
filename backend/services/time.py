import re


def parse_youtube_duration(duration: str) -> int:
    match = re.match(
        r"PT"
        r"(?:(\d+)H)?"
        r"(?:(\d+)M)?"
        r"(?:(\d+)S)?",
        duration,
    )

    if not match:
        raise ValueError("Invalid ISO-8601 duration")

    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)

    return hours * 3600 + minutes * 60 + seconds