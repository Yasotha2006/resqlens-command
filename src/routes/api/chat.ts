import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { createOpenAI } from "@ai-sdk/openai";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createHash, randomUUID } from "crypto";

const COOKIE = "resqlens_session";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const readToken = (request: Request) => request.headers.get("cookie")?.match(/(?:^|; )resqlens_session=([^;]+)/)?.[1];

async function session(request: Request) {
  const existing = readToken(request);
  const token = existing ?? randomUUID();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const tokenHash = hash(token);
  const { data } = await supabaseAdmin.from("resqlens_copilot_sessions").select("id,messages").eq("access_token_hash", tokenHash).maybeSingle();
  if (data) return { data, token, fresh: !existing };
  const created = await supabaseAdmin.from("resqlens_copilot_sessions").insert({ access_token_hash: tokenHash, messages: [] }).select("id,messages").single();
  if (created.error) throw new Error(created.error.message);
  return { data: created.data, token, fresh: true };
}

const cookieHeader = (token: string) => `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const current = await session(request);
        return Response.json({ messages: current.data.messages }, current.fresh ? { headers: { "Set-Cookie": cookieHeader(current.token) } } : {});
      },
      PUT: async ({ request }) => {
        const body = await request.json() as { messages?: unknown };
        if (!Array.isArray(body.messages)) return new Response("Messages are required", { status: 400 });
        const current = await session(request);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const update = await supabaseAdmin.from("resqlens_copilot_sessions").update({ messages: body.messages, updated_at: new Date().toISOString() }).eq("id", current.data.id);
        if (update.error) return new Response(update.error.message, { status: 500 });
        return Response.json({ saved: true }, current.fresh ? { headers: { "Set-Cookie": cookieHeader(current.token) } } : {});
      },
      POST: async ({ request }) => {
        const body = await request.json() as { messages?: unknown; context?: unknown };
        if (!Array.isArray(body.messages)) return new Response("Messages are required", { status: 400 });
        const key = process.env['LOVABLE_API_KEY'];
        if (!key) return new Response("ResQ Core is not configured", { status: 401 });
        const initialRunId = getLovableAiGatewayRunId(request);
        const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key,
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });
        const result = streamText({
          model: lovable.responses("openai/gpt-6-astra"),
          system: `You are ResQ Core, a concise safety decision-support copilot. Use qualified language: potential, possible, estimated, may. Never guarantee safety or physical outcomes. Explain assumptions and recommend human verification. Current command context: ${JSON.stringify(body.context ?? {})}`,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
          abortSignal: request.signal,
          providerOptions: { openai: { forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
        });
        return withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
          sendReasoning: true,
          headers: getLovableAiGatewayResponseHeaders(undefined, initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : undefined),
        }), runIdFetch);
      },
    },
  },
});