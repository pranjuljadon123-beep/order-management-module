import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAiContext } from "@/hooks/useAiContext";

/**
 * Mounted globally inside AppLayout. Registers AI action verbs that must
 * work regardless of which page is currently mounted:
 *   - procurement.createRfq(input)
 *   - tracking.addByBl(bl, carrier)
 *
 * Page-specific handlers (e.g. tracking.openShipment) still come from the
 * actual module pages via useAiContext().
 */
type CreateRfqInput = {
  title: string;
  mode?: string;
  incoterms?: string;
  bid_deadline?: string;
  notes?: string;
  rfq_type?: "spot" | "contract";
  lanes: Array<{
    origin_city: string;
    origin_country: string;
    destination_city: string;
    destination_country: string;
    equipment_type?: string;
    frequency?: string;
  }>;
};

export function AiGlobalBridge() {
  const navigate = useNavigate();
  // Queue for pending tracking add when /tracking page is not mounted yet.
  const pendingAdd = useRef<{ bl: string; carrier: string } | null>(null);

  const createRfq = useCallback(async (input: CreateRfqInput) => {
    const { data: rfqNumber } = await supabase.rpc("generate_rfq_number");
    const { data: rfq, error } = await supabase
      .from("rfqs")
      .insert({
        rfq_number: rfqNumber as string,
        title: input.title,
        mode: input.mode ?? "ocean_fcl",
        incoterms: input.incoterms,
        bid_deadline: input.bid_deadline,
        notes: input.notes,
        rfq_type: input.rfq_type ?? "spot",
        status: "draft",
      })
      .select()
      .single();
    if (error) throw error;

    if (input.lanes?.length) {
      const lanes = input.lanes.map((l, i) => ({
        rfq_id: rfq.id,
        lane_number: i + 1,
        origin_city: l.origin_city,
        origin_country: l.origin_country,
        destination_city: l.destination_city,
        destination_country: l.destination_country,
        equipment_type: l.equipment_type,
        frequency: l.frequency,
      }));
      const { error: lanesError } = await supabase.from("rfq_lanes").insert(lanes);
      if (lanesError) throw lanesError;
    }

    toast.success(`RFQ ${rfq.rfq_number} created`, {
      description: "Opening procurement…",
      action: { label: "Open", onClick: () => navigate("/procurement") },
    });
    return rfq;
  }, [navigate]);

  const addShipmentByBl = useCallback((bl: string, carrier?: string) => {
    const id = String(bl || "").trim().toUpperCase();
    const car = String(carrier || "mscu").toLowerCase();
    if (!id) throw new Error("BL/Container number required");

    const trackingActions = (window as any).__daistrixActions?.tracking;
    if (trackingActions?.addShipmentByBl) {
      trackingActions.addShipmentByBl(id, car);
      toast.success(`Tracking ${id}`);
      return { tracked: true, id };
    }
    // Tracking page not mounted — defer and navigate.
    pendingAdd.current = { bl: id, carrier: car };
    navigate(`/tracking?addBl=${encodeURIComponent(id)}&carrier=${encodeURIComponent(car)}`);
    toast.info(`Opening tracking for ${id}…`);
    return { tracked: false, navigated: true, id };
  }, [navigate]);

  useAiContext("procurement", null, { createRfq });
  useAiContext("global", null, { createRfq, addShipmentByBl });

  // Clean pending ref on unmount.
  useEffect(() => () => { pendingAdd.current = null; }, []);
  return null;
}
