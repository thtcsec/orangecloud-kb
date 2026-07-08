import type { Env } from "../env";

/**
 * Returns the OpenAI-compatible base URL.
 *
 * If AI_GATEWAY_SLUG is set, routes through Cloudflare AI Gateway
 * which proxies via US/EU PoPs — bypasses OpenAI geo-restrictions.
 *
 * AI Gateway URL format:
 * https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_slug}/openai
 */
export function getOpenAIBaseUrl(env: Env): string {
  if (env.AI_GATEWAY_SLUG) {
    return `https://gateway.ai.cloudflare.com/v1/4c15704ef706b9c8954cd6f9feb678d8/${env.AI_GATEWAY_SLUG}/openai`;
  }
  return "https://api.openai.com";
}
