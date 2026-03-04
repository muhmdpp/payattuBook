"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { User, Bell, Bug, MessageSquare, Info, ChevronRight, Camera, LogOut } from 'lucide-react';
import './Settings.css';

export default function SettingsPage() {
    // Local state for UI toggles / placeholders
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [userName, setUserName] = useState("Your Name");

    return (
        <div className="page-container" style={{ backgroundColor: '#F9FAFB' }}>
            <Header title="Settings" showBack={false} />
            <main style={{ flex: 1, overflowY: 'auto' }}>

                {/* Account Section Banner */}
                <div className="settings-profile-card">
                    <div className="profile-avatar-wrapper">
                        <div className="avatar-circle" style={{ width: 64, height: 64 }}></div>
                        <button className="camera-btn" aria-label="Change photo">
                            <Camera size={14} color="white" />
                        </button>
                    </div>
                    <div className="profile-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="profile-name-input"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>
                        <p className="profile-subtitle">Personal Account</p>
                    </div>
                </div>

                <div className="settings-content">

                    {/* General Settings */}
                    <div className="settings-section">
                        <h3 className="settings-section-title">General</h3>
                        <div className="settings-list">
                            <button className="settings-list-item">
                                <div className="settings-item-left">
                                    <div className="settings-icon-bg" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                                        <User size={18} />
                                    </div>
                                    <span>Account Details</span>
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
                                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="settings-section">
                        <h3 className="settings-section-title">Feedback & Support</h3>
                        <div className="settings-list">
                            <button className="settings-list-item">
                                <div className="settings-item-left">
                                    <div className="settings-icon-bg" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                        <Bug size={18} />
                                    </div>
                                    <span>Report a Bug</span>
                                </div>
                                <ChevronRight size={18} color="#9CA3AF" />
                            </button>

                            <div className="settings-divider" />

                            <button className="settings-list-item">
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

                    {/* About Section */}
                    <div className="settings-section">
                        <h3 className="settings-section-title">About</h3>
                        <div className="settings-list">
                            <button className="settings-list-item">
                                <div className="settings-item-left">
                                    <div className="settings-icon-bg" style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}>
                                        <Info size={18} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block' }}>About the Developer</span>
                                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>v1.0.0</span>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="#9CA3AF" />
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '1rem', marginTop: '1rem' }}>
                        <button className="logout-btn">
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
