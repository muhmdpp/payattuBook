import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    doc,
    runTransaction,
} from "firebase/firestore";
import { db } from "../lib/firebase";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const ME = "me"; // The single app user — always the attendee/giver

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
    hostId: string;        // → Member.id
    hostName?: string;     // Resolved from member (not stored, populated client-side)
    dateTime: number;      // ms timestamp
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
    // Resolved fields (not stored)
    giverName?: string;
    receiverName?: string;
}

// ─────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────

export async function addMember(data: Omit<Member, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "members"), {
        ...data,
        createdAt: Date.now(),
    });
    return docRef.id;
}

export async function getAllMembers(): Promise<Member[]> {
    const q = query(collection(db, "members"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member));
}

export async function getMemberById(id: string): Promise<Member | null> {
    if (id === ME) return { id: ME, name: "Me", createdAt: 0 };
    const snap = await getDoc(doc(db, "members", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Member;
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
    const docRef = await addDoc(collection(db, "events"), {
        hostId,
        dateTime,
        place,
        ...(note ? { note } : {}),
        createdAt: Date.now(),
    });
    return docRef.id;
}

export async function getUpcomingEvents(): Promise<Event[]> {
    const now = Date.now();
    const q = query(
        collection(db, "events"),
        where("dateTime", ">=", now),
        orderBy("dateTime", "asc")
    );
    const snap = await getDocs(q);
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event));
    return await resolveEventHostNames(events);
}

export async function getAllEvents(): Promise<Event[]> {
    const q = query(collection(db, "events"), orderBy("dateTime", "desc"));
    const snap = await getDocs(q);
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event));
    return await resolveEventHostNames(events);
}

async function resolveEventHostNames(events: Event[]): Promise<Event[]> {
    const memberCache: Record<string, string> = {};
    const resolved = await Promise.all(
        events.map(async (ev) => {
            if (!memberCache[ev.hostId]) {
                const m = await getMemberById(ev.hostId);
                memberCache[ev.hostId] = m?.name ?? "Unknown";
            }
            return { ...ev, hostName: memberCache[ev.hostId] };
        })
    );
    return resolved;
}

// ─────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────

/**
 * Mark that I (ME) gave money to a host at an event.
 * Creates: giverId="me" → receiverId=hostId → amount → pending
 */
export async function markMyPayment(
    eventId: string,
    hostId: string,
    amount: number
): Promise<string> {
    const docRef = await addDoc(collection(db, "transactions"), {
        giverId: ME,
        receiverId: hostId,
        amount,
        status: "pending",
        eventId,
        createdAt: Date.now(),
    });
    return docRef.id;
}

/**
 * Check if I already marked a payment for a specific event.
 * Returns the transaction if found, null if not yet paid.
 */
export async function getPaymentForEvent(eventId: string): Promise<Transaction | null> {
    const q = query(
        collection(db, "transactions"),
        where("giverId", "==", ME),
        where("eventId", "==", eventId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Transaction;
}

/**
 * Get all transactions involving a specific member (they gave to me or I gave to them).
 */
export async function getTransactionsForMember(memberId: string): Promise<Transaction[]> {
    const [gaveSnap, receivedSnap] = await Promise.all([
        getDocs(query(collection(db, "transactions"), where("giverId", "==", ME), where("receiverId", "==", memberId))),
        getDocs(query(collection(db, "transactions"), where("giverId", "==", memberId), where("receiverId", "==", ME))),
    ]);
    const txs: Transaction[] = [
        ...gaveSnap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)),
        ...receivedSnap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)),
    ];
    return txs.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get all pending amounts grouped by host (receiverId).
 * These are amounts hosts owe me to return in the future.
 */
export async function getMyPendingGiven(): Promise<
    { memberId: string; memberName: string; totalGiven: number; transactions: Transaction[] }[]
> {
    const q = query(
        collection(db, "transactions"),
        where("giverId", "==", ME),
        where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    const transactions: Transaction[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
    } as Transaction));

    const grouped: Record<string, { memberId: string; memberName: string; totalGiven: number; transactions: Transaction[] }> = {};
    for (const tx of transactions) {
        if (!grouped[tx.receiverId]) {
            const m = await getMemberById(tx.receiverId);
            grouped[tx.receiverId] = {
                memberId: tx.receiverId,
                memberName: m?.name ?? "Unknown",
                totalGiven: 0,
                transactions: [],
            };
        }
        grouped[tx.receiverId].totalGiven += tx.amount;
        grouped[tx.receiverId].transactions.push(tx);
    }
    return Object.values(grouped);
}

/**
 * Get pending amount I gave to a specific member.
 * Used on Home page to show contextual reminder for an upcoming event.
 */
export async function getPendingAmountForMember(memberId: string): Promise<number> {
    const q = query(
        collection(db, "transactions"),
        where("giverId", "==", ME),
        where("receiverId", "==", memberId),
        where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    return snap.docs.reduce((sum, d) => sum + (d.data().amount as number), 0);
}

/**
 * Get all transactions (pending + settled), newest first, with resolved names.
 */
export async function getAllTransactions(): Promise<Transaction[]> {
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const txs: Transaction[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));

    const memberCache: Record<string, string> = {};
    async function resolveName(id: string): Promise<string> {
        if (id === ME) return "Me";
        if (memberCache[id]) return memberCache[id];
        const m = await getMemberById(id);
        memberCache[id] = m?.name ?? "Unknown";
        return memberCache[id];
    }

    return await Promise.all(
        txs.map(async (tx) => ({
            ...tx,
            giverName: await resolveName(tx.giverId),
            receiverName: await resolveName(tx.receiverId),
        }))
    );
}

/**
 * Settle an old transaction and create a new return entry.
 * Used when a host returns money to me (with a custom bonus).
 *
 * Old:  me → hostId → 1000 → pending
 * New:  hostId → me → 1200 → pending (1000 + 200 bonus)
 */
export async function settleAndReturn(
    originalTransactionId: string,
    originalAmount: number,
    bonusAmount: number,
    hostId: string
): Promise<string> {
    let newId = "";
    await runTransaction(db, async (t) => {
        const oldRef = doc(db, "transactions", originalTransactionId);
        const oldDoc = await t.get(oldRef);
        if (!oldDoc.exists()) throw new Error("Transaction not found.");
        if (oldDoc.data().status !== "pending") throw new Error("Already settled.");

        const newRef = doc(collection(db, "transactions"));
        const newTx: Transaction = {
            giverId: hostId,
            receiverId: ME,
            amount: originalAmount + bonusAmount,
            bonusAmount,
            status: "pending",
            createdAt: Date.now(),
        };

        t.update(oldRef, {
            status: "settled",
            settledAt: Date.now(),
            relatedReturnId: newRef.id,
        });
        t.set(newRef, newTx);
        newId = newRef.id;
    });
    return newId;
}

// Legacy alias kept for compatibility
export async function addContribution(
    giverId: string,
    receiverId: string,
    amount: number
): Promise<string> {
    const docRef = await addDoc(collection(db, "transactions"), {
        giverId,
        receiverId,
        amount,
        status: "pending",
        createdAt: Date.now(),
    });
    return docRef.id;
}
