import asyncio

from services.concept_extractor import extract_concepts
from services.mcp_client import search_concept
from services.summarizer import summarize_transcript


def generate_enriched_summary(transcript):

    transcript_text = " ".join(
        segment["text"]
        for segment in transcript["segments"]
    )

    print("Extracting concepts...")

    concepts = extract_concepts(transcript_text)

    concepts = concepts[:5]

    print("Detected concepts:")
    print(concepts)

    mcp_context = {}

    for concept in concepts:

        print(f"Getting context for: {concept}")

        try:

            context = asyncio.run(
                search_concept(concept)
            )

            mcp_context[concept] = context

        except Exception as e:

            print(
                f"MCP failed for {concept}: {e}"
            )

    context_text = "\n\n".join(
        f"### {concept}\n{context}"
        for concept, context in mcp_context.items()
    )

    prompt = f"""
You are an expert YouTube video summarizer.

Create a detailed summary of this video.

Requirements:

- Stay faithful to the transcript.
- Organize the summary chronologically.
- Include timestamps.
- Explain important concepts mentioned by the speaker.
- Use external context only when it helps explain a concept.
- Never present external information as something the speaker said.
- Do not invent claims.

TRANSCRIPT:

{transcript_text}


ADDITIONAL WEB CONTEXT:

{context_text}
"""

    return summarize_transcript(
        transcript["segments"],
        additional_prompt=prompt
    )