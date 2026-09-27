import subprocess
from pathlib import Path
import tempfile


def download_audio(video_id: str) -> str:
    temp_dir = tempfile.mkdtemp(prefix="yt_audio_")

    output_path = Path(temp_dir) / "audio.%(ext)s"

    url = f"https://www.youtube.com/watch?v={video_id}"

    command = [
        "yt-dlp",
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "5",
        "-o",
        str(output_path),
        url,
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"Audio download failed: {result.stderr}"
        )

    audio_file = next(Path(temp_dir).glob("audio.*"))

    return str(audio_file)