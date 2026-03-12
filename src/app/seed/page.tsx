"use client";

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Database, Loader, Check, CheckCircle2 } from 'lucide-react';
import { seedMemberPayattu } from '@/services/payattuService';
import { transliterateToMalayalam } from '@/lib/transliterate';
import './Seed.css';

interface ReceiptEntry {
    name: string;
    paid: number;
    balance: number;
    id: number;
}

export default function SeedPage() {
    const [name, setName] = useState('');
    const [nameMl, setNameMl] = useState('');
    const [hasManuallyEditedMl, setHasManuallyEditedMl] = useState(false);
    const [paid, setPaid] = useState('');
    const [balance, setBalance] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [receipts, setReceipts] = useState<ReceiptEntry[]>([]);

    const nameInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the name input when the page loads
    useEffect(() => {
        nameInputRef.current?.focus();
    }, []);

    // Auto-transliteration
    useEffect(() => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            if (!hasManuallyEditedMl) setNameMl('');
            return;
        }

        if (hasManuallyEditedMl) return;

        const timer = setTimeout(async () => {
            const mlText = await transliterateToMalayalam(trimmedName);
            if (mlText && !hasManuallyEditedMl) {
                setNameMl(mlText);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [name, hasManuallyEditedMl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !paid) return;

        setLoading(true);
        const paidAmount = Number(paid);
        const balanceAmount = Number(balance) || 0; // If empty, assume 0

        try {
            await seedMemberPayattu(name.trim(), nameMl.trim() || undefined, paidAmount, balanceAmount);

            // Add to receipt tape at the top
            setReceipts(prev => [
                { name: name.trim(), paid: paidAmount, balance: balanceAmount, id: Date.now() },
                ...prev
            ].slice(0, 5)); // Keep last 5

            // Reset form for rapid entry
            setName('');
            setNameMl('');
            setHasManuallyEditedMl(false);
            setPaid('');
            setBalance('');

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                // Return focus to name input automatically
                nameInputRef.current?.focus();
            }, 1000);

        } catch (error) {
            console.error("Migration failed:", error);
            alert("Failed to save entry. Check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <Header title="Migrate Notebook" />
            <main className="seed-container">

                <div className="seed-card">
                    <div className="seed-header">
                        <Database size={24} color="#3B82F6" />
                        <h2>Rapid Data Entry</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="seed-form">
                        <div className="seed-input-group">
                            <label>Member Name</label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                placeholder="E.g. Nadukkandi Nasar"
                                className="seed-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="seed-input-group">
                            <label>Name in മലയാളം (Auto-fills)</label>
                            <input
                                type="text"
                                placeholder="നടുക്കണ്ടി നാസർ"
                                className="seed-input"
                                value={nameMl}
                                onChange={e => {
                                    setNameMl(e.target.value);
                                    setHasManuallyEditedMl(true);
                                }}
                            />
                        </div>

                        <div className="seed-input-group">
                            <label>Amount Paid Now</label>
                            <input
                                type="number"
                                placeholder="₹ 8000"
                                className="seed-input numeric"
                                value={paid}
                                onChange={e => setPaid(e.target.value)}
                                required
                            />
                        </div>

                        <div className="seed-input-group">
                            <label>Balance After &apos;X&apos; (Optional)</label>
                            <input
                                type="number"
                                placeholder="₹ 5000 (Leave blank if none)"
                                className="seed-input numeric"
                                value={balance}
                                onChange={e => setBalance(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="seed-submit-btn"
                            disabled={loading || !name.trim() || !paid}
                        >
                            {loading ? (
                                <Loader size={20} className="spin" />
                            ) : success ? (
                                <><Check size={20} /> Saved!</>
                            ) : (
                                "Save & Next"
                            )}
                        </button>
                    </form>
                </div>

                {receipts.length > 0 && (
                    <div className="receipt-tape">
                        <div className="receipt-header">
                            <CheckCircle2 size={16} /> Look back at what you just typed
                        </div>
                        <div className="receipt-list">
                            {receipts.map(r => (
                                <div key={r.id} className="receipt-item">
                                    <div className="receipt-item-name">{r.name}</div>
                                    <div className="receipt-item-amounts">
                                        <span className="receipt-item-paid">₹{r.paid}</span>
                                        <span className="receipt-item-balance">
                                            {r.balance > 0 ? `Bal: ₹${r.balance}` : "Bal: ₹0"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
            <BottomNav />
        </div>
    );
}
