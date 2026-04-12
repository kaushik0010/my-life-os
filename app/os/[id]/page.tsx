import { DeviceExperience } from "@/features/device/DeviceExperience";

export default async function OsWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ device?: string }>;
}) {
  await params;
  const { device } = await searchParams;

  return <DeviceExperience device={device ?? "xp"} />;
}
