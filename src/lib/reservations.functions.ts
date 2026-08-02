import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const lookupSchema = z.object({
  name: z.string().trim().min(1).max(50),
  phone: z.string().trim().min(6).max(30),
});

export type ReservationLookupItem = {
  id: string;
  visit_date: string;
  time_slot: string;
  party_size: number;
  status: string;
  created_at: string;
};

// Very small in-memory throttle to discourage phone-number guessing.
const attempts = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

export const lookupReservations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => lookupSchema.parse(input))
  .handler(async ({ data }): Promise<ReservationLookupItem[]> => {
    const key = `${data.name}|${data.phone}`;
    const now = Date.now();
    const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_ATTEMPTS) {
      throw new Error("查詢太頻繁，請稍後再試。");
    }
    recent.push(now);
    attempts.set(key, recent);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("reservations")
      .select("id, visit_date, time_slot, party_size, status, created_at")
      .eq("name", data.name)
      .eq("phone", data.phone)
      .order("visit_date", { ascending: true })
      .limit(10);

    if (error) throw new Error(error.message);

    return (rows ?? []).map((r) => ({
      id: r.id,
      visit_date: r.visit_date,
      time_slot: r.time_slot,
      party_size: r.party_size,
      status: r.status,
      created_at: r.created_at,
    }));
  });
