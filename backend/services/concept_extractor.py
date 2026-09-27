import json
import os
from typing import List

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel


load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


class ConceptResult(BaseModel):
    concepts: List[str]


def extract_concepts(transcript_text: str) -> List[str]:

    print("========== CONCEPT EXTRACTION ==========")
    print(f"Transcript length: {len(transcript_text)}")

    prompt = f"""
Extract the most important technical, conceptual, or thematic
concepts discussed in this YouTube transcript.

Rules:

1. Return at most 5 concepts.
2. Only use concepts actually present in the transcript.
3. Do not invent concepts.
4. Keep each concept short.
5. Return JSON only.

Example:

{{
    "concepts": [
        "Motivation",
        "Discipline",
        "Consistent Action"
    ]
}}

TRANSCRIPT:

{transcript_text}
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ConceptResult,
            },
        )

        print("========== CONCEPT MODEL RESPONSE ==========")
        print(response.text)
        print("============================================")

        result = ConceptResult.model_validate_json(
            response.text
        )

        concepts = result.concepts[:5]

        print("FINAL CONCEPTS:")
        print(concepts)

        return concepts

    except Exception as e:

        print(
            f"Concept extraction failed: {e}"
        )

        # Do not kill the entire summary job just because
        # optional concept extraction failed.
        return []