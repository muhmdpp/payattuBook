import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    runTransaction,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Transaction {
    id?: string;
    giverId: string;
    receiverId: string;
    amount: number;
    status: "pending" | "settled";
    createdAt: number;
    settledAt?: number;
    relatedReturnId?: string;
}

const TRANSACTIONS_COLLECTION = "transactions";

/**
 * Feature 1: Add Contribution (Pending)
 * Adds a new pending transaction where giver gives money to receiver.
 */
export async function addContribution(
    giverId: string,
    receiverId: string,
    amount: number
): Promise<string> {
    const newTransaction: Transaction = {
        giverId,
        receiverId,
        amount,
        status: "pending",
        createdAt: Date.now(),
    };

    const docRef = await addDoc(
        collection(db, TRANSACTIONS_COLLECTION),
        newTransaction
    );
    return docRef.id;
}

/**
 * Feature 2: "Who Owes Me?" Calculation
 * Fetches all pending transactions where the user is the receiver,
 * and groups the amounts by giver.
 */
export async function getOwedAmounts(
    userId: string
): Promise<{ giverId: string; totalOwed: number; transactions: Transaction[] }[]> {
    const q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where("receiverId", "==", userId),
        where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];

    querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });

    // Group by giver
    const grouped = transactions.reduce((acc, curr) => {
        if (!acc[curr.giverId]) {
            acc[curr.giverId] = { giverId: curr.giverId, totalOwed: 0, transactions: [] };
        }
        acc[curr.giverId].totalOwed += curr.amount;
        acc[curr.giverId].transactions.push(curr);
        return acc;
    }, {} as Record<string, { giverId: string; totalOwed: number; transactions: Transaction[] }>);

    return Object.values(grouped);
}

/**
 * Feature 3: Return Contribution (Settlement)
 * Settles an old transaction and creates a new one with the original amount + bonus.
 */
export async function settleAndReturn(
    originalTransactionId: string,
    originalAmount: number,
    bonusAmount: number,
    currentGiverId: string, // The person returning the money (was the receiver)
    currentReceiverId: string // The person receiving the return (was the giver)
): Promise<string> {
    let newTransactionId = "";

    await runTransaction(db, async (transaction) => {
        const oldDocRef = doc(db, TRANSACTIONS_COLLECTION, originalTransactionId);

        // 1. Verify the old document exists (optional safety check, but good practice)
        const oldDoc = await transaction.get(oldDocRef);
        if (!oldDoc.exists()) {
            throw new Error("Original transaction does not exist!");
        }

        if (oldDoc.data().status !== "pending") {
            throw new Error("Original transaction is already settled!");
        }

        // 2. Prepare the new returned transaction
        const newTransactionRef = doc(collection(db, TRANSACTIONS_COLLECTION));
        const newTransactionData: Transaction = {
            giverId: currentGiverId,
            receiverId: currentReceiverId,
            amount: originalAmount + bonusAmount,
            status: "pending",
            createdAt: Date.now(),
        };

        // 3. Perform the writes in the transaction block
        // Mark old as settled
        transaction.update(oldDocRef, {
            status: "settled",
            settledAt: Date.now(),
            relatedReturnId: newTransactionRef.id,
        });

        // Create new pending entry
        transaction.set(newTransactionRef, newTransactionData);

        newTransactionId = newTransactionRef.id;
    });

    return newTransactionId;
}
