"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { ArrowDownLeft, Plus, Check, Loader, Search } from 'lucide-react';
import {
    getMyPendingGiven,
    getAllMembers,
    settleAllAndReturn,
    receiveFromNewMember,
    Member
} from '@/services/payattuService';
import './ReceivePayment.css';

interface PendingGroup {
    memberId: string;
    memberName: string;
    totalGiven: number;
}

interface NewEntry {
    id: string;
    member: Member | null;
    search: string;
    showDropdown: boolean;
    amount: string;
}

function emptyEntry(): NewEntry {
    return { id: Math.random().toString(36).slice(2), member: null, search: '', showDropdown: false, amount: '' };
}

export default function ReceivePaymentPage() {
    const [pendingGroups, setPendingGroups] = useState<PendingGroup[]>([]);
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    // Per-member amounts for pending settlemnts
    const [amountMap, setAmountMap] = useState<Record<string, string>>({});
    const [settledIds, setSettledIds] = useState<Set<string>>(new Set());
    const [savingId, setSavingId] = useState<string | null>(null);

    // New givers panel
    const [newEntries, setNewEntries] = useState<NewEntry[]>([emptyEntry()]);
    const [savingNew, setSavingNew] = useState<Set<string>>(new Set());
    const [savedNew, setSavedNew] = useState<Set<string>>(new Set());

    const [error, setError] = useState('');

    const showError = (msg: string) => {
        setError(msg);
        setTimeout(() => setError(''), 3000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [groups, members] = await Promise.all([getMyPendingGiven(), getAllMembers()]);
            setPendingGroups(groups);
            setAllMembers(members);
            // Pre-fill amounts with original totals
            const map: Record<string, string> = {};
            groups.forEach(g => { map[g.memberId] = String(g.totalGiven); });
            setAmountMap(map);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Settle existing pending ────────────────────────────────────────────────
    const handleSettle = async (group: PendingGroup) => {
        const rawAmount = amountMap[group.memberId] ?? '';
        const returnAmount = parseFloat(rawAmount);
        if (!returnAmount || returnAmount <= 0) { showError(`Enter a valid amount for ${group.memberName}.`); return; }
        if (returnAmount < group.totalGiven) { showError(`Minimum amount is ₹${group.totalGiven.toLocaleString('en-IN')} (total owed).`); return; }
        setError('');
        setSavingId(group.memberId);
        try {
            const bonus = Math.max(0, returnAmount - group.totalGiven);
            await settleAllAndReturn(group.memberId, returnAmount, bonus);
            setSettledIds(prev => new Set(Array.from(prev).concat(group.memberId)));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSavingId(null);
        }
    };

    // ── New giver entries ──────────────────────────────────────────────────────
    const updateEntry = (id: string, patch: Partial<NewEntry>) => {
        setNewEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
    };

    const handleSaveNew = async (entry: NewEntry) => {
        if (!entry.member) { showError('Select a member first.'); return; }
        const amount = parseFloat(entry.amount);
        if (!amount || amount <= 0) { showError('Enter a valid amount.'); return; }
        setError('');
        setSavingNew(prev => new Set(Array.from(prev).concat(entry.id)));
        try {
            await receiveFromNewMember(entry.member.id!, amount);
            setSavedNew(prev => new Set(Array.from(prev).concat(entry.id)));
        } catch (e) {
            showError((e as Error).message);
        } finally {
            setSavingNew(prev => { const s = new Set(Array.from(prev)); s.delete(entry.id); return s; });
        }
    };

    return (
        <div className="page-container">
            {/* ── Timed error toast ── */}
            {error && (
                <div className="rp-toast">{error}</div>
            )}
            <Header title="Receive Payment" />
            <main className="rp-main">

                {/* ── Section 1: Settle Existing Pending ── */}
                <div className="rp-section-label">
                    <ArrowDownLeft size={16} color="#22C55E" />
                    <span>Settle Pending Members</span>
                </div>
                <p className="rp-hint">People who owe you a return from previous events. Amounts are pre-filled — adjust if they added a bonus.</p>

                {loading ? (
                    <div className="rp-loading"><Loader size={26} color="#D1D5DB" className="spin" /></div>
                ) : pendingGroups.length === 0 ? (
                    <div className="rp-empty">No pending amounts to settle 🎉</div>
                ) : (
                    pendingGroups.map(group => {
                        const settled = settledIds.has(group.memberId);
                        const saving = savingId === group.memberId;
                        return (
                            <div key={group.memberId} className={`rp-card ${settled ? 'rp-card--settled' : ''}`}>
                                <div className="rp-card-info">
                                    <div className="avatar-circle small" />
                                    <div>
                                        <p className="rp-member-name">{group.memberName}</p>
                                        <p className="rp-original">
                                            Originally owed: <strong>₹{group.totalGiven.toLocaleString('en-IN')}</strong>
                                        </p>
                                    </div>
                                </div>
                                <div className="rp-card-right">
                                    {settled ? (
                                        <span className="rp-settled-badge">✓ Settled</span>
                                    ) : (
                                        <>
                                            <div className="rp-amount-row">
                                                <span className="rp-rupee">₹</span>
                                                <input
                                                    type="number"
                                                    className="rp-amount-input"
                                                    value={amountMap[group.memberId] ?? ''}
                                                    onChange={e => setAmountMap(prev => ({ ...prev, [group.memberId]: e.target.value }))}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <button
                                                className="rp-settle-btn"
                                                onClick={() => handleSettle(group)}
                                                disabled={saving}
                                            >
                                                {saving ? <Loader size={14} className="spin" /> : 'Settle'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* ── Section 2: New Givers ── */}
                <div className="rp-section-label" style={{ marginTop: '1.75rem' }}>
                    <Plus size={16} color="#3B82F6" />
                    <span>New / Additional Givers</span>
                </div>
                <p className="rp-hint">Record money received from someone who does not have a prior pending record.</p>

                {newEntries.map(entry => {
                    const members = allMembers.filter(m =>
                        !m.id || (
                            m.name.toLowerCase().includes(entry.search.toLowerCase()) ||
                            (m.nameMl && m.nameMl.includes(entry.search))
                        )
                    );
                    const isSaving = savingNew.has(entry.id);
                    const isSaved = savedNew.has(entry.id);
                    return (
                        <div key={entry.id} className={`rp-card rp-new-card ${isSaved ? 'rp-card--settled' : ''}`}>
                            {/* Member search */}
                            <div className="rp-search-wrap">
                                <div className="rp-search-box">
                                    <Search size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
                                    <input
                                        type="text"
                                        placeholder="Search member…"
                                        className="rp-search-input"
                                        value={entry.search}
                                        disabled={isSaved}
                                        onChange={e => updateEntry(entry.id, { search: e.target.value, showDropdown: true, member: null })}
                                        onFocus={() => updateEntry(entry.id, { showDropdown: true })}
                                    />
                                    {entry.member && <Check size={14} color="#22C55E" style={{ flexShrink: 0 }} />}
                                </div>
                                {entry.showDropdown && entry.search && members.length > 0 && (
                                    <div className="rp-dropdown">
                                        {members.slice(0, 6).map(m => (
                                            <div key={m.id} className="rp-dropdown-item" onClick={() => updateEntry(entry.id, { member: m, search: m.name, showDropdown: false })}>
                                                <div className="avatar-circle tiny" />
                                                <span>{m.name}{m.nameMl ? ` (${m.nameMl})` : ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Amount + action */}
                            <div className="rp-new-bottom">
                                <div className="rp-amount-row">
                                    <span className="rp-rupee">₹</span>
                                    <input
                                        type="number"
                                        className="rp-amount-input"
                                        placeholder="Amount"
                                        value={entry.amount}
                                        disabled={isSaved}
                                        onChange={e => updateEntry(entry.id, { amount: e.target.value })}
                                    />
                                </div>
                                {isSaved ? (
                                    <span className="rp-settled-badge">✓ Saved</span>
                                ) : (
                                    <button className="rp-settle-btn" onClick={() => handleSaveNew(entry)} disabled={isSaving}>
                                        {isSaving ? <Loader size={14} className="spin" /> : 'Save'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Add another new giver */}
                <button className="rp-add-btn" onClick={() => setNewEntries(prev => [...prev, emptyEntry()])}>
                    <Plus size={16} /> Add Another
                </button>



                <div style={{ height: '100px' }} />
            </main>
            <BottomNav />
        </div>
    );
}
