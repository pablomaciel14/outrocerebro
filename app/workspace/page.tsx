import { requireChatGPTUser } from "../chatgpt-auth";
import WorkspaceClient from "./WorkspaceClient";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const user = await requireChatGPTUser("/workspace");
  return <WorkspaceClient displayName={user.displayName} email={user.email} />;
}
