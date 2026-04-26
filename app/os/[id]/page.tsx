import { DeviceExperience } from "@/features/device/DeviceExperience";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export default async function OsWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ device?: string }>;
}) {
  const { id } = await params;
  const { device } = await searchParams;

  const res = await fetch(`${BASE_URL}/api/os/${id}`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">OS not found</p>
      </div>
    );
  }

  const { os, folders, files, messages } = await res.json();

  return (
    <DeviceExperience
      device={device ?? os.device_type ?? "xp"}
      osId={os.id}
      isTemporary={os.is_temporary !== false}
      osUserId={os.user_id ?? null}
      folders={folders}
      files={files}
      messages={messages}
    />
  );
}
