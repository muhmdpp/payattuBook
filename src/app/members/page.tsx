"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { BookOpen, ChevronRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { getAllMembers, Member } from '@/services/payattuService';

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
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllMembers();
            setMembers(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

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
                {loading ? (
                    <><SkeletonMember /><SkeletonMember /><SkeletonMember /><SkeletonMember /></>
                ) : members.length === 0 ? (
                    <div className="empty-state">
                        <BookOpen size={48} color="#D1D5DB" />
                        <p>No members yet.<br />Add members from the home screen.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {members.map(m => (
                            <Link key={m.id} href={`/members/${m.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.875rem 1rem', background: 'white',
                                    borderRadius: '0.75rem', border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div className="avatar-circle" style={{ width: 44, height: 44 }} />
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
