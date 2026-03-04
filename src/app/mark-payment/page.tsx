"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { IndianRupee, CheckCircle2, CalendarDays } from 'lucide-react';
import { getAllEvents, markMyPayment, getPendingAmountForMember, getPaymentForEvent, Event, Transaction } from '@/services/payattuService';
import './MarkPayment.css';

function formatDateTime(ms: number): string {
    const d = new Date(ms);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type EnrichedEvent = Event & { pendingWithHost: number; existingPayment: Transaction | null };

// Skeleton row
function SkeletonRow() {
    return (
        <div className="payment-card">
            <div className="skeleton skeleton-circle" style={{ width: 46, height: 46 }} />
            <div className="member-details" style={{ flex: 1 }}>
                <div className="skeleton skeleton-text wide" />
                <div className="skeleton skeleton-text short" />
                <div className="skeleton skeleton-text short" />
            </div>
            <div className="skeleton skeleton-circle" style={{ width: 28, height: 28 }} />
        </div>
    );
}

export default function MarkPayment() {
    const [events, setEvents] = useState<EnrichedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeEvent, setActiveEvent] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const now = Date.now();

    const loadEvents = useCallback(async () => {
        setLoading(true);
        try {
            const evs = await getAllEvents();
            const enriched = await Promise.all(
                evs.map(async (ev) => {
                    const [pending, existingPayment] = await Promise.all([
                        getPendingAmountForMember(ev.hostId),
                        getPaymentForEvent(ev.id!),
                    ]);
                    return { ...ev, pendingWithHost: pending, existingPayment };
                })
            );
            setEvents(enriched);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadEvents(); }, [loadEvents]);

    const handleMark = async (ev: EnrichedEvent) => {
        const parsed = parseFloat(amount);
        if (!parsed || parsed <= 0) { setError('Enter a valid amount.'); return; }
        setSaving(true); setError('');
        try {
            await markMyPayment(ev.id!, ev.hostId, parsed);
            // Refresh to show the new payment state
            await loadEvents();
            setActiveEvent(null);
            setAmount('');
        } catch {
            setError('Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    // Separate into: payable (event passed, not yet paid) and others
    const payable = events.filter(ev => now >= ev.dateTime && !ev.existingPayment);
    const upcoming = events.filter(ev => now < ev.dateTime);
    const paid = events.filter(ev => !!ev.existingPayment);

    return (
        <div className="page-container">
            <Header title="Mark Payment" />
            <main className="payment-content">
                {loading ? (
                    <div className="member-list">
                        <SkeletonRow /><SkeletonRow /><SkeletonRow />
                    </div>
                ) : events.length === 0 ? (
                    <div className="empty-state" style={{ height: '60%' }}>
                        <CalendarDays size={48} color="#D1D5DB" />
                        <p>No events yet. Add events first.</p>
                    </div>
                ) : (
                    <>
                        {/* Events that need payment */}
                        {payable.length > 0 && (
                            <>
                                <p className="list-section-label">Awaiting Payment</p>
                                <div className="member-list">
                                    {payable.map(ev => (
                                        <EventPayCard
                                            key={ev.id} ev={ev}
                                            isActive={activeEvent === ev.id}
                                            amount={amount} error={error} saving={saving}
                                            onActivate={() => { setActiveEvent(ev.id!); setAmount(''); setError(''); }}
                                            onAmountChange={setAmount}
                                            onConfirm={() => handleMark(ev)}
                                            onCancel={() => { setActiveEvent(null); setAmount(''); setError(''); }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Upcoming — not payable yet */}
                        {upcoming.length > 0 && (
                            <>
                                <p className="list-section-label">Upcoming Events</p>
                                <div className="member-list">
                                    {upcoming.map(ev => (
                                        <div key={ev.id} className="payment-card payment-card--upcoming">
                                            <div className="avatar-circle" style={{ width: 46, height: 46 }} />
                                            <div className="member-details">
                                                <h3>{ev.hostName}</h3>
                                                <p>{formatDateTime(ev.dateTime)}</p>
                                                <p>{ev.place}</p>
                                            </div>
                                            <span className="upcoming-badge">Upcoming</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Already paid */}
                        {paid.length > 0 && (
                            <>
                                <p className="list-section-label">Paid</p>
                                <div className="member-list">
                                    {paid.map(ev => (
                                        <div key={ev.id} className="payment-card payment-card--done">
                                            <div className="avatar-circle" style={{ width: 46, height: 46 }} />
                                            <div className="member-details">
                                                <h3>{ev.hostName}</h3>
                                                <p>{formatDateTime(ev.dateTime)}</p>
                                                <p>{ev.place}</p>
                                                <p className="pending-tag" style={{ marginTop: 4 }}>
                                                    ₹{ev.existingPayment!.amount.toLocaleString('en-IN')} paid
                                                </p>
                                            </div>
                                            <CheckCircle2 size={28} color="#22C55E" strokeWidth={2.5} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
                <div style={{ height: '100px' }} />
            </main>
            <BottomNav />
        </div>
    );
}

function EventPayCard({ ev, isActive, amount, error, saving, onActivate, onAmountChange, onConfirm, onCancel }: {
    ev: EnrichedEvent; isActive: boolean; amount: string; error: string; saving: boolean;
    onActivate: () => void; onAmountChange: (v: string) => void; onConfirm: () => void; onCancel: () => void;
}) {
    return (
        <div className={`payment-card ${isActive ? 'payment-card--active' : ''}`}>
            <div className="avatar-circle" style={{ width: 46, height: 46 }} />
            <div className="member-details">
                <h3>{ev.hostName}</h3>
                <p>{formatDateTime(ev.dateTime)}</p>
                <p>{ev.place}</p>
                {ev.pendingWithHost > 0 && (
                    <p className="pending-tag">₹{ev.pendingWithHost.toLocaleString('en-IN')} given previously</p>
                )}
            </div>
            {isActive ? (
                <div className="inline-amount">
                    <div className="amount-input-row">
                        <span className="rupee-symbol">₹</span>
                        <input type="number" placeholder="0" className="amount-input" value={amount} autoFocus onChange={e => onAmountChange(e.target.value)} />
                    </div>
                    {error && <p className="error-text" style={{ fontSize: '0.65rem' }}>{error}</p>}
                    <button className="confirm-btn" onClick={onConfirm} disabled={saving}>
                        {saving ? '...' : 'Confirm'}
                    </button>
                    <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                </div>
            ) : (
                <button className="mark-btn" onClick={onActivate}>
                    <IndianRupee size={14} /> Mark
                </button>
            )}
        </div>
    );
}
