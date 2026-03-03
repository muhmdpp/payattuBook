import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { BarChart2 } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className="page-container">
            <Header title="Analytics" showBack={false} />

            <main style={{ flex: 1, padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Spend</p>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>0</h3>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Receivable</p>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>0</h3>
                    </div>
                </div>

                <button style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '0.5rem', fontWeight: 600 }}>
                    Create Receivable List
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40%', color: '#9CA3AF', gap: '1rem', marginTop: '2rem' }}>
                    <BarChart2 size={48} color="#D1D5DB" />
                    <p>Not enough data</p>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
