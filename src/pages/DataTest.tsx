import React, { useState, useEffect } from 'react';
import { PublicDataService } from '../services/publicDataService';

const DataTest: React.FC = () => {
    const [status, setStatus] = useState<string>('Testing...');
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const testData = async () => {
            try {
                setStatus('Initializing service...');
                const service = new PublicDataService();

                setStatus('Fetching metadata...');
                const metadata = await service.getMetadata();
                setStatus('Got metadata, fetching projects...');

                const projects = await service.getProjects();
                setStatus(`Success! Loaded ${projects.length} projects`);

                setData({
                    metadata,
                    projects,
                    projectTitles: projects.map(p => p.title)
                });

            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMsg);
                setStatus('Failed');
            }
        };

        testData();
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Public Data Service Test</h1>

            <div className="mb-4">
                <strong>Status:</strong> {status}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {data && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <h2 className="font-bold">Success!</h2>
                    <p>Metadata project count: {data.metadata?.projectCount}</p>
                    <p>Actual projects loaded: {data.projects?.length}</p>
                    <p>Project titles: {data.projectTitles?.join(', ')}</p>
                </div>
            )}

            {data && (
                <details className="mt-4">
                    <summary className="cursor-pointer font-bold">Raw Data</summary>
                    <pre className="bg-gray-100 p-4 mt-2 text-sm overflow-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
};

export default DataTest;
