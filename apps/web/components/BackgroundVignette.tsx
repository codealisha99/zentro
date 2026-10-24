export function BackgroundVignette() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: [
          'radial-gradient(ellipse at 0% 0%, rgba(124,92,252,0.09) 0%, transparent 55%)',
          'radial-gradient(ellipse at 100% 100%, rgba(226,180,255,0.05) 0%, transparent 45%)',
          'radial-gradient(ellipse at 50% 120%, rgba(124,92,252,0.06) 0%, transparent 50%)',
        ].join(', '),
      }}
    />
  )
}
