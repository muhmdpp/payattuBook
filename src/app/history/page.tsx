"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { ArrowDownLeft, ArrowUpRight, Loader, BookOpen } from 'lucide-react';
import { getAllTransactions, Transaction, ME } from '@/services/payattuService';

function formatDate(ms: number): string {
    return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const txs = await getAllTransactions();
            setTransactions(txs);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Separate: money I gave OUT vs. money returned TO me
    const outgoing = transactions.filter(t => t.giverId === ME);
    const incoming = transactions.filter(t => t.receiverId === ME);

    return (
        <div className="page-container">
            <Header title="Transaction History" />
            <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <Loader size={28} color="#D1D5DB" className="spin" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: '#9CA3AF', gap: '1rem' }}>
                        <BookOpen size={48} color="#D1D5DB" />
                        <p>No transactions yet</p>
                    </div>
                ) : (
                    <>
                        {/* I gave money */}
                        {outgoing.length > 0 && (
                            <section style={{ marginBottom: '2rem' }}>
                                <div className="section-header" style={{ marginBottom: '0.75rem' }}>
                                    <div className="icon-circle" style={{ backgroundColor: '#F59E0B', width: 32, height: 32 }}>
                                        <ArrowUpRight size={16} color="white" />
                                    </div>
                                    <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Money I Gave</h2>
                                </div>
                                {outgoing.map(tx => <TxCard key={tx.id} tx={tx} />)}
                            </section>
                        )}

                        {/* Returned to me */}
                        {incoming.length > 0 && (
                            <section>
                                <div className="section-header" style={{ marginBottom: '0.75rem' }}>
                                    <div className="icon-circle" style={{ backgroundColor: '#22C55E', width: 32, height: 32 }}>
                                        <ArrowDownLeft size={16} color="white" />
                                    </div>
                                    <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Returned to Me</h2>
                                </div>
                                {incoming.map(tx => <TxCard key={tx.id} tx={tx} />)}
                            </section>
                        )}
                    </>
                )}

                <div style={{ height: '100px' }} />
            </main>
            <BottomNav />
        </div>
    );
}

function TxCard({ tx }: { tx: Transaction }) {
    const isMeGiver = tx.giverId === ME;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem', background: 'white', borderRadius: '0.75rem',
            border: '1px solid var(--border)', marginBottom: '0.75rem',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {isMeGiver ? tx.receiverName : tx.giverName}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {formatDate(tx.createdAt)}
                </p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: isMeGiver ? '#F59E0B' : '#22C55E' }}>
                    {isMeGiver ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                </p>
                <span style={{
                    fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                    borderRadius: '999px', backgroundColor: tx.status === 'pending' ? '#FEF3C7' : '#DCFCE7',
                    color: tx.status === 'pending' ? '#B45309' : '#15803D'
                }}>
                    {tx.status}
                </span>
            </div>
        </div>
    );
}
