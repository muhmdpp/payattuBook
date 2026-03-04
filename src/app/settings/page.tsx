"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { User, Bell, Bug, MessageSquare, Info, ChevronRight, Camera, LogOut, Check } from 'lucide-react';
import './Settings.css';

const USERNAME_KEY = 'payattu_username';
const NOTIF_KEY = 'payattu_notifications';

export default function SettingsPage() {
    const [userName, setUserName] = useState('');
    const [notificationsEnabled, setNotif] = useState(true);
    const [nameSaved, setNameSaved] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load persisted values on mount
    useEffect(() => {
        const savedName = localStorage.getItem(USERNAME_KEY);
        const savedNotif = localStorage.getItem(NOTIF_KEY);
        if (savedName) setUserName(savedName);
        if (savedNotif) setNotif(savedNotif === 'true');
    }, []);

    // Save name to localStorage
    const handleSaveName = () => {
        const trimmed = userName.trim();
        if (!trimmed) return;
        localStorage.setItem(USERNAME_KEY, trimmed);
        setNameSaved(true);
        setTimeout(() => setNameSaved(false), 2000);
        inputRef.current?.blur();
    };

    // Persist notification toggle
    const handleToggleNotif = () => {
        const next = !notificationsEnabled;
        setNotif(next);
        localStorage.setItem(NOTIF_KEY, String(next));
    };

    const handleReportBug = () => {
        window.location.href = 'mailto:?subject=PayattuBook%20Bug%20Report&body=Describe%20the%20bug%20here...';
    };

    const handleFeedback = () => {
        window.location.href = 'mailto:?subject=PayattuBook%20Feedback&body=Your%20feedback%20here...';
    };

    return (
        <div className="page-container" style={{ backgroundColor: '#F9FAFB' }}>
            <Header title="Settings" showBack={false} />
            <main style={{ flex: 1, overflowY: 'auto' }}>

                {/* Profile Card */}
                <div className="settings-profile-card">
                    <div className="profile-avatar-wrapper">
                        <div className="avatar-circle" style={{ width: 64, height: 64 }} />
                        <button className="camera-btn" aria-label="Change photo">
                            <Camera size={14} color="white" />
                        </button>
                    </div>
                    <div className="profile-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                className="profile-name-input"
                                value={userName}
                                onChange={e => { setUserName(e.target.value); setNameSaved(false); }}
                                onBlur={handleSaveName}
                                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                placeholder="Enter your name"
                            />
                            {nameSaved && <Check size={16} color="#22C55E" />}
                        </div>
                        <p className="profile-subtitle">
                            {userName.trim() ? 'Tap name to edit · Enter to save' : 'Your name appears on PDF exports'}
                        </p>
                    </div>
                </div>

                <div className="settings-content">

                    {/* General */}
                    <div className="settings-section">
                        <h3 className="settings-section-title">General</h3>
                        <div className="settings-list">
                            <button className="settings-list-item" onClick={() => inputRef.current?.focus()}>
                                <div className="settings-item-left">
                                    <div className="settings-icon-bg" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                                        <User size={18} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block' }}>Your Name</span>
                                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                                            {userName.trim() || 'Not set — used in PDF exports'}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="#9CA3AF" />
                            </button>

                            <div className="settings-divider" />

                            <div className="settings-list-item">
                                <div className="settings-item-left">
                                    <div className="settings-icon-bg" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                                        <Bell size={18} />
                                    </div>
                                    <span>Notifications</span>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={notificationsEnabled}
                                        onChange={handleToggleNotif}
                                    />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="settings-section">
                        <h3 className="settings-section-title">Feedback & Support</h3>
                        <div className="settings-list">
                            <button className="settings-list-item" onClick={handleReportBug}>
                                <div className="settings-item-left">
                                    <div className="settings-icon-bg" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                        <Bug size={18} />
                                    </div>
                                    <span>Report a Bug</span>
                                </div>
                                <ChevronRight size={18} color="#9CA3AF" />
                            </button>

                            <div className="settings-divider" />

                            <button className="settings-list-item" onClick={handleFeedback}>
                                <div className="settings-item-left">
                                    <div className="settings-icon-bg" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                                        <MessageSquare size={18} />
                                    </div>
                                    <span>Send Feedback</span>
                                </div>
                                <ChevronRight size={18} color="#9CA3AF" />
                            </button>
                        </div>
                    </div>

                    {/* About */}
                    <div className="settings-section">
                        <h3 className="settings-section-title">About</h3>
                        <div className="settings-list">
                            <Link href="/about" className="settings-list-item">
                                <div className="settings-item-left">
                                    <div className="settings-icon-bg" style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}>
                                        <Info size={18} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block' }}>About the Developer</span>
                                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>v1.0.0 · Supabase</span>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="#9CA3AF" />
                            </Link>
                        </div>
                    </div>

                    {/* Logout */}
                    <div style={{ padding: '1rem', marginTop: '1rem' }}>
                        <button className="logout-btn" onClick={() => {
                            localStorage.clear();
                            window.location.href = '/';
                        }}>
                            <LogOut size={18} />
                            Log Out
                        </button>
                    </div>

                </div>

                <div style={{ height: '100px' }} />
            </main>
            <BottomNav />
        </div>
    );
}
