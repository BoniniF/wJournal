export default function ScreenshotsPage({ data }) {
  return (
    <div style={{ fontFamily:"sans-serif", padding:"20px" }}>
      <h1>Screenshots raccolti</h1>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(350px, 1fr))",
        gap:"20px"
      }}>
        {data.screenshots.map((s, i) => (
          <div key={i} style={{
            background:"white",
            padding:"10px",
            borderRadius:"10px",
            boxShadow:"0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <strong>{s.continent} / {s.country}</strong><br />
            <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
            <img
              src={`data:image/png;base64,${s.base64}`}
              style={{ width:"100%", marginTop:"10px", borderRadius:"8px" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const res = await fetch(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/mostra.js`
      : "http://localhost:3000/api/screenshot"
  );

  const data = await res.json();
  return { props: { data } };
}
