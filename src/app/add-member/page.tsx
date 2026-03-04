"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { UserPlus, Image as ImageIcon, BookOpen, Check, Loader } from 'lucide-react';
import { addMember, getAllMembers, Member } from '@/services/payattuService';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required.'); return; }
        setLoading(true);
        setError('');
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

    return (
        <div className="page-container">
            <Header title="Add Member" />
            <main className="form-content">
                <div className="form-card">
                    <div className="card-header-label">
                        <UserPlus size={20} color="#3B82F6" fill="#eff6ff" />
                        <h2>Add Member</h2>
                    </div>

                    <div className="photo-upload-container">
                        <div className="photo-circle">
                            <ImageIcon size={24} color="#9CA3AF" />
                        </div>
                        <div className="photo-label">
                            <span>Add Photo</span>
                            <span className="optional-text">(Optional)</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="inputs-stack">
                            <input
                                type="text" placeholder="Name"
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

                {/* Recently Added */}
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
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div style={{ height: '100px' }} />
            </main>
            <BottomNav />
        </div>
    );
}
