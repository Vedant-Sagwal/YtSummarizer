import os

import redis
from rq import Queue


redis_client = redis.from_url(
    os.getenv(
        "REDIS_URL",
        "redis://localhost:6379"
    )
)

summary_queue = Queue(
    "summary",
    connection=redis_client,
)