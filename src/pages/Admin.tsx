import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Database, Download, Send, AlertCircle, CheckCircle, Cloud, Upload, FileText, Folder } from 'lucide-react';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { notionBackupService } from '../services/notionBackupService';
import { googleDriveService } from '../services/googleDriveService';

interface BackupData {
    projects: any[];
    timestamp: string;
    count: number;
}

interface GoogleDriveFile {
    id: string;
    name: string;
    size?: string;
    modifiedTime: string;
}

const Admin: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [backupStatus, setBackupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [backupData, setBackupData] = useState<BackupData | null>(null);

    // Google Drive states
    const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
    const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
    const [driveStatus, setDriveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [driveMessage, setDriveMessage] = useState('');

    useEffect(() => {
        checkAuthStatus();
        checkGoogleDriveConnection();
    }, []);

    const checkAuthStatus = () => {
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        setIsLoading(false);
    };

    const checkGoogleDriveConnection = () => {
        const isConnected = googleDriveService.isAuthenticated();
        setIsGoogleDriveConnected(isConnected);
        if (isConnected) {
            loadDriveBackups();
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !message) return;

        setEmailStatus('sending');
        try {
            await emailService.sendEmail(email, 'Admin Message', message);
            setEmailStatus('success');
            setEmail('');
            setMessage('');
            setTimeout(() => setEmailStatus('idle'), 3000);
        } catch (error) {
            console.error('Email sending failed:', error);
            setEmailStatus('error');
            setTimeout(() => setEmailStatus('idle'), 3000);
        }
    };

    const handleNotionBackup = async () => {
        setBackupStatus('loading');
        try {
            const data = await notionBackupService.createBackup();
            setBackupData(data);
            setBackupStatus('success');
            setTimeout(() => setBackupStatus('idle'), 3000);
        } catch (error) {
            console.error('Backup failed:', error);
            setBackupStatus('error');
            setTimeout(() => setBackupStatus('idle'), 3000);
        }
    };

    const handleDownloadBackup = () => {
        if (!backupData) return;

        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notion-backup-${backupData.timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    const handleGoogleDriveConnect = () => {
        const authUrl = googleDriveService.getAuthUrl();
        window.location.href = authUrl;
    };

    const handleGoogleDriveDisconnect = () => {
        googleDriveService.logout();
        setIsGoogleDriveConnected(false);
        setDriveFiles([]);
    };

    const loadDriveBackups = async () => {
        setDriveStatus('loading');
        try {
            const backups = await googleDriveService.getBackupsFromDrive();
            setDriveFiles(backups);
            setDriveStatus('success');
        } catch (error) {
            console.error('Failed to load drive backups:', error);
            setDriveStatus('error');
            setDriveMessage('Failed to load backups from Google Drive');
        }
    };

    const handleSaveBackupToDrive = async () => {
        if (!backupData) {
            setDriveMessage('Please create a backup first');
            return;
        }

        setDriveStatus('loading');
        setDriveMessage('Saving backup to Google Drive...');

        try {
            await googleDriveService.saveBackupToDrive(backupData);
            setDriveStatus('success');
            setDriveMessage('Backup saved to Google Drive successfully!');
            await loadDriveBackups(); // Refresh the list
            setTimeout(() => {
                setDriveStatus('idle');
                setDriveMessage('');
            }, 3000);
        } catch (error) {
            console.error('Failed to save backup to drive:', error);
            setDriveStatus('error');
            setDriveMessage('Failed to save backup to Google Drive');
            setTimeout(() => {
                setDriveStatus('idle');
                setDriveMessage('');
            }, 3000);
        }
    };

    const handleOpenGoogleDriveFolder = async () => {
        try {
            // Find or create the backup folder to get its ID
            const folder = await googleDriveService.findOrCreateFolder('Portfolio data');
            // Open the folder in a new tab
            const driveUrl = `https://drive.google.com/drive/folders/${folder.id}`;
            window.open(driveUrl, '_blank');
        } catch (error) {
            console.error('Failed to open Google Drive folder:', error);
            setDriveMessage('Failed to open Google Drive folder');
        }
    };

    const handleDeleteBackupFromDrive = async (fileId: string, fileName: string) => {
        if (!confirm(`Are you sure you want to delete "${fileName}" from Google Drive?`)) {
            return;
        }

        setDriveStatus('loading');
        setDriveMessage('Deleting backup from Google Drive...');

        try {
            await googleDriveService.deleteFile(fileId);
            setDriveStatus('success');
            setDriveMessage('Backup deleted from Google Drive successfully!');
            await loadDriveBackups(); // Refresh the list
            setTimeout(() => {
                setDriveStatus('idle');
                setDriveMessage('');
            }, 3000);
        } catch (error) {
            console.error('Failed to delete backup from drive:', error);
            setDriveStatus('error');
            setDriveMessage('Failed to delete backup from Google Drive');
            setTimeout(() => {
                setDriveStatus('idle');
                setDriveMessage('');
            }, 3000);
        }
    };

    const handleRestoreFromDrive = async (fileId: string) => {
        setDriveStatus('loading');
        setDriveMessage('Restoring backup from Google Drive...');
        
        try {
            const restoredData = await googleDriveService.restoreBackupFromDrive(fileId);
            setBackupData(restoredData);
            setDriveStatus('success');
            setDriveMessage('Backup restored from Google Drive successfully!');
            setTimeout(() => {
                setDriveStatus('idle');
                setDriveMessage('');
            }, 3000);
        } catch (error) {
            console.error('Failed to restore from drive:', error);
            setDriveStatus('error');
            setDriveMessage('Failed to restore backup from Google Drive');
            setTimeout(() => {
                setDriveStatus('idle');
                setDriveMessage('');
            }, 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Admin Dashboard
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Email Section */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-4">
                            <Mail className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Send Email
                            </h2>
                        </div>
                        <form onSubmit={handleSendEmail} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Recipient Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter recipient email"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter your message"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    type="submit"
                                    disabled={emailStatus === 'sending'}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                    <span>{emailStatus === 'sending' ? 'Sending...' : 'Send Email'}</span>
                                </button>
                                {emailStatus === 'success' && (
                                    <div className="flex items-center space-x-1 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Email sent successfully!</span>
                                    </div>
                                )}
                                {emailStatus === 'error' && (
                                    <div className="flex items-center space-x-1 text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Failed to send email</span>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Notion Backup Section */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-4">
                            <Database className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Notion Projects Backup
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleNotionBackup}
                                    disabled={backupStatus === 'loading'}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Database className="h-4 w-4" />
                                    <span>{backupStatus === 'loading' ? 'Creating Backup...' : 'Create Backup'}</span>
                                </button>
                                {backupData && (
                                    <button
                                        onClick={handleDownloadBackup}
                                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download Backup</span>
                                    </button>
                                )}
                            </div>

                            {backupStatus === 'success' && backupData && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 mb-2">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Backup created successfully!</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p>Projects backed up: {backupData.count}</p>
                                        <p>Timestamp: {new Date(backupData.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}

                            {backupStatus === 'error' && (
                                <div className="flex items-center space-x-1 text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Failed to create backup</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Google Drive Section */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Cloud className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Google Drive setup
                            </h2>
                        </div>

                        {!isGoogleDriveConnected ? (
                            <div className="space-y-4">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Connect your Google Drive to automatically save and sync your backups.
                                </p>
                                <button
                                    onClick={handleGoogleDriveConnect}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <Cloud className="h-4 w-4" />
                                    <span>Connect Google Drive</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Google Drive connected</span>
                                    </div>
                                    <button
                                        onClick={handleGoogleDriveDisconnect}
                                        className="text-sm text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={handleSaveBackupToDrive}
                                        disabled={!backupData || driveStatus === 'loading'}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span>{driveStatus === 'loading' ? 'Saving...' : 'Save to Drive'}</span>
                                    </button>
                                    <button
                                        onClick={loadDriveBackups}
                                        disabled={driveStatus === 'loading'}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Database className="h-4 w-4" />
                                        <span>Refresh</span>
                                    </button>
                                    <button
                                        onClick={handleOpenGoogleDriveFolder}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                    >
                                        <Folder className="h-4 w-4" />
                                        <span>Open Drive Folder</span>
                                    </button>
                                </div>

                                {/* Folder Information */}
                                {isGoogleDriveConnected && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                                            📁 Google Drive Folder Information
                                        </h4>
                                        <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                                            <p><strong>Folder Name:</strong> Portfolio data</p>
                                            <p><strong>Total Files:</strong> {driveFiles.length}</p>
                                            <p><strong>Last Sync:</strong> {new Date().toLocaleString()}</p>
                                            <p><strong>Access:</strong> Private (only you can see these files)</p>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                💡 <strong>Tip:</strong> Click "Open Drive Folder" to view files directly in Google Drive, 
                                                or use "Refresh" to sync the latest changes.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {driveMessage && (
                                    <div className={`flex items-center space-x-1 ${driveStatus === 'success' ? 'text-green-600' :
                                            driveStatus === 'error' ? 'text-red-600' : 'text-blue-600'
                                        }`}>
                                        {driveStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                                        {driveStatus === 'error' && <AlertCircle className="h-4 w-4" />}
                                        <span>{driveMessage}</span>
                                    </div>
                                )}

                                {driveFiles.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                            Backup Files in Google Drive
                                        </h3>
                                        <div className="space-y-2">
                                            {driveFiles.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {googleDriveService.formatDate(file.modifiedTime)}
                                                                {file.size && ` • ${googleDriveService.formatFileSize(file.size)}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleRestoreFromDrive(file.id)}
                                                            disabled={driveStatus === 'loading'}
                                                            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            Restore
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBackupFromDrive(file.id, file.name)}
                                                            disabled={driveStatus === 'loading'}
                                                            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Admin;
