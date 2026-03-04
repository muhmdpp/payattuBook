"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell, IndianRupee, CalendarPlus, History, CalendarDays, ArrowLeftRight, CalendarCheck } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getUpcomingEvents, getAllTransactions, getPendingAmountForMember, getPaymentForEvent, Event, Transaction, ME } from '@/services/payattuService';
import './Home.css';

function formatDateTime(ms: number): string {
    const d = new Date(ms);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDate(ms: number): string {
    return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Build a Google Calendar URL for "Add to Calendar"
function buildCalendarUrl(ev: Event & { hostName?: string }): string {
    const start = new Date(ev.dateTime);
    const end = new Date(ev.dateTime + 2 * 60 * 60 * 1000); // assume 2h duration
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000', '');
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Payattu – ${ev.hostName}`)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(ev.place)}&details=${encodeURIComponent('Payattu event tracked via PayattuBook')}`;
}

type EnrichedEvent = Event & { due: number; alreadyPaid: boolean; paidAmount?: number };

export default function Home() {
    const [upcomingEvents, setUpcomingEvents] = useState<EnrichedEvent[]>([]);
    const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const now = Date.now();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [events, txs] = await Promise.all([getUpcomingEvents(), getAllTransactions()]);
            const enriched = await Promise.all(
                events.map(async (ev) => {
                    const [due, existingPayment] = await Promise.all([
                        getPendingAmountForMember(ev.hostId),
                        getPaymentForEvent(ev.id!),
                    ]);
                    return {
                        ...ev,
                        due,
                        alreadyPaid: !!existingPayment,
                        paidAmount: existingPayment?.amount,
                    };
                })
            );
            setUpcomingEvents(enriched);
            setRecentTxs(txs.slice(0, 5));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="home-container">
            <div className="home-header-section">
                <header className="home-top-bar">
                    <div className="avatar-placeholder">
                        <div className="avatar-circle">
                            <span className="visually-hidden">User profile</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="logo-text"><strong>Payattu</strong>Book</h1>
                    </div>
                    <button className="notification-btn" aria-label="Notifications">
                        <Bell size={24} />
                    </button>
                </header>

                <div className="action-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <Link href="/mark-payment" className="action-item">
                        <div className="action-icon-wrapper">
                            <div className="diamond-frame"><IndianRupee size={24} color="white" /></div>
                        </div>
                        <span className="action-label">Mark Payment</span>
                    </Link>
                    <Link href="/add-event" className="action-item">
                        <div className="action-icon-wrapper"><CalendarPlus size={24} color="white" /></div>
                        <span className="action-label">Add Event</span>
                    </Link>
                    <Link href="/history" className="action-item">
                        <div className="action-icon-wrapper"><History size={24} color="white" /></div>
                        <span className="action-label">History</span>
                    </Link>
                </div>
            </div>

            <main className="home-main-content">
                {loading ? (
                    <>
                        {/* Skeleton for Upcoming Events */}
                        <section className="list-section">
                            <div className="section-header">
                                <div className="skeleton skeleton-circle" style={{ width: 32, height: 32 }} />
                                <div className="skeleton skeleton-text wide" style={{ height: '1rem' }} />
                            </div>
                            <div className="horizontal-scroll">
                                {[1, 2].map(i => (
                                    <div key={i} className="skeleton-event-card">
                                        <div className="skeleton skeleton-circle" style={{ width: 54, height: 54 }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="skeleton skeleton-text wide" />
                                            <div className="skeleton skeleton-text short" />
                                            <div className="skeleton skeleton-text short" />
                                            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Skeleton for Recent Transactions */}
                        <section className="list-section">
                            <div className="section-header">
                                <div className="skeleton skeleton-circle" style={{ width: 32, height: 32 }} />
                                <div className="skeleton skeleton-text wide" style={{ height: '1rem' }} />
                            </div>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton-card-block">
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton skeleton-text wide" />
                                        <div className="skeleton skeleton-text short" />
                                    </div>
                                    <div style={{ textAlign: 'right', width: 80 }}>
                                        <div className="skeleton skeleton-text full" />
                                        <div className="skeleton skeleton-text short" style={{ marginLeft: 'auto' }} />
                                    </div>
                                </div>
                            ))}
                        </section>
                    </>
                ) : (
                    <>
                        {/* Upcoming Events */}
                        <section className="list-section">
                            <div className="section-header">
                                <div className="icon-circle red-circle"><CalendarDays size={18} color="white" /></div>
                                <h2>Upcoming Payattu</h2>
                            </div>

                            {upcomingEvents.length === 0 ? (
                                <div className="horizontal-scroll">
                                    <div className="event-card" style={{ justifyContent: 'center', alignItems: 'center', color: '#9CA3AF', fontSize: '0.8rem' }}>
                                        No upcoming events
                                    </div>
                                </div>
                            ) : (
                                <div className="horizontal-scroll">
                                    {upcomingEvents.map(ev => {
                                        const eventPassed = now >= ev.dateTime;
                                        return (
                                            <div key={ev.id} className="event-card">
                                                <div className="avatar-circle large" />
                                                <div className="event-details">
                                                    <h3>{ev.hostName}</h3>
                                                    <p>{formatDateTime(ev.dateTime)}</p>
                                                    <p>{ev.place}</p>
                                                    {ev.due > 0 && (
                                                        <p className="due-tag">₹{ev.due.toLocaleString('en-IN')} given previously</p>
                                                    )}

                                                    {ev.alreadyPaid ? (
                                                        /* Already marked — show confirmation */
                                                        <span className="paid-badge">
                                                            <CalendarCheck size={12} /> ₹{ev.paidAmount?.toLocaleString('en-IN')} Paid
                                                        </span>
                                                    ) : eventPassed ? (
                                                        /* Event time passed — show Mark Payment */
                                                        <Link href="/mark-payment" className="text-btn">MARK PAYMENT</Link>
                                                    ) : (
                                                        /* Event still upcoming — show Add to Calendar */
                                                        <a href={buildCalendarUrl(ev)} target="_blank" rel="noopener noreferrer" className="text-btn">
                                                            ADD TO CALENDAR
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Recent Transactions */}
                        <section className="list-section">
                            <div className="section-header">
                                <div className="icon-circle green-circle"><ArrowLeftRight size={18} color="white" /></div>
                                <h2>Recent Transactions</h2>
                            </div>

                            {recentTxs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9CA3AF', fontSize: '0.85rem' }}>
                                    No transactions yet
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {recentTxs.map(tx => (
                                        <div key={tx.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: 'white', padding: '0.875rem 1rem', borderRadius: '0.75rem',
                                            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                    {tx.giverId === ME ? tx.receiverName : tx.giverName}
                                                </p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(tx.createdAt)}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: tx.giverId === ME ? '#F59E0B' : '#22C55E' }}>
                                                    {tx.giverId === ME ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                                                </p>
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 600, padding: '2px 6px', borderRadius: '999px',
                                                    backgroundColor: tx.status === 'pending' ? '#FEF3C7' : '#DCFCE7',
                                                    color: tx.status === 'pending' ? '#B45309' : '#15803D'
                                                }}>{tx.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                <div style={{ height: '100px' }} />
            </main>

            <BottomNav />
        </div>
    );
}
