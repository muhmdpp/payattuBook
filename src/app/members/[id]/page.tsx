"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Phone, MapPin, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getMemberById, getTransactionsForMember, Member, Transaction, ME } from '@/services/payattuService';

function formatDate(ms: number): string {
    return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SkeletonBlock() {
    return (
        <div className="skeleton-card-block">
            <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text wide" />
                <div className="skeleton skeleton-text short" />
            </div>
            <div style={{ width: 80, textAlign: 'right' }}>
                <div className="skeleton skeleton-text full" />
                <div className="skeleton skeleton-text short" style={{ marginLeft: 'auto' }} />
            </div>
        </div>
    );
}

export default function MemberDetailPage() {
    const { id } = useParams() as { id: string };
    const [member, setMember] = useState<Member | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [m, txs] = await Promise.all([
                getMemberById(id),
                getTransactionsForMember(id),
            ]);
            setMember(m);
            setTransactions(txs);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const totalGiven = transactions.filter(t => t.giverId === ME && t.status === 'pending').reduce((s, t) => s + t.amount, 0);
    const totalReceived = transactions.filter(t => t.receiverId === ME).reduce((s, t) => s + t.amount, 0);

    return (
        <div className="page-container">
            <Header title={loading ? 'Member' : (member?.name ?? 'Member')} />
            <main style={{ flex: 1, overflowY: 'auto' }}>

                {/* Profile banner */}
                <div style={{ background: 'var(--primary-gradient)', padding: '1.5rem 1.25rem 2.5rem', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar-circle large" style={{ width: 64, height: 64, border: '3px solid rgba(255,255,255,0.4)' }} />
                        <div>
                            {loading ? (
                                <>
                                    <div className="skeleton skeleton-text wide" style={{ background: 'rgba(255,255,255,0.3)' }} />
                                    <div className="skeleton skeleton-text short" style={{ background: 'rgba(255,255,255,0.2)', marginTop: 8 }} />
                                </>
                            ) : (
                                <>
                                    <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{member?.name}</h2>
                                    {member?.nameMl && <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{member.nameMl}</p>}
                                </>
                            )}
                        </div>
                    </div>

                    {!loading && member && (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', opacity: 0.85 }}>
                            {member.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Phone size={12} /> {member.phone}
                                </span>
                            )}
                            {member.address && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={12} /> {member.address}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Summary cards */}
                <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', marginTop: '-1rem', position: 'relative', zIndex: 10 }}>
                    <div style={{ flex: 1, background: '#FEF3C7', borderRadius: '0.75rem', padding: '0.875rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.65rem', color: '#92400E', fontWeight: 500 }}>I Gave (Pending)</p>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#B45309' }}>₹{totalGiven.toLocaleString('en-IN')}</p>
                    </div>
                    <div style={{ flex: 1, background: '#DCFCE7', borderRadius: '0.75rem', padding: '0.875rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.65rem', color: '#14532D', fontWeight: 500 }}>Received Back</p>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#15803D' }}>₹{totalReceived.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Transaction history */}
                <div style={{ padding: '0 1.25rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Transaction History
                    </p>

                    {loading ? (
                        <><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /></>
                    ) : transactions.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem 0', color: '#9CA3AF', fontSize: '0.85rem' }}>
                            No transactions yet with {member?.name}
                        </p>
                    ) : (
                        transactions.map(tx => {
                            const iGave = tx.giverId === ME;
                            return (
                                <div key={tx.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.875rem 1rem', background: 'white', borderRadius: '0.75rem',
                                    border: '1px solid var(--border)', marginBottom: '0.6rem',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: iGave ? '#FEF3C7' : '#DCFCE7',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {iGave
                                                ? <ArrowUpRight size={14} color="#B45309" />
                                                : <ArrowDownLeft size={14} color="#15803D" />
                                            }
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{iGave ? 'I gave' : 'Received'}</p>
                                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{formatDate(tx.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: iGave ? '#F59E0B' : '#22C55E' }}>
                                            {iGave ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                                        </p>
                                        <span style={{
                                            fontSize: '0.6rem', fontWeight: 600, padding: '2px 6px',
                                            borderRadius: '999px',
                                            background: tx.status === 'pending' ? '#FEF3C7' : '#DCFCE7',
                                            color: tx.status === 'pending' ? '#B45309' : '#15803D'
                                        }}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div style={{ height: '100px' }} />
            </main>
            <BottomNav />
        </div>
    );
}
