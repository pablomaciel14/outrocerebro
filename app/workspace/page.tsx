import { requirePersonalUser } from "../personal-auth";
import WorkspaceClient from "./WorkspaceClient";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const user = await requirePersonalUser();
  return <WorkspaceClient displayName={user.displayName} email={user.email} />;
}
