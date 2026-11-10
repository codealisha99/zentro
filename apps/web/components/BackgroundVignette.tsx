export function BackgroundVignette() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: [
          'radial-gradient(ellipse at 0% 0%, rgba(244,241,232,0.03) 0%, transparent 55%)',
          'radial-gradient(ellipse at 100% 100%, rgba(0,220,130,0.02) 0%, transparent 45%)',
          'radial-gradient(ellipse at 50% 120%, rgba(244,241,232,0.02) 0%, transparent 50%)',
        ].join(', '),
      }}
    />
  )
}
