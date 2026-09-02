import { setSiteLists } from "./state.js";

const MAX_SITE_LISTS = 100;
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
    throw new Error(`Puoi configurare fino a ${MAX_BLOCKED_URLS} link per lista.`);
  }

  return [...new Set(values.map(normalizeBlockedUrl))];
}

export function normalizeSiteLists(values) {
  if (!Array.isArray(values) || values.length > MAX_SITE_LISTS) {
    throw new Error(`Puoi configurare fino a ${MAX_SITE_LISTS} liste.`);
  }

  const normalizedLists = values.map((siteList) => {
    if (!siteList || typeof siteList.id !== "string" || !siteList.id || siteList.id.length > 100) {
      throw new Error("Una lista contiene un identificatore non valido.");
    }

    const name = typeof siteList.name === "string" ? siteList.name.trim().slice(0, 80) : "";

    if (!name) {
      throw new Error("Ogni lista deve avere un nome.");
    }

    return {
      id: siteList.id,
      name,
      urls: normalizeBlockedUrls(siteList.urls),
      isDefault: Boolean(siteList.isDefault)
    };
  });

  if (new Set(normalizedLists.map((siteList) => siteList.id)).size !== normalizedLists.length) {
    throw new Error("Due liste hanno lo stesso identificatore.");
  }

  if (new Set(normalizedLists.flatMap((siteList) => siteList.urls)).size > MAX_BLOCKED_URLS) {
    throw new Error(`Puoi configurare fino a ${MAX_BLOCKED_URLS} link distinti complessivi.`);
  }

  return normalizedLists;
}

export function getDefaultBlockedUrls(siteLists) {
  return [...new Set(siteLists.filter((siteList) => siteList.isDefault).flatMap((siteList) => siteList.urls))];
}

export function getUrlsForListIds(siteLists, listIds) {
  const selectedIds = new Set(listIds);

  return [...new Set(siteLists.filter((siteList) => selectedIds.has(siteList.id)).flatMap((siteList) => siteList.urls))];
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

export async function saveSiteLists(values) {
  const siteLists = normalizeSiteLists(values);
  await setSiteLists(siteLists);

  return siteLists;
}
