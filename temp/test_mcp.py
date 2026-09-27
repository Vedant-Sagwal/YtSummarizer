import asyncio

from services.mcp_client import search_concept


async def main():

    result = await search_concept(
        "Amazon EC2",
        "The speaker explains how they deployed "
        "their backend on EC2 and used auto scaling "
        "to handle traffic."
    )

    print("\nMCP RESULT:\n")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())