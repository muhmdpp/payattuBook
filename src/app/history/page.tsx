import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { BookOpen } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div className="page-container">
            <Header title="Transaction History" showBack={false} />

            <main style={{ flex: 1, padding: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                    Newly Added
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: '#9CA3AF', gap: '1rem' }}>
                    <BookOpen size={48} color="#D1D5DB" />
                    <p>There is nothing to show</p>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
