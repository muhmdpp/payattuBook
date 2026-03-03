"use client";

import { useState, useEffect } from "react";
import { getOwedAmounts, Transaction } from "../services/payattuService";
import ReturnForm from "./ReturnForm";

export default function OwedList({
    userId,
    refreshTrigger,
    onReturned,
}: {
    userId: string;
    refreshTrigger: number;
    onReturned: () => void;
}) {
    const [owedList, setOwedList] = useState<
        { giverId: string; totalOwed: number; transactions: Transaction[] }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        if (!userId) {
            setOwedList([]);
            return;
        }
        const fetchOwed = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getOwedAmounts(userId);
                setOwedList(data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to fetch owed amounts");
            } finally {
                setLoading(false);
            }
        };
        fetchOwed();
    }, [userId, refreshTrigger]);

    if (loading) return <p>Loading debts...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-4 border rounded-md bg-white text-black mt-4 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Who Owes {userId || "Me"}?</h2>
            {owedList.length === 0 ? (
                <p className="text-gray-500">No one owes {userId || "you"} anything.</p>
            ) : (
                <ul className="space-y-4">
                    {owedList.map((group) => (
                        <li key={group.giverId} className="border p-3 rounded bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">{group.giverId}</span>
                                <span className="text-green-600 font-bold">₹{group.totalOwed} Owed Total</span>
                            </div>
                            <ul className="pl-4 border-l-2 border-gray-300 space-y-2">
                                {group.transactions.map((t) => (
                                    <li key={t.id} className="text-sm flex justify-between items-center">
                                        <span>
                                            Original: ₹{t.amount} (Given on {new Date(t.createdAt).toLocaleDateString()})
                                        </span>
                                        <button
                                            onClick={() => setSelectedTransaction(t)}
                                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                        >
                                            Process Return
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}

            {selectedTransaction && (
                <div className="mt-6 border-t pt-4">
                    <ReturnForm
                        transaction={selectedTransaction}
                        onComplete={() => {
                            setSelectedTransaction(null);
                            onReturned(); // trigger refresh
                        }}
                        onCancel={() => setSelectedTransaction(null)}
                    />
                </div>
            )}
        </div>
    );
}
