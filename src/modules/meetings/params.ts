import { createSearchParamsCache, parseAsInteger, parseAsString } from "nuqs/server";
import type { SearchParams } from "nuqs";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants";

export const filtersSearchParams = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE).withOptions({ clearOnDefault: true }),
  status: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

const filtersCache = createSearchParamsCache(filtersSearchParams);

export async function loadSearchParams(searchParams: Promise<SearchParams>) {
  return filtersCache.parse(await searchParams);
}
