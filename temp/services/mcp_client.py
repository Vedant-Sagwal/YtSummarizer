from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def search_concept(
    concept: str,
    video_context: str = "",
):

    server_params = StdioServerParameters(
        command="python",
        args=[
            "mcp_server/server.py"
        ],
    )

    async with stdio_client(server_params) as (read, write):

        async with ClientSession(read, write) as session:

            await session.initialize()

            result = await session.call_tool(
                "search_concept",
                {
                    "concept": concept,
                    "video_context": video_context,
                }
            )

            return result.content[0].text