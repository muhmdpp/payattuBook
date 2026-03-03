import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { PlusCircle, Search, CalendarDays, BookOpen } from 'lucide-react';
import Link from 'next/link';
import './AddEvent.css';

export default function AddEvent() {
    return (
        <div className="page-container">
            <Header title="Add Event" />

            <main className="form-content">
                <div className="form-card">
                    <div className="card-header-label">
                        <PlusCircle size={20} color="#22C55E" fill="#dcfce7" />
                        <h2>Add Event</h2>
                    </div>

                    <div className="input-group search-group">
                        <input type="text" placeholder="Member Name from payattbook" className="input-field" />
                        <Search size={20} className="input-icon" color="#9CA3AF" />
                    </div>

                    <div className="helper-text-right">
                        <span>Member not in the List? <Link href="/add-member" className="text-link">Add Member</Link></span>
                    </div>

                    <div className="row-inputs">
                        <input type="text" placeholder="DD/MM/YY" className="input-field half-width" />
                        <input type="text" placeholder="5:00 PM" className="input-field half-width" />
                    </div>

                    <button className="btn-primary">Add Event</button>
                </div>

                {/* Recently Added Section */}
                <section className="recently-added-section">
                    <div className="section-header">
                        <div className="icon-circle red-circle">
                            <CalendarDays size={18} color="white" />
                        </div>
                        <h2>Recently Added</h2>
                    </div>

                    <div className="recent-card">
                        <div className="avatar-circle"></div>
                        <div className="recent-details">
                            <h3>Muhammad</h3>
                            <p>16 December 2025, 4pm</p>
                            <p>Mishkath Hall</p>
                        </div>
                        <div className="time-ago">4 min ago</div>
                    </div>

                    <div className="empty-state">
                        <BookOpen size={48} color="#D1D5DB" />
                        <p>There is nothing to show</p>
                    </div>
                </section>

                <div style={{ height: '100px' }}></div>
            </main>

            <BottomNav />
        </div>
    );
}
