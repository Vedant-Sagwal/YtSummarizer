import os

from dotenv import load_dotenv
from tavily import TavilyClient
from mcp.server.mcpserver import MCPServer


load_dotenv()

mcp = MCPServer("YT Summarizer Context Server")

tavily = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)


@mcp.tool()
def search_concept(
    concept: str,
    video_context: str = "",
) -> str:
    """
    Search for useful external context about a concept
    mentioned in a YouTube video.
    """

    if video_context:

        query = f"""
        {concept}

        Context from the video:
        {video_context}
        """

    else:

        query = concept

    response = tavily.search(
        query=query,
        search_depth="basic",
        max_results=3,
    )

    results = response.get("results", [])

    if not results:
        return (
            f"No useful external information found "
            f"for {concept}."
        )

    output = []

    for result in results:

        title = result.get("title", "")
        url = result.get("url", "")
        content = result.get("content", "")

        # Prevent huge MCP responses
        content = content[:2000]

        output.append(
            f"Title: {title}\n"
            f"URL: {url}\n"
            f"Content: {content}"
        )

    return "\n\n---\n\n".join(output)


if __name__ == "__main__":
    mcp.run()