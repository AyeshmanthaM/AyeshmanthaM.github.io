import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SyncResponse {
    success: boolean;
    message?: string;
    data?: {
        projectCount: number;
        syncTimestamp: string;
        githubUpdated: boolean;
        projects?: Array<{
            id: string;
            title: string;
            category: string;
            lastUpdated: string;
        }>;
    };
    error?: string;
    details?: string;
}

interface ApiResponse {
    response: Response;
    data: any;
}

const NotionSync = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [configStatus, setConfigStatus] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const makeRequest = async (endpoint: string, method = 'GET', body: any = null): Promise<ApiResponse> => {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`https://notion-cors-proxy.maduranga-ayeshmantha.workers.dev${endpoint}`, options);
        const data = await response.json();

        return { response, data };
    };

    const testConnectivity = async () => {
        try {
            setIsLoading(true);
            const { response } = await makeRequest('/api/health');
            setIsConnected(response.ok);
            return response.ok;
        } catch (error) {
            setIsConnected(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const checkConfiguration = async () => {
        try {
            const { response, data } = await makeRequest('/api/debug');
            if (response.ok) {
                setConfigStatus(data);
            }
        } catch (error) {
            console.error('Configuration check failed:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            const { response, data } = await makeRequest('/api/projects');
            if (response.ok) {
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const performFullSync = async () => {
        try {
            setIsLoading(true);
            setSyncResult(null);

            const { data } = await makeRequest('/api/data/sync', 'POST', {
                force: false,
                includeImages: true
            });

            setSyncResult(data);
        } catch (error) {
            setSyncResult({
                success: false,
                error: 'Network error',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getDebugInfo = async () => {
        try {
            const { data } = await makeRequest('/api/debug/properties');
            setDebugInfo(data);
        } catch (error) {
            console.error('Debug info failed:', error);
        }
    };

    const testFileCleanup = async () => {
        try {
            setIsLoading(true);

            // Get current projects
            const { response: projectsResponse, data: projectsData } = await makeRequest('/api/projects');

            if (!projectsResponse.ok) {
                throw new Error('Failed to fetch projects from Notion');
            }

            const currentProjects = projectsData.map((p: any) => ({
                id: `project-${p.id.replace(/-/g, '')}`,
                title: p.title
            }));

            // Perform sync
            const { data: syncData } = await makeRequest('/api/data/sync', 'POST', {
                action: 'cleanup-test',
                includeImages: false
            });

            setSyncResult({
                success: true,
                message: `File cleanup test completed. Found ${currentProjects.length} projects in Notion.`,
                data: syncData.data
            });

        } catch (error) {
            setSyncResult({
                success: false,
                error: 'File cleanup test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Auto-run connectivity and configuration check on page load
        const runInitialTests = async () => {
            const connected = await testConnectivity();
            if (connected) {
                await checkConfiguration();
            }
        };

        runInitialTests();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            🔄 Notion Project Sync System
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Manage and monitor synchronization between your Notion database and GitHub repository
                        </p>
                    </div>

                    {/* Connectivity Status */}
                    <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">🌐 System Status</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected === true ? 'bg-green-500' :
                                        isConnected === false ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}></div>
                                <span className="text-sm font-medium">
                                    {isConnected === true ? 'Connected' :
                                        isConnected === false ? 'Disconnected' : 'Checking...'}
                                </span>
                            </div>
                            <button
                                onClick={testConnectivity}
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                Test Connection
                            </button>
                        </div>

                        {configStatus && (
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                                <p>✅ Notion Token: {configStatus.hasToken ? 'Configured' : 'Missing'}</p>
                                <p>✅ Database ID: {configStatus.hasDatabase ? 'Configured' : 'Missing'}</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Fetch Projects */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📋 Project List</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                View all published projects from your Notion database.
                            </p>
                            <button
                                onClick={fetchProjects}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                Fetch Projects
                            </button>
                            {projects.length > 0 && (
                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                                    Found {projects.length} projects
                                </div>
                            )}
                        </div>

                        {/* Full Sync */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🔄 Full Sync</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Synchronize all projects to GitHub repository.
                            </p>
                            <button
                                onClick={performFullSync}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? 'Syncing...' : 'Start Sync'}
                            </button>
                        </div>

                        {/* File Cleanup Test */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🗑️ File Cleanup</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Test the file deletion feature for orphaned files.
                            </p>
                            <button
                                onClick={testFileCleanup}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                            >
                                Test Cleanup
                            </button>
                        </div>
                    </div>

                    {/* Sync Results */}
                    {syncResult && (
                        <div className={`mb-8 p-6 rounded-lg border ${syncResult.success
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}>
                            <h3 className={`text-lg font-semibold mb-3 ${syncResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                                }`}>
                                {syncResult.success ? '✅ Sync Results' : '❌ Sync Failed'}
                            </h3>

                            {syncResult.data && (
                                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <p>📊 Projects synchronized: {syncResult.data.projectCount}</p>
                                    <p>🕒 Timestamp: {new Date(syncResult.data.syncTimestamp).toLocaleString()}</p>
                                    <p>📁 GitHub updated: {syncResult.data.githubUpdated ? 'Yes' : 'No'}</p>
                                </div>
                            )}

                            {syncResult.error && (
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    Error: {syncResult.error}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Projects List */}
                    {projects.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📋 Current Projects</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.map((project, index) => (
                                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{project.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Category: {project.category}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Date: {project.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Debug Information */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🔍 Debug Information</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Get detailed debug information about your Notion database properties.
                        </p>
                        <button
                            onClick={getDebugInfo}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Get Debug Info
                        </button>

                        {debugInfo && (
                            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotionSync;
