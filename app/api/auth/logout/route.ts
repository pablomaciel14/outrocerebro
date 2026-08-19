import { clearPersonalSessionCookies } from "../../../personal-auth";
import { rejectCrossSiteMutation } from "../../../security";

export async function POST(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const headers = new Headers({ location: new URL("/", request.url).toString(), "cache-control": "no-store" });
  clearPersonalSessionCookies().forEach((cookie) => headers.append("set-cookie", cookie));
  return new Response(null, { status: 303, headers });
}
