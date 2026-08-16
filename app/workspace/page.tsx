import { requirePersonalUser } from "../personal-auth";
import WorkspaceClient from "./WorkspaceClient";

export const dynamic = "force-dynamic";

type WorkspaceArea = "memoria" | "raciocinio" | "conexoes" | "agenda";

export default async function WorkspacePage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const user = await requirePersonalUser();
  const requestedArea = (await searchParams).area;
  const initialArea: WorkspaceArea = requestedArea === "raciocinio" || requestedArea === "conexoes" || requestedArea === "agenda" ? requestedArea : "memoria";
  return <WorkspaceClient displayName={user.displayName} email={user.email} initialArea={initialArea} />;
}
