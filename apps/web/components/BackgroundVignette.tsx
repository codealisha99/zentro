export function BackgroundVignette() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: [
          'radial-gradient(ellipse at 0% 0%, rgba(124,58,237,0.08) 0%, transparent 55%)',
          'radial-gradient(ellipse at 100% 100%, rgba(124,58,237,0.05) 0%, transparent 45%)',
        ].join(', '),
      }}
    />
  )
}
