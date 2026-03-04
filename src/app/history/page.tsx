"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { ArrowDownLeft, ArrowUpRight, BookOpen } from 'lucide-react';
import { getAllTransactions, Transaction, ME } from '@/services/payattuService';

function formatDate(ms: number): string {
    return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SkeletonTxCard() {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem', background: 'white', borderRadius: '0.75rem',
            border: '1px solid var(--border)', marginBottom: '0.75rem', boxShadow: 'var(--shadow-sm)'
        }}>
            <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text wide" style={{ marginBottom: 6 }} />
                <div className="skeleton skeleton-text short" />
            </div>
            <div style={{ width: 80, textAlign: 'right' }}>
                <div className="skeleton skeleton-text full" style={{ marginBottom: 6 }} />
                <div className="skeleton skeleton-text short" style={{ marginLeft: 'auto' }} />
            </div>
        </div>
    );
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

    const outgoing = transactions.filter(t => t.giverId === ME);
    const incoming = transactions.filter(t => t.receiverId === ME);

    return (
        <div className="page-container">
            <Header title="Transaction History" />
            <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>

                {loading ? (
                    <>
                        {/* Skeleton — Money I Gave */}
                        <div className="section-header" style={{ marginBottom: '0.75rem' }}>
                            <div className="skeleton skeleton-circle" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                            <div className="skeleton skeleton-text wide" style={{ height: '1rem' }} />
                        </div>
                        <SkeletonTxCard /><SkeletonTxCard /><SkeletonTxCard />

                        {/* Skeleton — Returned to Me */}
                        <div className="section-header" style={{ margin: '1.5rem 0 0.75rem' }}>
                            <div className="skeleton skeleton-circle" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                            <div className="skeleton skeleton-text wide" style={{ height: '1rem' }} />
                        </div>
                        <SkeletonTxCard /><SkeletonTxCard />
                    </>
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
