import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const globalForConnections = global as typeof global & {
  sseConnections?: Set<ReadableStreamDefaultController>;
};

if (!globalForConnections.sseConnections) {
  globalForConnections.sseConnections = new Set<ReadableStreamDefaultController>();
}

const connections = globalForConnections.sseConnections;

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      connections.add(controller);
      
      const message = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(new TextEncoder().encode(message));
      
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeat));
        } catch (error) {
          clearInterval(heartbeatInterval);
          connections.delete(controller);
        }
      }, 15000);
      
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        connections.delete(controller);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const message = `data: ${JSON.stringify({
      type: 'button-press',
      ...data,
      serverTimestamp: new Date().toISOString()
    })}\n\n`;
    
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);
    
    for (const controller of connections) {
      try {
        controller.enqueue(encoded);
      } catch (error) {
        connections.delete(controller);
      }
    }
    
    return Response.json({ 
      success: true, 
      connections: connections.size 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to broadcast message' 
    }, { status: 500 });
  }
}
