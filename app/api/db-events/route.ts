import { NextResponse } from "next/server";

// Prevents this route's response from being cached on Vercel
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      // Send heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(`data: heartbeat\n\n`);
      }, 30000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
