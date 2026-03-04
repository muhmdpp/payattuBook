"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { PlusCircle, Search, CalendarDays, BookOpen, Check, Loader } from 'lucide-react';
import Link from 'next/link';
import { addEvent, getAllEvents, getAllMembers, Member, Event } from '@/services/payattuService';
import './AddEvent.css';

function formatDateTime(ms: number): string {
    const d = new Date(ms);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(ms: number): string {
    const diff = Date.now() - ms;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function AddEventPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedHost, setSelectedHost] = useState<Member | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [place, setPlace] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [events, setEvents] = useState<Event[]>([]);
    const [loadingList, setLoadingList] = useState(true);

    const loadData = useCallback(async () => {
        setLoadingList(true);
        try {
            const [evs, mems] = await Promise.all([getAllEvents(), getAllMembers()]);
            setEvents(evs);
            setMembers(mems);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.nameMl && m.nameMl.includes(search))
    );

    const handleSelectHost = (m: Member) => {
        setSelectedHost(m);
        setSearch(m.name);
        setShowDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHost) { setError('Please select a host member.'); return; }
        if (!date || !time) { setError('Date and time are required.'); return; }
        if (!place.trim()) { setError('Place is required.'); return; }
        setLoading(true); setError('');
        try {
            const dateTime = new Date(`${date}T${time}`).getTime();
            await addEvent(selectedHost.id!, dateTime, place.trim());
            setSelectedHost(null); setSearch(''); setDate(''); setTime(''); setPlace('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
            await loadData();
        } catch {
            setError('Failed to save event. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <Header title="Add Event" />
            <main className="form-content">
                <div className="form-card">
                    <div className="card-header-label">
                        <PlusCircle size={20} color="#22C55E" fill="#dcfce7" />
                        <h2>Add Event</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Host search with dropdown */}
                        <div className="input-group search-group" style={{ marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Search host member…"
                                className="input-field"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setShowDropdown(true); setSelectedHost(null); }}
                                onFocus={() => setShowDropdown(true)}
                            />
                            {selectedHost
                                ? <Check size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }} />
                                : <Search size={18} className="input-icon" color="#9CA3AF" />
                            }
                            {showDropdown && search && filtered.length > 0 && (
                                <div className="search-dropdown">
                                    {filtered.map(m => (
                                        <div key={m.id} className="dropdown-item" onClick={() => handleSelectHost(m)}>
                                            <div className="avatar-circle tiny" />
                                            <span>{m.name}{m.nameMl ? ` (${m.nameMl})` : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="helper-text-right">
                            <span>Member not in list? <Link href="/add-member" className="text-link">Add Member</Link></span>
                        </div>

                        <div className="row-inputs">
                            <input type="date" className="input-field half-width" value={date} onChange={e => setDate(e.target.value)} />
                            <input type="time" className="input-field half-width" value={time} onChange={e => setTime(e.target.value)} />
                        </div>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <input type="text" placeholder="Place / Venue" className="input-field" value={place} onChange={e => setPlace(e.target.value)} />
                        </div>

                        {error && <p className="error-text">{error}</p>}
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader size={18} className="spin" /> : success ? <><Check size={18} /> Added!</> : 'Add Event'}
                        </button>
                    </form>
                </div>

                {/* Recently Added */}
                <section className="recently-added-section">
                    <div className="section-header">
                        <div className="icon-circle red-circle">
                            <CalendarDays size={18} color="white" />
                        </div>
                        <h2>Recently Added</h2>
                    </div>

                    {loadingList ? (
                        <div className="empty-state"><Loader size={28} color="#D1D5DB" className="spin" /></div>
                    ) : events.length === 0 ? (
                        <div className="empty-state">
                            <BookOpen size={48} color="#D1D5DB" />
                            <p>No events yet</p>
                        </div>
                    ) : (
                        events.map(ev => (
                            <div key={ev.id} className="recent-card">
                                <div className="avatar-circle" />
                                <div className="recent-details">
                                    <h3>{ev.hostName}</h3>
                                    <p>{formatDateTime(ev.dateTime)}</p>
                                    <p>{ev.place}</p>
                                </div>
                                <div className="time-ago">{timeAgo(ev.createdAt)}</div>
                            </div>
                        ))
                    )}
                </section>

                <div style={{ height: '100px' }} />
            </main>
            <BottomNav />
        </div>
    );
}
