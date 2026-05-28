/**
 * Health/landing page. The real surface is the API:
 *   POST /api/agent/run      (SSE stream of AgentEvent)
 *   POST /api/agent/approve  (release the approval gate)
 */
export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: 24, background: '#07060f', color: '#f6f4ff', minHeight: '100vh' }}>
      <h1>lucid-agent-server</h1>
      <p>POST /api/agent/run · POST /api/agent/approve</p>
      <p>Point the RN client&apos;s Settings → providers → server url at this origin.</p>
    </main>
  );
}
