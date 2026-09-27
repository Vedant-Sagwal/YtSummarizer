def build_chunk_prompt(segments):

    transcript = "\n".join(
        f"[{segment['start']:.2f}] {segment['text']}"
        for segment in segments
    )

    return f"""
You are an expert video content analyst.

Analyze this timestamped transcript section.

TRANSCRIPT:

{transcript}

Identify:

- The main ideas
- Important technical/domain concepts
- Important topics
- Practical advice
- Approximate timestamps for concepts

IMPORTANT:

1. Only use information present in the transcript.
2. Never invent facts.
3. Every timestamp must correspond to a supplied transcript timestamp.
4. Keep explanations concise.
"""