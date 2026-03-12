"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { BookOpen, ChevronRight, UserPlus, Search, FileText, List } from 'lucide-react';
import Link from 'next/link';
import { getAllMembers, Member, getAllTransactions, Transaction, ME } from '@/services/payattuService';
import { getAvatarColor, getInitials } from '@/lib/colors';

function SkeletonMember() {
    return (
        <div className="skeleton-card-block">
            <div className="skeleton skeleton-circle" style={{ width: 44, height: 44 }} />
            <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text wide" />
                <div className="skeleton skeleton-text short" />
            </div>
        </div>
    );
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isNotebookView, setIsNotebookView] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [membersData, txData] = await Promise.all([
                getAllMembers(),
                getAllTransactions()
            ]);
            setMembers(membersData);
            setTransactions(txData);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filteredMembers = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return members;
        return members.filter(m =>
            m.name.toLowerCase().includes(query) ||
            (m.nameMl && m.nameMl.toLowerCase().includes(query)) ||
            (m.phone && m.phone.includes(query))
        );
    }, [members, searchQuery]);

    // Compute notebook data
    const memberStats = useMemo(() => {
        const stats: Record<string, { paid: number, balance: number }> = {};

        // Initialize stats
        members.forEach(m => {
            if (m.id) {
                stats[m.id] = { paid: 0, balance: 0 };
            }
        });

        // Compute from transactions
        transactions.forEach(tx => {
            if (tx.giverId === ME && tx.receiverId === ME) return;

            if (tx.giverId === ME) {
                // ME gave to Member (Member borrowed from ME)
                if (tx.status === "settled" && stats[tx.receiverId]) {
                    // Member paid back this debt -> they gave money
                    stats[tx.receiverId].paid += tx.amount;
                }
            } else if (tx.receiverId === ME) {
                // Member gave to ME
                if (stats[tx.giverId]) {
                    // If this transaction settled a previous debt, it has a bonusAmount.
                    // The pure *new* cash added to the balance is the bonusAmount.
                    // The portion that settled the old debt was already added to `paid` when we processed the `ME -> Member (settled)` transaction.
                    const netGiven = tx.bonusAmount !== undefined ? tx.bonusAmount : tx.amount;
                    stats[tx.giverId].paid += netGiven;

                    // If it's still pending, it means ME owes them this amount as a balance
                    if (tx.status === "pending") {
                        stats[tx.giverId].balance += netGiven;
                    }
                }
            }
        });

        return stats;
    }, [members, transactions]);

    return (
        <div className="page-container">
            <Header title="Members" showBack={false} />
            <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>

                {/* Add Member CTA */}
                <Link href="/add-member" style={{ display: 'flex', textDecoration: 'none', marginBottom: '1rem' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        color: 'white', fontWeight: 600, fontSize: '0.9rem',
                        boxShadow: '0 4px 10px rgba(139,92,246,0.3)'
                    }}>
                        <UserPlus size={18} />
                        Add New Member
                    </div>
                </Link>

                {/* Search Bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'white', borderRadius: '0.75rem',
                    padding: '0.75rem 1rem', marginBottom: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid var(--border)'
                }}>
                    <Search size={18} color="#9CA3AF" />
                    <input
                        type="search"
                        placeholder="Search by name or phone..."
                        style={{
                            border: 'none', outline: 'none', width: '100%',
                            fontSize: '0.95rem', background: 'transparent'
                        }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* View Toggle */}
                {!loading && members.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <div style={{
                            display: 'flex', background: '#e5e7eb', borderRadius: '0.5rem', padding: '0.25rem'
                        }}>
                            <button
                                onClick={() => setIsNotebookView(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem',
                                    borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 600,
                                    background: !isNotebookView ? 'white' : 'transparent',
                                    color: !isNotebookView ? 'var(--primary)' : 'var(--text-muted)',
                                    boxShadow: !isNotebookView ? 'var(--shadow-sm)' : 'none',
                                    transition: 'all 0.2s', border: 'none'
                                }}
                            >
                                <List size={16} /> List
                            </button>
                            <button
                                onClick={() => setIsNotebookView(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem',
                                    borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 600,
                                    background: isNotebookView ? 'white' : 'transparent',
                                    color: isNotebookView ? 'var(--primary)' : 'var(--text-muted)',
                                    boxShadow: isNotebookView ? 'var(--shadow-sm)' : 'none',
                                    transition: 'all 0.2s', border: 'none'
                                }}
                            >
                                <FileText size={16} /> Book
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <><SkeletonMember /><SkeletonMember /><SkeletonMember /><SkeletonMember /></>
                ) : members.length === 0 ? (
                    <div className="empty-state">
                        <BookOpen size={48} color="#D1D5DB" />
                        <p>No members yet.<br />Add members from the home screen.</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="empty-state">
                        <Search size={40} color="#D1D5DB" />
                        <p style={{ marginTop: '0.5rem' }}>No members match &quot;{searchQuery}&quot;</p>
                    </div>
                ) : isNotebookView ? (
                    <div className="notebook-wrapper">
                        {filteredMembers.map((m, index) => {
                            const stats = m.id ? memberStats[m.id] : { paid: 0, balance: 0 };
                            return (
                                <div key={m.id} className="notebook-row">
                                    <div className="notebook-cell cell-sl">{index + 1}</div>
                                    <div className="notebook-cell cell-name">
                                        <span>{m.nameMl || m.name}</span>
                                    </div>
                                    <div className="notebook-cell cell-amount-container">
                                        <div className="cell-paid">
                                            {stats.paid || 0}
                                        </div>
                                        <div className="cell-balance">
                                            <span style={{ fontSize: '0.9rem', color: '#6b7280', marginRight: '4px' }}>×</span>
                                            {stats.balance > 0 ? stats.balance : ''}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {filteredMembers.map(m => (
                            <Link key={m.id} href={`/members/${m.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.875rem 1rem', background: 'white',
                                    borderRadius: '0.75rem', border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div
                                        className="avatar-circle"
                                        style={{
                                            width: 44,
                                            height: 44,
                                            backgroundColor: getAvatarColor(m.name),
                                            color: '#ffffff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {getInitials(m.name)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</p>
                                        {m.nameMl && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.nameMl}</p>}
                                        {m.phone && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.phone}</p>}
                                    </div>
                                    <ChevronRight size={18} color="#D1D5DB" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                <div style={{ height: '100px' }} />
            </main>
            <BottomNav />
        </div>
    );
}
