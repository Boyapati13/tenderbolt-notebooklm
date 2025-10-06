
export default function MinimalPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>TenderBolt NotebookLM - Static Version</h1>
      <p>This is a static version with limited functionality.</p>
      <div style={{ background: '#f0f0f0', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
        <h3>Static Features Available:</h3>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>✅ Static page rendering</li>
          <li>✅ Client-side interactivity</li>
          <li>✅ CSS styling</li>
          <li>✅ JavaScript functionality</li>
        </ul>
        <h3>Server Features Not Available:</h3>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>❌ API routes</li>
          <li>❌ Database connections</li>
          <li>❌ NextAuth authentication</li>
          <li>❌ Server-side rendering</li>
        </ul>
      </div>
    </div>
  );
}
