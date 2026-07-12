import { NextRequest, NextResponse } from "next/server";
import { graph } from "../../../lib/agent/graph";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { companyInputSchema } from "../../../lib/validation";

const inputSchema = z.object({
  companyName: companyInputSchema,
});

let ratelimit: Ratelimit | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 m"),
    });
  }
} catch (e) {
  console.error("Failed to initialize Upstash Ratelimit:", e);
}

const NODE_MESSAGES: Record<string, string> = {
  resolveCompany: "Resolving company identity...",
  gatherNews: "Scanning recent news coverage and sentiment...",
  gatherFinancials: "Pulling financial fundamentals...",
  gatherCompetitors: "Analyzing competitive landscape and market position...",
  gatherRisks: "Assessing key risk factors and market headwinds...",
  synthesize: "Synthesizing research findings...",
  decide: "Formulating final investment decision...",
  generateReport: "Generating markdown investment report...",
  insufficientData: "Processing insufficient data fallback...",
};

export async function POST(req: NextRequest) {
  try {
    if (ratelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return new NextResponse(JSON.stringify({ error: "Too many requests." }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Please enter a valid company name or stock ticker." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { companyName } = result.data;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Safe helper to send SSE events
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        // Local state accumulator matching frontend requirements
        const accumulatedState: Record<string, any> = {
          companyName,
          resolved: false,
          resolvedEntity: null,
          newsEvidence: null,
          financialData: null,
          competitorEvidence: null,
          riskEvidence: null,
          synthesis: null,
          decision: null,
          confidence: null,
          oneLineVerdict: null,
          keyPositives: [],
          keyRisks: [],
          reasoning: null,
          finalReport: null,
          errors: [],
          degraded: [],
        };

        try {
          // Stream the graph steps
          const eventStream = await graph.stream(
            { companyName },
            { 
              streamMode: "updates",
              configurable: {
                emit: (node: string, message: string) => {
                  sendEvent("status", { node, message });
                }
              }
            }
          );

          for await (const chunk of eventStream) {
            const typedChunk = chunk as Record<string, any>;
            const nodeNames = Object.keys(typedChunk);
            for (const nodeName of nodeNames) {
              const nodeUpdate = typedChunk[nodeName];
              
              // Accumulate updates
              Object.assign(accumulatedState, nodeUpdate);
              if (nodeUpdate && nodeUpdate.errors) {
                accumulatedState.errors = [...accumulatedState.errors, ...nodeUpdate.errors];
              }

              // Send status update if NOT synthesizeAndDecide (which emits internally for UI step parity)
              if (nodeName !== "synthesizeAndDecide") {
                const message = NODE_MESSAGES[nodeName] || `Executing node: ${nodeName}`;
                sendEvent("status", { node: nodeName, message });
              }
            }
          }

          // Send final accumulated result
          if (accumulatedState.synthesis) {
            const s = accumulatedState.synthesis;
            accumulatedState.newsResearch = {
              summary: s.newsSummary,
              sentiment: s.newsSentiment,
              sources: accumulatedState.newsEvidence?.items?.map((i: any) => i.url) || [],
            };
            accumulatedState.competitiveLandscape = {
              summary: s.competitiveSummary,
              competitors: s.competitors,
              sources: accumulatedState.competitorEvidence?.items?.map((i: any) => i.url) || [],
            };
            accumulatedState.riskFactors = {
              summary: s.riskSummary,
              risks: s.keyRisks,
              sources: accumulatedState.riskEvidence?.items?.map((i: any) => i.url) || [],
            };
            accumulatedState.financialData = {
              ...accumulatedState.financialData,
              summary: s.financialCommentary || "",
              metrics: accumulatedState.financialData?.metrics || {},
              sources: accumulatedState.financialData?.sources || [],
            };
            accumulatedState.decision = s.decision;
            accumulatedState.confidence = s.confidence;
            accumulatedState.oneLineVerdict = s.oneLineVerdict;
            accumulatedState.keyPositives = s.keyPositives;
            accumulatedState.keyRisks = s.keyRisks;
            accumulatedState.reasoning = s.reasoning;
          }

          sendEvent("result", accumulatedState);
          controller.close();
        } catch (streamError: any) {
          console.error("Error in graph stream:", streamError);
          sendEvent("error", { message: streamError.message || String(streamError) });
          
          // Even in failure, try to send the final accumulated state
          sendEvent("result", accumulatedState);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("API route error:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
