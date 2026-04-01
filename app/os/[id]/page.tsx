export default async function OsWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Life OS Workspace</h1>
      <p className="text-muted-foreground text-sm">ID: {id}</p>
    </main>
  );
}
