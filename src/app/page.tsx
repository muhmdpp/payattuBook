"use client";

import Link from 'next/link';
import { Bell, IndianRupee, CalendarPlus, UserPlus, ArrowRightLeft, CalendarDays, ArrowLeftRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import './Home.css';

export default function Home() {
    return (
        <div className="home-container">
            {/* Top Purple Gradient Section */}
            <div className="home-header-section">
                <header className="home-top-bar">
                    <div className="avatar-placeholder">
                        {/* Image placeholder */}
                        <div className="avatar-circle">
                            <span className="visually-hidden">User profile</span>
                        </div>
                    </div>
                    <h1 className="logo-text">
                        <strong>Payattu</strong>Book
                    </h1>
                    <h6 className="text-xs text-gray-600 mt-1">1.46.0</h6>
                    <button className="notification-btn" aria-label="Notifications">
                        <Bell size={24} />
                        <span className="notification-badge">13</span>
                    </button>
                </header>

                {/* Action Buttons Grid */}
                <div className="action-grid">
                    <Link href="/mark-payment" className="action-item">
                        <div className="action-icon-wrapper">
                            <div className="diamond-frame">
                                <IndianRupee size={24} color="white" />
                            </div>
                        </div>
                        <span className="action-label">Mark Payment</span>
                    </Link>

                    <Link href="/add-event" className="action-item">
                        <div className="action-icon-wrapper">
                            <CalendarPlus size={24} color="white" />
                        </div>
                        <span className="action-label">Add Event</span>
                    </Link>

                    <Link href="/add-member" className="action-item">
                        <div className="action-icon-wrapper">
                            <UserPlus size={24} color="white" />
                        </div>
                        <span className="action-label">Add Member</span>
                    </Link>

                    <Link href="/history" className="action-item">
                        <div className="action-icon-wrapper">
                            <ArrowRightLeft size={24} color="white" />
                        </div>
                        <span className="action-label">History</span>
                    </Link>
                </div>
            </div>

            {/* Main Content Area (White background curve overlaps purple) */}
            <main className="home-main-content">
                {/* Upcoming Panapayattu */}
                <section className="list-section">
                    <div className="section-header">
                        <div className="icon-circle red-circle">
                            <CalendarDays size={18} color="white" />
                        </div>
                        <h2>Upcoming Panapayattu</h2>
                    </div>

                    <div className="horizontal-scroll">
                        {/* Mock Card 1 */}
                        <div className="event-card">
                            <div className="avatar-circle large"></div>
                            <div className="event-details">
                                <h3>Muhammad</h3>
                                <p>16 December 2025, 4pm</p>
                                <p>Mishkath Hall</p>
                                <button className="text-btn">ADD TO CALENDER</button>
                            </div>
                        </div>
                        {/* Mock Card 2 */}
                        <div className="event-card">
                            <div className="avatar-circle large"></div>
                            <div className="event-details">
                                <h3>Muhammad</h3>
                                <p>16 December 2025, 4pm</p>
                                <p>Mishkath Hall</p>
                                <button className="text-btn">ADD TO CALENDER</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Transactions */}
                <section className="list-section">
                    <div className="section-header">
                        <div className="icon-circle green-circle">
                            <ArrowLeftRight size={18} color="white" />
                        </div>
                        <h2>Recent Transactions</h2>
                    </div>

                    <div className="horizontal-scroll">
                        <div className="skeleton-card"></div>
                        <div className="skeleton-card"></div>
                        <div className="skeleton-card"></div>
                        <div className="skeleton-card"></div>
                    </div>
                </section>

                {/* Spacer for BottomNav */}
                <div style={{ height: '100px' }}></div>
            </main>

            <BottomNav />
        </div>
    );
}
