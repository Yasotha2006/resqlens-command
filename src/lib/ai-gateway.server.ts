const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function getLovableAiGatewayRunId(request: Request) {
  return request.headers.get(RUN_ID_HEADER) ?? undefined;
}

export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId;
  const gatewayFetch: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    if (runId) headers.set(RUN_ID_HEADER, runId);
    const response = await fetch(input, { ...init, headers });
    runId = response.headers.get(RUN_ID_HEADER) ?? runId;
    return response;
  };
  return { fetch: gatewayFetch, getRunId: () => runId };
}

export function getLovableAiGatewayResponseHeaders(
  base?: HeadersInit,
  additions?: HeadersInit,
) {
  const headers = new Headers(base);
  new Headers(additions).forEach((value, key) => headers.set(key, value));
  return headers;
}

export function withLovableAiGatewayRunIdHeader(
  response: Response,
  runIdFetch: { getRunId: () => string | undefined },
) {
  const headers = new Headers(response.headers);
  const runId = runIdFetch.getRunId();
  if (runId) headers.set(RUN_ID_HEADER, runId);
  return new Response(response.body, { status: response.status, headers });
}