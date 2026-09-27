import os

from services.transcript import get_transcript
from services.audio import download_audio
from services.stt import transcribe_audio


def get_normalized_transcript(video_id: str):
    try:
        segments = get_transcript(video_id)

        return {
            "video_id": video_id,
            "source": "youtube_transcript",
            "language": "unknown",
            "segments": [
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": segment["text"],
                }
                for segment in segments
            ],
        }

    except Exception:
        pass

    audio_path = download_audio(video_id)

    try:
        result = transcribe_audio(audio_path)

        return {
            "video_id": video_id,
            "source": "whisper",
            "language": result["language"],
            "segments": result["segments"],
        }

    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)