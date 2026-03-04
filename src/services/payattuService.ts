import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const ME = "me";

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface Member {
    id?: string;
    name: string;
    nameMl?: string;
    phone?: string;
    address?: string;
    createdAt: number;
}

export interface Event {
    id?: string;
    hostId: string;
    hostName?: string;
    dateTime: number;
    place: string;
    note?: string;
    createdAt: number;
}

export interface Transaction {
    id?: string;
    giverId: string;
    receiverId: string;
    amount: number;
    status: "pending" | "settled";
    eventId?: string;
    createdAt: number;
    settledAt?: number;
    bonusAmount?: number;
    relatedReturnId?: string;
    giverName?: string;
    receiverName?: string;
}

// Helper to convert ISO dates to ms timestamps
function toMs(dateString: string): number {
    return new Date(dateString).getTime();
}

// ─────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────

export async function addMember(data: Omit<Member, "id" | "createdAt">): Promise<string> {
    const { data: result, error } = await supabase
        .from("members")
        .insert([{
            name: data.name,
            name_ml: data.nameMl,
            phone: data.phone,
            address: data.address
            // id and created_at handled by DB defaults
        }])
        .select("id")
        .single();

    if (error) throw new Error(error.message);
    return result.id;
}

export async function getAllMembers(): Promise<Member[]> {
    const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((d: Record<string, unknown>) => ({
        id: d.id as string,
        name: d.name as string,
        nameMl: d.name_ml as string | undefined,
        phone: d.phone as string | undefined,
        address: d.address as string | undefined,
        createdAt: toMs(d.created_at as string),
    }));
}

export async function getMemberById(id: string): Promise<Member | null> {
    if (id === ME) return { id: ME, name: "Me", createdAt: 0 };
    const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // not found
        throw new Error(error.message);
    }

    return {
        id: data.id,
        name: data.name,
        nameMl: data.name_ml,
        phone: data.phone,
        address: data.address,
        createdAt: toMs(data.created_at),
    };
}

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────

export async function addEvent(
    hostId: string,
    dateTime: number,
    place: string,
    note?: string
): Promise<string> {
    const { data, error } = await supabase
        .from("events")
        .insert([{
            host_id: hostId,
            date_time: new Date(dateTime).toISOString(),
            place,
            note
        }])
        .select("id")
        .single();

    if (error) throw new Error(error.message);
    return data.id;
}

export async function updateEvent(
    id: string,
    hostId: string,
    dateTime: number,
    place: string,
    note?: string
): Promise<void> {
    const { error } = await supabase
        .from("events")
        .update({
            host_id: hostId,
            date_time: new Date(dateTime).toISOString(),
            place,
            note
        })
        .eq("id", id);

    if (error) throw new Error(error.message);
}

export async function updateMember(id: string, data: Omit<Member, "id" | "createdAt">): Promise<void> {
    const { error } = await supabase
        .from("members")
        .update({
            name: data.name,
            name_ml: data.nameMl,
            phone: data.phone,
            address: data.address,
        })
        .eq("id", id);

    if (error) throw new Error(error.message);
}

/**
 * Notice how Supabase lets us JOIN the member table in one query.
 * No N+1 queries needed anymore!
 */
export async function getUpcomingEvents(): Promise<Event[]> {
    const { data, error } = await supabase
        .from("events")
        .select(`
            *,
            members ( name )
        `)
        .gte("date_time", new Date().toISOString())
        .order("date_time", { ascending: true });

    if (error) throw new Error(error.message);

    return data.map((d: Record<string, unknown>) => {
        const membersData = d.members as { name: string } | null;
        return {
            id: d.id as string,
            hostId: d.host_id as string,
            dateTime: toMs(d.date_time as string),
            place: d.place as string,
            note: d.note as string | undefined,
            createdAt: toMs(d.created_at as string),
            hostName: membersData?.name ?? "Unknown",
        };
    });
}

