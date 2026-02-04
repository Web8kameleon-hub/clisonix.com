/**
 * OCEAN STREAMING API - Real-time AI responses
 *
 * This endpoint streams responses from Ocean-Core,
 * so text appears immediately (2-3 seconds) instead of waiting 60+ seconds.
 */

// Detect environment for correct API URL
const isDev = process.env.NODE_ENV !== "production";
const OCEAN_CORE_URL =
  process.env.OCEAN_CORE_URL ||
  (isDev ? "http://localhost:8030" : "http://clisonix-ocean-core:8030");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message || body.query;

    if (!message?.trim()) {
      return new Response("Message required", { status: 400 });
    }

    // Call Ocean-Core streaming endpoint
    const response = await fetch(`${OCEAN_CORE_URL}/api/v1/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      return new Response("Ocean-Core error", { status: 500 });
    }

    // Stream the response directly to the client
    const headers = new Headers({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    return new Response(response.body, { headers });
  } catch (error) {
    console.error("Streaming error:", error);
    return new Response("Streaming failed", { status: 500 });
  }
}
