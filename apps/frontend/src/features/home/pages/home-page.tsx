export function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Monorepo Template</h1>
        <p className="text-muted-foreground">
          Punto de partida para tu proyecto B2B.
        </p>
        <a href="/login" className="text-sm text-primary underline">
          Ir al login
        </a>
      </div>
    </main>
  );
}
