export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-card p-6 shadow-sm ${className}`}>
      {children}
    </section>
  );
}
