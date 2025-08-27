"use server";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { createCaller, type AppRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { createQueryClient } from "./query-client";

// Create context for server-only calls
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");
  return createTRPCContext({ headers: heads });
});

// Query client for hydration
const getQueryClient = cache(createQueryClient);

// Caller for server-side TRPC calls
const caller = createCaller(await createContext());

// ✅ Hydration helpers (naming fixed)
export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);
