from pydantic import BaseModel
from typing import List

class Source(BaseModel):
    title: str
    url: str
    snippet: str

class Chapter(BaseModel):
    start: float
    title: str
    summary: str


class Topic(BaseModel):
    timestamp: float
    name: str
    explanation: str

class ChunkSummary(BaseModel):
    summary: str
    key_points: List[str]
    important_concepts: List[Topic]
    actionable_insights: List[str]

class Concept(BaseModel):
    timestamp: float
    name: str
    description: str
    importance: str
    external_context: str | None = None
    sources: List[Source] = []

class Summary(BaseModel):
    executive_summary: str
    chapters: List[Chapter]
    key_takeaways: List[str]
    important_concepts: List[Concept]
    actionable_insights: List[str]


