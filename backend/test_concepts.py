from services.transcript_pipeline import get_normalized_transcript
from services.concept_extractor import extract_concepts


transcript = get_normalized_transcript(
    "r6zFZQm0hcc"
)

text = " ".join(
    segment["text"]
    for segment in transcript["segments"]
)

concepts = extract_concepts(text)

print("\nFINAL CONCEPTS:")
print(concepts)