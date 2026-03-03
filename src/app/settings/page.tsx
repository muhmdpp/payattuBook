import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="page-container">
            <Header title="Settings" showBack={false} />

            <main className="form-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', gap: '1rem' }}>
                <SettingsIcon size={48} color="#D1D5DB" />
                <p>Settings placeholder</p>
            </main>

            <BottomNav />
        </div>
    );
}
