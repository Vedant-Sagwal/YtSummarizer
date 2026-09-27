import os
from typing import List

from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# -----------------------------------------
# Output schemas
# -----------------------------------------

class Chapter(BaseModel):
    timestamp: str
    title: str
    summary: str


class KeyConcept(BaseModel):
    timestamp: str
    concept: str
    explanation: str


class KeyQuote(BaseModel):
    timestamp: str
    quote: str


class SummaryResult(BaseModel):
    executive_summary: str

    chapters: List[Chapter]

    key_concepts: List[KeyConcept]

    actionable_insights: List[str]

    key_quotes: List[KeyQuote]


# -----------------------------------------
# Summarizer
# -----------------------------------------

async def summarize_transcript(
    segments: list,
    additional_context:str = ""
) -> SummaryResult:

    transcript_text = "\n".join(
        f"[{segment['start']:.2f}] {segment['text']}"
        for segment in segments
    )

    prompt = f"""
You are an expert YouTube video content analyst.

Analyze the following transcript.

The transcript contains timestamps.
You MUST use those timestamps when creating
chapters, concepts and quotes.

IMPORTANT RULES:

1. Do not invent anything that the speaker did not
   say or imply.

2. Chapters should represent meaningful topic changes,
   not every few sentences.

3. Use the earliest timestamp where a chapter/topic
   begins.

4. Key concepts should only include concepts that are
   actually discussed in the video.

5. Explanations should explain what the speaker means
   based on the transcript.

6. Additional context may be provided below.

7. Use additional context ONLY to explain concepts
   that are actually discussed in the video.

8. NEVER present information from additional context
   as something the speaker said.

9. If additional context is irrelevant to a concept,
   ignore it.

10. Quotes must be exact words from the transcript.
    Do not rewrite quotes.

11. Keep timestamps in MM:SS format.

12. Focus on useful information rather than filler,
    introductions and outros.

13. Do not create concepts merely because they appear
    in the external context. Concepts must originate
    from the video transcript.

Return ONLY valid JSON matching the requested schema.

========================
VIDEO TRANSCRIPT
========================

{transcript_text}

========================
ADDITIONAL CONTEXT
========================

{additional_context}
"""

    response = await client.aio.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": SummaryResult,
        },
    )

    return SummaryResult.model_validate_json(
        response.text
    )