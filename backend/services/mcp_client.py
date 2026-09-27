import sys
from pathlib import Path

from mcp import (
    ClientSession,
    StdioServerParameters,
)
from mcp.client.stdio import stdio_client


MCP_SERVER_PATH = (
    Path(__file__).resolve().parents[1]
    / "mcp_server"
    / "server.py"
)


async def search_concept(
    concept: str,
    video_context: str = "",
):

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[
            str(MCP_SERVER_PATH),
        ],
    )

    async with stdio_client(
        server_params
    ) as (read, write):

        async with ClientSession(
            read,
            write,
        ) as session:

            await session.initialize()

            result = await session.call_tool(
                "search_concept",
                {
                    "concept": concept,
                    "video_context": video_context,
                },
            )

            if not result.content:

                return (
                    "No external context found."
                )

            return result.content[0].text