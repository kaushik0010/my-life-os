import { DeviceExperience } from "@/features/device/DeviceExperience";

export default async function OsWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return <DeviceExperience />;
}
