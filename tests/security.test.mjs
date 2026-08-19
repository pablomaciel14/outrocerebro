import assert from "node:assert/strict";
import test from "node:test";
import {
  readLimitedJson, rejectCrossSiteMutation, sha256, validatePdfSubmission, validUuid,
} from "../app/security.ts";

function mutationRequest(headers) {
  return new Request("https://outrocerebro.com.br/api/workspace", { method: "POST", headers });
}

test("rejectCrossSiteMutation allows a same-origin request with same-origin fetch metadata", () => {
  const request = mutationRequest({ origin: "https://outrocerebro.com.br", "sec-fetch-site": "same-origin" });
  assert.equal(rejectCrossSiteMutation(request), null);
});

test("rejectCrossSiteMutation allows a same-origin request that omits sec-fetch-site (older browsers)", () => {
  const request = mutationRequest({ origin: "https://outrocerebro.com.br" });
  assert.equal(rejectCrossSiteMutation(request), null);
});

test("rejectCrossSiteMutation blocks a forged cross-site Origin header", async () => {
  const request = mutationRequest({ origin: "https://attacker.example", "sec-fetch-site": "cross-site" });
  const response = rejectCrossSiteMutation(request);
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "Requisição não autorizada." });
});

test("rejectCrossSiteMutation blocks a request with no Origin header at all", () => {
  const request = mutationRequest({});
  const response = rejectCrossSiteMutation(request);
  assert.equal(response.status, 403);
});

test("rejectCrossSiteMutation blocks same-origin Origin paired with a cross-site Sec-Fetch-Site (iframe/CSRF defense in depth)", () => {
  const request = mutationRequest({ origin: "https://outrocerebro.com.br", "sec-fetch-site": "cross-site" });
  const response = rejectCrossSiteMutation(request);
  assert.equal(response.status, 403);
});

test("validUuid accepts a well-formed v4 UUID and rejects everything else", () => {
  assert.equal(validUuid("3fa85f64-5717-4562-b3fc-2c963f66afa6"), true);
  assert.equal(validUuid("3FA85F64-5717-4562-B3FC-2C963F66AFA6"), true);
  assert.equal(validUuid("not-a-uuid"), false);
  assert.equal(validUuid("3fa85f64-5717-4562-b3fc-2c963f66afa"), false);
  assert.equal(validUuid("'; DROP TABLE readings; --"), false);
  assert.equal(validUuid(null), false);
  assert.equal(validUuid(undefined), false);
  assert.equal(validUuid(""), false);
});

test("readLimitedJson parses a well-formed small JSON body", async () => {
  const request = new Request("https://outrocerebro.com.br/api/workspace", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "ok" }),
  });
  assert.deepEqual(await readLimitedJson(request), { title: "ok" });
});

test("readLimitedJson rejects a declared Content-Length above the limit before reading the body", async () => {
  const request = new Request("https://outrocerebro.com.br/api/workspace", {
    method: "POST",
    headers: { "content-type": "application/json", "content-length": String(20 * 1024) },
    body: JSON.stringify({ title: "x".repeat(20 * 1024) }),
  });
  assert.equal(await readLimitedJson(request), null);
});

test("readLimitedJson rejects a body that actually exceeds the limit even without a declared Content-Length", async () => {
  const request = new Request("https://outrocerebro.com.br/api/workspace", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "x".repeat(20 * 1024) }),
  });
  assert.equal(await readLimitedJson(request, 1024), null);
});

test("readLimitedJson rejects a non-JSON content-type", async () => {
  const request = new Request("https://outrocerebro.com.br/api/workspace", {
    method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify({ title: "ok" }),
  });
  assert.equal(await readLimitedJson(request), null);
});

test("readLimitedJson rejects malformed JSON", async () => {
  const request = new Request("https://outrocerebro.com.br/api/workspace", {
    method: "POST", headers: { "content-type": "application/json" }, body: "{not json",
  });
  assert.equal(await readLimitedJson(request), null);
});

test("sha256 is deterministic and matches a known digest", async () => {
  assert.equal(await sha256("outro-cerebro"), await sha256("outro-cerebro"));
  assert.equal(await sha256(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
});

function pdfFile(bytes, name = "meu-arquivo.pdf", type = "application/pdf") {
  return new File([bytes], name, { type });
}

const validPdfBytes = new TextEncoder().encode("%PDF-1.7\n%% fake but signed like a real pdf\n");

test("validatePdfSubmission accepts a real PDF-signed file and sanitizes its name", async () => {
  const result = await validatePdfSubmission({
    file: pdfFile(validPdfBytes, "contrato final (v2).pdf"), title: "Contrato", markdown: "", totalPages: 3,
  });
  assert.equal(result.ok, true);
  assert.equal(result.safeName, "contrato_final__v2_.pdf");
  assert.equal(new TextDecoder().decode(result.fileBuffer), new TextDecoder().decode(validPdfBytes));
});

test("validatePdfSubmission rejects a file with the .pdf name/mimetype but no PDF magic bytes", async () => {
  const disguised = pdfFile(new TextEncoder().encode("<script>alert(1)</script>"));
  const result = await validatePdfSubmission({ file: disguised, title: "x", markdown: "", totalPages: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.match(result.error, /assinatura PDF/);
});

test("validatePdfSubmission rejects a non-PDF mimetype even if the field is a File", async () => {
  const result = await validatePdfSubmission({
    file: pdfFile(validPdfBytes, "arquivo.exe", "application/x-msdownload"), title: "x", markdown: "", totalPages: 1,
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("validatePdfSubmission rejects something that isn't a File at all", async () => {
  const result = await validatePdfSubmission({ file: "not-a-file", title: "x", markdown: "", totalPages: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("validatePdfSubmission rejects a PDF bigger than 40MB", async () => {
  const oversized = pdfFile(new Uint8Array(41 * 1024 * 1024), "big.pdf");
  const result = await validatePdfSubmission({ file: oversized, title: "x", markdown: "", totalPages: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.status, 413);
});

test("validatePdfSubmission rejects an invalid totalPages value", async () => {
  const result = await validatePdfSubmission({ file: pdfFile(validPdfBytes), title: "x", markdown: "", totalPages: Number.NaN });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("validatePdfSubmission rejects oversized metadata (title/filename/markdown)", async () => {
  const result = await validatePdfSubmission({
    file: pdfFile(validPdfBytes, `${"a".repeat(261)}.pdf`), title: "x", markdown: "", totalPages: 1,
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 413);
});
