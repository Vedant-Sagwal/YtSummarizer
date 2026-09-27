import os
from google import genai
from google.genai import types
from models.summary import Summary

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


async def generate_structured(
    prompt: str,
    schema,
):
    response = await client.aio.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
        ),
    )

    return response.parsed