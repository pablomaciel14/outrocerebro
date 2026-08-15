import { requireChatGPTUser } from "../../chatgpt-auth";
import ReadingClient from "./ReadingClient";

export const dynamic = "force-dynamic";

export default async function ReadingsPage() {
  await requireChatGPTUser("/workspace/leituras");
  return <ReadingClient />;
}
