export default function Loading() {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-28 rounded-lg bg-muted" />
          <div className="h-28 rounded-lg bg-muted" />
          <div className="h-28 rounded-lg bg-muted" />
          <div className="h-28 rounded-lg bg-muted" />
        </div>
        <div className="h-96 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
