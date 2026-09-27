from rq import SimpleWorker, Queue

from queue1 import redis_client


def main():

    print("Starting summary worker...")

    worker = SimpleWorker(
        queues=[
            Queue(
                "summary",
                connection=redis_client
            )
        ],
        connection=redis_client,
    )

    print("Worker is waiting for jobs...")

    worker.work()


if __name__ == "__main__":
    main()