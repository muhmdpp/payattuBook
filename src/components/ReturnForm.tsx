"use client";

import { useState } from "react";
import { Transaction, settleAndReturn } from "../services/payattuService";

export default function ReturnForm({
    transaction,
    onComplete,
    onCancel,
}: {
    transaction: Transaction;
    onComplete: () => void;
    onCancel: () => void;
}) {
    const [bonus, setBonus] = useState("0");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!transaction.id) throw new Error("Missing transaction ID");

            // The previous receiver is now returning the money, so they become the new Giver
            const currentGiverId = transaction.receiverId;
            // The previous giver is receiving it back, so they become the new Receiver 
            const currentReceiverId = transaction.giverId;

            const bonusNumber = Number(bonus) || 0;

            await settleAndReturn(
                transaction.id,
                transaction.amount,
                bonusNumber,
                currentGiverId,
                currentReceiverId
            );

            onComplete(); // success
        } catch (err: any) {
            setError(err.message || "Failed to process return");
        } finally {
            setLoading(false);
        }
    };

    const totalReturn = transaction.amount + (Number(bonus) || 0);

    return (
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <h3 className="font-bold text-lg mb-2 text-yellow-800">Process Return (Settlement)</h3>
            <p className="text-sm mb-4">
                Original debt: <strong>₹{transaction.amount}</strong> from{" "}
                <strong>{transaction.giverId}</strong> to <strong>{transaction.receiverId}</strong>.
            </p>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <form onSubmit={handleReturn} className="flex flex-col gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Add Bonus Amount (₹):</label>
                    <input
                        type="number"
                        value={bonus}
                        onChange={(e) => setBonus(e.target.value)}
                        className="w-full p-2 border rounded"
                        min="0"
                    />
                </div>

                <div className="bg-white p-2 rounded shadow-sm text-center">
                    Total New Pending Debt:
                    <strong className="text-xl ml-2">₹{totalReturn}</strong>
                    <br />
                    <span className="text-xs text-gray-500">
                        ({transaction.receiverId} will now owe {transaction.giverId} this amount)
                    </span>
                </div>

                <div className="flex gap-2 mt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700 disabled:opacity-50 font-bold"
                    >
                        {loading ? "Processing..." : "Settle & Create New Entry"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
