"use client";

import { useState } from "react";
import { addContribution } from "../services/payattuService";

export default function AddContributionForm({ onAdded }: { onAdded: () => void }) {
    const [giverId, setGiverId] = useState("");
    const [receiverId, setReceiverId] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!giverId || !receiverId || !amount) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        try {
            await addContribution(giverId, receiverId, Number(amount));
            setGiverId("");
            setReceiverId("");
            setAmount("");
            onAdded(); // Refresh parent lists
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to add contribution");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-md bg-white text-black max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Contribution</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Giver ID / Name"
                    value={giverId}
                    onChange={(e) => setGiverId(e.target.value)}
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Receiver ID / Name"
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="p-2 border rounded"
                />
                <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="p-2 border rounded"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Adding..." : "Add pending contribution"}
                </button>
            </form>
        </div>
    );
}
