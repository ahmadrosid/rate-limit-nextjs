// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import redis from "../../lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import requestIp from "request-ip";

const LIMIT_PER_SECOND = 3;
const ratelimit = redis
  ? new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(LIMIT_PER_SECOND, "60 s"),
  })
  : undefined;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log({ratelimit});
  
  if (ratelimit) {
    const identifier = requestIp.getClientIp(req);
    const result = await ratelimit.limit(identifier!);
    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);

    if (!result.success) {
      res
        .status(429)
        .json(
          "Too many uploads in 1 minute. Please try again in a few minutes."
        );
      return;
    }
  }

  res.status(200).json({ name: 'John Doe' })
}
