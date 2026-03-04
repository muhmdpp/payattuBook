"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { UserPlus, BookOpen, Check, Loader, Pencil, X } from 'lucide-react';
import { addMember, updateMember, getAllMembers, Member } from '@/services/payattuService';
import './AddMember.css';

export default function AddMember() {
    const [name, setName] = useState('');
    const [nameMl, setNameMl] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [loadingList, setLoadingList] = useState(true);

    // ── Edit modal ─────────────────────────────────────────────────────────────
    const [editMember, setEditMember] = useState<Member | null>(null);
    const [editName, setEditName] = useState('');
    const [editNameMl, setEditNameMl] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const loadMembers = useCallback(async () => {
        setLoadingList(true);
        try {
            const data = await getAllMembers();
            setMembers(data);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => { loadMembers(); }, [loadMembers]);

    // ── Add submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required.'); return; }
        setLoading(true); setError('');
        try {
            await addMember({ name: name.trim(), nameMl: nameMl.trim(), phone: phone.trim(), address: address.trim() });
            setName(''); setNameMl(''); setPhone(''); setAddress('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
            await loadMembers();
        } catch {
            setError('Failed to save. Try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Open edit ──────────────────────────────────────────────────────────────
    const openEdit = (m: Member) => {
        setEditMember(m);
        setEditName(m.name);
        setEditNameMl(m.nameMl ?? '');
        setEditPhone(m.phone ?? '');
        setEditAddress(m.address ?? '');
        setEditError('');
    };

    // ── Edit submit ────────────────────────────────────────────────────────────
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editMember?.id || !editName.trim()) return;
        setEditLoading(true); setEditError('');
        try {
            await updateMember(editMember.id, {
                name: editName.trim(),
                nameMl: editNameMl.trim(),
                phone: editPhone.trim(),
                address: editAddress.trim(),
            });
            setEditMember(null);
            await loadMembers();
        } catch {
            setEditError('Failed to save. Try again.');
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="page-container">
            <Header title="Add Member" />
            <main className="form-content">

                {/* ── Add Form ───────────────────────────────────────── */}
                <div className="form-card">
                    <div className="card-header-label">
                        <UserPlus size={20} color="#3B82F6" />
                        <h2>Add Member</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="inputs-stack">
                            <input
                                type="text" placeholder="Name (English)"
                                className="input-field" value={name}
                                onChange={e => setName(e.target.value)}
                            />
                            <input
                                type="text" placeholder="Name in മലയാളം"
                                className="input-field" value={nameMl}
                                onChange={e => setNameMl(e.target.value)}
                            />
                            <input
                                type="tel" placeholder="Mobile Number"
                                className="input-field" value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                            <textarea
                                placeholder="Address" className="input-field textarea-field"
                                rows={3} value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        </div>
                        {error && <p className="error-text">{error}</p>}
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader size={18} className="spin" /> : success ? <Check size={18} /> : 'Add Member'}
                        </button>
                    </form>
                </div>

                {/* ── Member List ────────────────────────────────────── */}
                <section className="recently-added-section">
                    <h2 className="section-title">Members</h2>
                    {loadingList ? (
                        <div className="empty-state"><Loader size={28} color="#D1D5DB" className="spin" /></div>
                    ) : members.length === 0 ? (
                        <div className="empty-state">
                            <BookOpen size={48} color="#D1D5DB" />
                            <p>No members yet</p>
                        </div>
                    ) : (
                        <div className="member-list-items">
                            {members.map(m => (
                                <div key={m.id} className="member-list-card">
                                    <div className="avatar-circle small" />
                                    <div className="member-info">
                                        <h3>{m.name}</h3>
                                        {m.nameMl && <p className="name-ml">{m.nameMl}</p>}
                                        {m.phone && <p>{m.phone}</p>}
                                    </div>
                                    <button className="edit-icon-btn" onClick={() => openEdit(m)} aria-label="Edit member">
                                        <Pencil size={16} color="#9CA3AF" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div style={{ height: '100px' }} />
            </main>

            {/* ── Edit Bottom Sheet ────────────────────────────────── */}
            {editMember && (
                <div className="edit-overlay" onClick={() => setEditMember(null)}>
                    <div className="edit-sheet" onClick={e => e.stopPropagation()}>
                        <div className="edit-sheet-header">
                            <span className="edit-sheet-title">Edit Member</span>
                            <button className="edit-sheet-close" onClick={() => setEditMember(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="inputs-stack">
                                <input
                                    type="text" placeholder="Name (English)"
                                    className="input-field" value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                />
                                <input
                                    type="text" placeholder="Name in മലയാളം"
                                    className="input-field" value={editNameMl}
                                    onChange={e => setEditNameMl(e.target.value)}
                                />
                                <input
                                    type="tel" placeholder="Mobile Number"
                                    className="input-field" value={editPhone}
                                    onChange={e => setEditPhone(e.target.value)}
                                />
                                <textarea
                                    placeholder="Address" className="input-field textarea-field"
                                    rows={3} value={editAddress}
                                    onChange={e => setEditAddress(e.target.value)}
                                />
                            </div>
                            {editError && <p className="error-text">{editError}</p>}
                            <button type="submit" className="btn-primary" disabled={editLoading}>
                                {editLoading ? <Loader size={18} className="spin" /> : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
