def chunk_transcript(
    segments,
    max_chars=12000,
):
    chunks = []

    current = []
    current_chars = 0

    for segment in segments:
        text = segment["text"]

        if (
            current
            and current_chars + len(text) > max_chars
        ):
            chunks.append(current)

            current = []
            current_chars = 0

        current.append(segment)
        current_chars += len(text)

    if current:
        chunks.append(current)

    return chunks