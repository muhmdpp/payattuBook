import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { UserPlus, Image as ImageIcon, BookOpen } from 'lucide-react';
import './AddMember.css';

export default function AddMember() {
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

                    <div className="inputs-stack">
                        <input type="text" placeholder="Name" className="input-field" />
                        <input type="text" placeholder="Name in മലയാളം" className="input-field" />
                        <input type="tel" placeholder="Mobile Number" className="input-field" />
                        <textarea placeholder="Address" className="input-field textarea-field" rows={3}></textarea>
                    </div>

                    {/* Note: Figma has "Add Event" text on the button, but logically it's "Add Member" */}
                    <button className="btn-primary">Add Member</button>
                </div>

                <section className="recently-added-section">
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
