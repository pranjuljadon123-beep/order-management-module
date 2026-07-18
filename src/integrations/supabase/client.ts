// Mock backend shim: exports a supabase-like client that mimics the
// PostgREST/GoTrue/Functions API surface but is backed by an in-memory
// JSON store (localStorage). See src/mock/mockDb.ts.
export { supabase } from "@/mock/mockDb";
export type { AuthSession, AuthUser } from "@/mock/mockDb";