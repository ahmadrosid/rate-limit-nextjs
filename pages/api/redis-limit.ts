import type { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";
import Redis, { RedisOptions } from "ioredis";
import rateLimiter from "../../lib/redis-rate-limiter";

const option: RedisOptions = {
  host: process.env.REDIS_HOST!,
  password: process.env.REDIS_PASSWORD!,
  port: parseInt(process.env.REDIS_PORT!, 10),
};

const client = new Redis(option);
const LIMIT_PER_SECOND = 3;
const DURATION = 60;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const identifier = requestIp.getClientIp(req);
  const result = await rateLimiter(
    client,
    identifier!,
    LIMIT_PER_SECOND,
    DURATION
  );
  res.setHeader("X-RateLimit-Limit", result.limit);
  res.setHeader("X-RateLimit-Remaining", result.remaining);

  if (!result.success) {
    res
      .status(429)
      .json(
        "Too many requests in 1 minute. Please try again in a few minutes."
      );
    return;
  }

  res.status(200).json({ name: "John Doe" });
}
