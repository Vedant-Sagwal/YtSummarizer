from pydantic import BaseModel
from services.summarizer import client


class ConceptList(BaseModel):
    concepts: list[str]


def extract_concepts(transcript_text: str) -> list[str]:

    prompt = f"""
You are analyzing a YouTube video.

Identify the 3 to 5 most important concepts discussed
in this transcript.

The concepts can be ANY meaningful topic, including:

- ideas
- techniques
- technologies
- products
- companies
- tools
- frameworks
- scientific concepts
- business concepts
- self-improvement concepts
- domain-specific terminology

For example, if the video says:

"Motivation isn't given. It is built through consistent
action. You need discipline and consistent progress."

Good concepts would be:

- Motivation
- Discipline
- Consistent Action
- Habit Formation

The concepts MUST come from the transcript.

Do not invent unrelated concepts.

TRANSCRIPT:

{transcript_text[:15000]}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ConceptList,
        },
    )

    print("========== CONCEPT MODEL RESPONSE ==========")
    print(response.text)
    print("============================================")

    result = ConceptList.model_validate_json(
        response.text
    )

    return result.concepts[:5]