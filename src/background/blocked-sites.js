import { setBlockedUrls } from "./state.js";

const MAX_BLOCKED_URLS = 1000;
const MAX_URL_LENGTH = 500;

export function normalizeBlockedUrl(value) {
  if (typeof value !== "string") {
    throw new Error("Ogni elemento deve essere un link valido.");
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.length > MAX_URL_LENGTH || /\s/.test(trimmedValue)) {
    throw new Error(`Link non valido: ${trimmedValue || "vuoto"}.`);
  }

  const valueWithProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
  let parsedUrl;

  try {
    parsedUrl = new URL(valueWithProtocol);
  } catch {
    throw new Error(`Link non valido: ${trimmedValue}.`);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol) || !parsedUrl.hostname) {
    throw new Error(`Sono supportati solo link HTTP e HTTPS: ${trimmedValue}.`);
  }

  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
  const port = parsedUrl.port ? `:${parsedUrl.port}` : "";
  const path = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname.replace(/\/+$/, "");

  return `${hostname}${port}${path}${parsedUrl.search}`;
}

export function normalizeBlockedUrls(values) {
  if (!Array.isArray(values) || values.length > MAX_BLOCKED_URLS) {
    throw new Error(`Puoi configurare fino a ${MAX_BLOCKED_URLS} link.`);
  }

  return [...new Set(values.map(normalizeBlockedUrl))];
}

export function isBlockedUrlCovered(candidateUrl, blockedUrl) {
  const candidate = new URL(`https://${candidateUrl}`);
  const blocked = new URL(`https://${blockedUrl}`);
  const hostIsCovered = candidate.hostname === blocked.hostname || candidate.hostname.endsWith(`.${blocked.hostname}`);
  const portIsCovered = !blocked.port || candidate.port === blocked.port;
  const blockedSuffix = `${blocked.pathname === "/" ? "" : blocked.pathname}${blocked.search}`;
  const candidateSuffix = `${candidate.pathname === "/" ? "" : candidate.pathname}${candidate.search}`;

  return hostIsCovered && portIsCovered && (!blockedSuffix || candidateSuffix.startsWith(blockedSuffix));
}

export async function saveBlockedUrls(values) {
  const blockedUrls = normalizeBlockedUrls(values);
  await setBlockedUrls(blockedUrls);

  return blockedUrls;
}
