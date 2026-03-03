import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { CheckCircle2, Circle } from 'lucide-react';
import './MarkPayment.css';

export default function MarkPayment() {
    const mockMembers = [
        { id: 1, name: 'Muhammad', date: '16 December 2025, 4pm', location: 'Mishkath Hall', paid: true },
        { id: 2, name: 'Muhammad', date: '16 December 2025, 4pm', location: 'Mishkath Hall', paid: false },
        { id: 3, name: 'Muhammad', date: '16 December 2025, 4pm', location: 'Mishkath Hall', paid: false },
        { id: 4, name: 'Muhammad', date: '16 December 2025, 4pm', location: 'Mishkath Hall', paid: false },
    ];

    return (
        <div className="page-container">
            <Header title="Mark Payment" />

            <main className="payment-content">
                <div className="member-list">
                    {mockMembers.map((member) => (
                        <div key={member.id} className="payment-card">
                            <div className="avatar-circle"></div>

                            <div className="member-details">
                                <h3>{member.name}</h3>
                                <p>{member.date}</p>
                                <p>{member.location}</p>
                            </div>

                            <div className="status-indicator">
                                {member.paid ? (
                                    <CheckCircle2 size={28} color="#22C55E" strokeWidth={2.5} />
                                ) : (
                                    <Circle size={28} color="#D1D5DB" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ height: '100px' }}></div>
            </main>

            <BottomNav />
        </div>
    );
}