export async function getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
        .from("events")
        .select(`
            *,
            members ( name )
        `)
        .order("date_time", { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((d: Record<string, unknown>) => {
        const membersData = d.members as { name: string } | null;
        return {
            id: d.id as string,
            hostId: d.host_id as string,
            dateTime: toMs(d.date_time as string),
            place: d.place as string,
            note: d.note as string | undefined,
            createdAt: toMs(d.created_at as string),
            hostName: membersData?.name ?? "Unknown",
        };
    });
}

// ─────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────

export async function markMyPayment(
    eventId: string,
    hostId: string,
    amount: number
): Promise<string> {
    const { data, error } = await supabase
        .from("transactions")
        .insert([{
            giver_id: ME,
            receiver_id: hostId,
            amount,
            status: "pending",
            event_id: eventId
        }])
        .select("id")
        .single();

    if (error) throw new Error(error.message);
    return data.id;
}

export async function getPaymentForEvent(eventId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("giver_id", ME)
        .eq("event_id", eventId)
        .limit(1)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
        id: data.id,
        giverId: data.giver_id,
        receiverId: data.receiver_id,
        amount: data.amount,
        status: data.status,
        eventId: data.event_id,
        createdAt: toMs(data.created_at),
    };
}

export async function getTransactionsForMember(memberId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .or(`and(giver_id.eq.${ME},receiver_id.eq.${memberId}),and(giver_id.eq.${memberId},receiver_id.eq.${ME})`)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((d: Record<string, unknown>) => ({
        id: d.id as string,
        giverId: d.giver_id as string,
        receiverId: d.receiver_id as string,
        amount: Number(d.amount),
        status: d.status as "pending" | "settled",
        eventId: d.event_id as string | undefined,
        createdAt: toMs(d.created_at as string),
        settledAt: d.settled_at ? toMs(d.settled_at as string) : undefined,
    }));
}

export async function getMyPendingGiven(): Promise<
    { memberId: string; memberName: string; totalGiven: number; transactions: Transaction[] }[]
> {
    const [txResp, memResp] = await Promise.all([
        supabase.from("transactions").select("*").eq("giver_id", ME).eq("status", "pending"),
        supabase.from("members").select("id, name")
    ]);

    if (txResp.error) throw new Error(txResp.error.message);
    if (memResp.error) throw new Error(memResp.error.message);

    const membersMap = Object.fromEntries(memResp.data.map((m: { id: string, name: string }) => [m.id, m.name]));

    const grouped: Record<string, { memberId: string; memberName: string; totalGiven: number; transactions: Transaction[] }> = {};
    for (const d of txResp.data) {
        const receiverId = d.receiver_id as string;
        if (!grouped[receiverId]) {
            grouped[receiverId] = {
                memberId: receiverId,
                memberName: membersMap[receiverId] ?? "Unknown",
                totalGiven: 0,
                transactions: [],
            };
        }
        grouped[receiverId].totalGiven += Number(d.amount);
        grouped[receiverId].transactions.push({
            id: d.id as string,
            giverId: d.giver_id as string,
            receiverId: receiverId,
            amount: Number(d.amount),
            status: d.status as "pending" | "settled",
            createdAt: toMs(d.created_at as string)
        });
    }
    return Object.values(grouped);
}

export async function getPendingAmountForMember(memberId: string): Promise<number> {
    const { data, error } = await supabase
        .rpc('calculate_pending_amount', { p_member_id: memberId });

    // Fallback if RPC isn't loaded yet: fallback to summing rows
    if (error) {
        const { data: rows, error: rErr } = await supabase
            .from("transactions")
            .select("amount")
            .eq("giver_id", ME)
            .eq("receiver_id", memberId)
            .eq("status", "pending");

        if (rErr) throw new Error(rErr.message);
        return rows.reduce((acc, row) => acc + Number(row.amount), 0);
    }
    return Number(data || 0);
}

