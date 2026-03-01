 "use client";
 
 import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
 import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants";
 
 export const useMeetingsFilters = () => {
     return useQueryStates({
         search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
         page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
         pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE).withOptions({ clearOnDefault: true }),
         status: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
         agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
     });
 };

