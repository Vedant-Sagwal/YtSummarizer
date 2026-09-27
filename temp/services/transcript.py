from youtube_transcript_api import YouTubeTranscriptApi


def get_transcript(video_id: str):
    api = YouTubeTranscriptApi()

    transcript = api.fetch(video_id)

    segments = []

    for item in transcript:
        segments.append(
            {
                "start": item.start,
                "duration": item.duration,
                "end": item.start + item.duration,
                "text": item.text,
            }
        )

    return segments