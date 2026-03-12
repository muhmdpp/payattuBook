"use client";

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import { Download, Upload, FileSpreadsheet, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import { seedMemberPayattu } from '@/services/payattuService';
import './Import.css';

export default function ImportCSVPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'importing' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const handleDownloadTemplate = () => {
        const header = "Name,Paid Amount,Balance\n";
        const sampleLine1 = "Nadukkandi Nasar,8000,5000\n";
        const sampleLine2 = "K.C. Ammad,500,0\n";
        const blob = new Blob([header + sampleLine1 + sampleLine2], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PayattuBook_Template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setErrorMessage('');
            setProgress(0);
        }
    };

    const parseCSVLine = (line: string) => {
        // Very basic CSV parser splitting by comma (doesn't handle commas inside quotes)
        // Adjust if needed, but for simple names and numbers it works.
        return line.split(',').map(item => item.trim());
    };

    const handleImport = async () => {
        if (!file) return;

        setStatus('parsing');
        const reader = new FileReader();

        reader.onload = async (e) => {
            const text = e.target?.result as string;
            // Split by newline and filter out empty rows
            const rows = text.split(/\r?\n/).filter(row => row.trim().length > 0);

            if (rows.length < 2) {
                setStatus('error');
                setErrorMessage('File is empty or missing headers.');
                return;
            }

            // Assume row 0 is headers
            const dataRows = rows.slice(1);
            setTotalRows(dataRows.length);
            setStatus('importing');

            let successCount = 0;

            for (let i = 0; i < dataRows.length; i++) {
                const cols = parseCSVLine(dataRows[i]);
                const name = cols[0];
                const paid = Number(cols[1]); // Expected column 2
                const balance = cols[2] ? Number(cols[2]) : 0; // Expected column 3

                if (name && !isNaN(paid)) {
                    try {
                        await seedMemberPayattu(name, undefined, paid, balance);
                        successCount++;
                    } catch (err) {
                        console.error(`Row ${i + 2} Failed to import ${name}`, err);
                    }
                }
                setProgress(Math.floor(((i + 1) / dataRows.length) * 100));
            }

            if (successCount === 0) {
                setStatus('error');
                setErrorMessage('Could not import any rows. Check file formatting.');
            } else {
                setStatus('success');
            }
        };

        reader.onerror = () => {
            setStatus('error');
            setErrorMessage('Could not read the file.');
        };

        reader.readAsText(file);
    };

    return (
        <div className="page-container" style={{ backgroundColor: '#F9FAFB' }}>
            <Header title="Import Data" />

            <main className="import-container">
                <div className="import-card summary-card">
                    <div className="import-icon-bg">
                        <FileSpreadsheet size={32} color="#3B82F6" />
                    </div>
                    <h2>Have a physical notebook?</h2>
                    <p>Instead of typing everything manually, you can download our Excel template, fill it out on a computer, and upload it here.</p>

                    <button className="template-btn" onClick={handleDownloadTemplate}>
                        <Download size={18} />
                        Download Template (CSV)
                    </button>
                </div>

                <div className="import-card upload-card">
                    <h3>Upload Filled CSV</h3>

                    <div
                        className={`upload-dropzone ${file ? 'has-file' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        {file ? (
                            <div className="file-selected-state">
                                <CheckCircle2 size={32} color="#10B981" />
                                <span>{file.name}</span>
                                <small>Tap to change file</small>
                            </div>
                        ) : (
                            <div className="file-empty-state">
                                <Upload size={32} color="#9CA3AF" />
                                <span>Tap to select a .csv file</span>
                            </div>
                        )}
                    </div>

                    {status === 'error' && (
                        <div className="import-error">
                            <AlertCircle size={16} />
                            {errorMessage}
                        </div>
                    )}

                    {status === 'importing' && (
                        <div className="import-progress-container">
                            <div className="progress-text">
                                <span>Importing members...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="import-success">
                            <CheckCircle2 size={24} color="#059669" />
                            <div>
                                <strong>Import Complete!</strong>
                                <p>Successfully added {totalRows} members.</p>
                            </div>
                        </div>
                    )}

                    <button
                        className="import-submit-btn"
                        disabled={!file || status === 'importing' || status === 'success'}
                        onClick={handleImport}
                    >
                        {status === 'importing' ? (
                            <><Loader size={18} className="spin" /> Importing...</>
                        ) : (
                            "Start Import"
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}