export async function getAllTransactions(): Promise<Transaction[]> {
    const [txResp, memResp] = await Promise.all([
        supabase.from("transactions").select("*").order("created_at", { ascending: false }),
        supabase.from("members").select("id, name")
    ]);

    if (txResp.error) throw new Error(txResp.error.message);
    if (memResp.error) throw new Error(memResp.error.message);

    const membersMap = Object.fromEntries(memResp.data.map((m: { id: string, name: string }) => [m.id, m.name]));
    membersMap[ME] = "Me";

    return txResp.data.map((d: Record<string, unknown>) => {
        const giverId = d.giver_id as string;
        const receiverId = d.receiver_id as string;
        return {
            id: d.id as string,
            giverId: giverId,
            receiverId: receiverId,
            amount: Number(d.amount),
            status: d.status as "pending" | "settled",
            createdAt: toMs(d.created_at as string),
            giverName: membersMap[giverId] ?? "Unknown",
            receiverName: membersMap[receiverId] ?? "Unknown",
        };
    });
}

export async function settleAndReturn(
    originalTransactionId: string,
    originalAmount: number,
    bonusAmount: number,
    hostId: string
): Promise<string> {
    // Supabase JS doesn't have an interactive transaction API like runTransaction.
    // Instead we do an RPC call (ideal) or a 2-step process. 
    // We will do a simple 2-step process here (insert new, update old). For strict ACID, an RPC is needed.

    // 1. Insert new
    const { data: newTx, error: errC } = await supabase
        .from("transactions")
        .insert([{
            giver_id: hostId,
            receiver_id: ME,
            amount: originalAmount + bonusAmount,
            bonus_amount: bonusAmount,
            status: "pending"
        }])
        .select("id")
        .single();
    if (errC) throw new Error(errC.message);

    // 2. Update old
    const { error: errU } = await supabase
        .from("transactions")
        .update({
            status: "settled",
            settled_at: new Date().toISOString(),
            related_return_id: newTx.id
        })
        .eq("id", originalTransactionId)
        .eq("status", "pending");

    if (errU) throw new Error(errU.message);

    return newTx.id;
}

// Legacy alias kept for compatibility
export async function addContribution(
    giverId: string,
    receiverId: string,
    amount: number
): Promise<string> {
    const { data, error } = await supabase
        .from("transactions")
        .insert([{ giver_id: giverId, receiver_id: receiverId, amount, status: "pending" }])
        .select("id")
        .single();
    if (error) throw new Error(error.message);
    return data.id;
}

/**
 * Records money received from a NEW giver (no prior pending transaction).
 * Creates: giver=memberId → receiver=ME → amount → PENDING
 */
export async function receiveFromNewMember(memberId: string, amount: number): Promise<string> {
    const { data, error } = await supabase
        .from("transactions")
        .insert([{
            giver_id: memberId,
            receiver_id: ME,
            amount,
            status: "pending"
        }])
        .select("id")
        .single();
    if (error) throw new Error(error.message);
    return data.id;
}

/**
 * Settles ALL pending transactions from ME → memberId at once,
 * and creates one new return record: memberId → ME.
 */
export async function settleAllAndReturn(
    memberId: string,
    returnAmount: number,
    bonusAmount: number
): Promise<string> {
    // Get all pending tx IDs for this member
    const { data: pendingTxs, error: fetchErr } = await supabase
        .from("transactions")
        .select("id")
        .eq("giver_id", ME)
        .eq("receiver_id", memberId)
        .eq("status", "pending");

    if (fetchErr) throw new Error(fetchErr.message);

    // 1. Insert the new return record
    const { data: newTx, error: insertErr } = await supabase
        .from("transactions")
        .insert([{
            giver_id: memberId,
            receiver_id: ME,
            amount: returnAmount,
            bonus_amount: bonusAmount,
            status: "pending"
        }])
        .select("id")
        .single();
    if (insertErr) throw new Error(insertErr.message);

    // 2. Settle all old pending transactions
    if (pendingTxs.length > 0) {
        const ids = pendingTxs.map((t: { id: string }) => t.id);
        const { error: updateErr } = await supabase
            .from("transactions")
            .update({
                status: "settled",
                settled_at: new Date().toISOString(),
                related_return_id: newTx.id
            })
            .in("id", ids);
        if (updateErr) throw new Error(updateErr.message);
    }

    return newTx.id;
}
