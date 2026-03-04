"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { BarChart2, Loader, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { getMyPendingGiven, getAllTransactions, Transaction, ME } from '@/services/payattuService';

export default function AnalyticsPage() {
    const [pendingGroups, setPendingGroups] = useState<{ memberId: string; memberName: string; totalGiven: number }[]>([]);
    const [allTxs, setAllTxs] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [groups, txs] = await Promise.all([getMyPendingGiven(), getAllTransactions()]);
            setPendingGroups(groups);
            setAllTxs(txs);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const totalPendingGiven = pendingGroups.reduce((s, g) => s + g.totalGiven, 0);
    const totalReceived = allTxs.filter(t => t.receiverId === ME).reduce((s, t) => s + t.amount, 0);

    return (
        <div className="page-container">
            <Header title="Analytics" />
            <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <Loader size={28} color="#D1D5DB" className="spin" />
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <StatCard
                                icon={<TrendingDown size={18} color="#F59E0B" />}
                                label="Total Given (Pending)"
                                value={`₹${totalPendingGiven.toLocaleString('en-IN')}`}
                                accent="#FEF3C7"
                            />
                            <StatCard
                                icon={<TrendingUp size={18} color="#22C55E" />}
                                label="Total Received Back"
                                value={`₹${totalReceived.toLocaleString('en-IN')}`}
                                accent="#DCFCE7"
                            />
                        </div>

                        {/* Per-member breakdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div className="icon-circle" style={{ backgroundColor: 'var(--primary)', width: 32, height: 32 }}>
                                <Users size={16} color="white" />
                            </div>
                            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Pending by Member</h2>
                        </div>

                        {pendingGroups.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0', color: '#9CA3AF', gap: '0.75rem' }}>
                                <BarChart2 size={48} color="#D1D5DB" />
                                <p style={{ fontSize: '0.875rem' }}>No pending amounts</p>
                            </div>
                        ) : (
                            pendingGroups
                                .sort((a, b) => b.totalGiven - a.totalGiven)
                                .map(g => (
                                    <div key={g.memberId} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '0.875rem 1.25rem', background: 'white', borderRadius: '0.75rem',
                                        border: '1px solid var(--border)', marginBottom: '0.75rem',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="avatar-circle" style={{ width: 38, height: 38, flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{g.memberName}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F59E0B' }}>
                                                ₹{g.totalGiven.toLocaleString('en-IN')}
                                            </p>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>pending return</p>
                                        </div>
                                    </div>
                                ))
                        )}
                    </>
                )}
                <div style={{ height: '100px' }} />
            </main>
            <BottomNav />
        </div>
    );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
    return (
        <div style={{
            flex: 1, minWidth: '140px', background: accent, borderRadius: '0.75rem',
            padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem'
        }}>
            {icon}
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</p>
        </div>
    );
}
