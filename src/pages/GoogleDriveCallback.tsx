import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { googleDriveService } from '../services/googleDriveService';

const GoogleDriveCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing Google Drive authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const error = searchParams.get('error');

                if (error) {
                    setStatus('error');
                    setMessage(`Authentication failed: ${error}`);
                    setTimeout(() => navigate('/admin'), 3000);
                    return;
                }

                if (!code) {
                    setStatus('error');
                    setMessage('No authorization code received');
                    setTimeout(() => navigate('/admin'), 3000);
                    return;
                }

                // Exchange code for tokens
                const success = await googleDriveService.handleAuthCallback(code);

                if (success) {
                    setStatus('success');
                    setMessage('Google Drive connected successfully!');
                    setTimeout(() => navigate('/admin'), 2000);
                } else {
                    setStatus('error');
                    setMessage('Failed to authenticate with Google Drive');
                    setTimeout(() => navigate('/admin'), 3000);
                }
            } catch (error) {
                console.error('Callback error:', error);
                setStatus('error');
                setMessage('An unexpected error occurred');
                setTimeout(() => navigate('/admin'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    const getIcon = () => {
        switch (status) {
            case 'loading':
                return <Loader className="h-12 w-12 text-blue-600 animate-spin" />;
            case 'success':
                return <CheckCircle className="h-12 w-12 text-green-600" />;
            case 'error':
                return <AlertCircle className="h-12 w-12 text-red-600" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'loading':
                return 'text-blue-600';
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="flex justify-center mb-6"
                >
                    {getIcon()}
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className={`text-2xl font-bold mb-4 ${getStatusColor()}`}
                >
                    {status === 'loading' && 'Connecting to Google Drive...'}
                    {status === 'success' && 'Success!'}
                    {status === 'error' && 'Authentication Failed'}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-gray-600 dark:text-gray-400 mb-6"
                >
                    {message}
                </motion.p>

                {status !== 'loading' && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        onClick={() => navigate('/admin')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Return to Admin Dashboard
                    </motion.button>
                )}

                {status === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-sm text-gray-500 dark:text-gray-400"
                    >
                        Please wait while we set up your Google Drive connection...
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default GoogleDriveCallback;
