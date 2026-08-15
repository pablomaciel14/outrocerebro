import { requirePersonalUser } from "../../personal-auth";
import ReadingClient from "./ReadingClient";

export const dynamic = "force-dynamic";

export default async function ReadingsPage() {
  await requirePersonalUser();
  return <ReadingClient />;
}
