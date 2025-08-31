'use client';

import { useState } from 'react';
import { debugCollections, recreateUserCollections, updateCollectionValidators, recreateCollectionsWithCorrectValidators } from '@/actions/debug-db';

export default function DebugPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<unknown>(null);

    const handleDebug = async () => {
        setLoading(true);
        try {
            const result = await debugCollections();
            setResult(result);
            console.log('Debug result:', result);
        } catch (error) {
            console.error('Debug error:', error);
            setResult({ success: false, error: error instanceof Error ? error.message : String(error) });
        } finally {
            setLoading(false);
        }
    };

    const handleRecreate = async () => {
        setLoading(true);
        try {
            const result = await recreateUserCollections();
            setResult(result);
            console.log('Recreate result:', result);
        } catch (error) {
            console.error('Recreate error:', error);
            setResult({ success: false, error: error instanceof Error ? error.message : String(error) });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateValidators = async () => {
        setLoading(true);
        try {
            const result = await updateCollectionValidators();
            setResult(result);
            console.log('Update validators result:', result);
        } catch (error) {
            console.error('Update validators error:', error);
            setResult({ success: false, error: error instanceof Error ? error.message : String(error) });
        } finally {
            setLoading(false);
        }
    };

    const handleRecreateWithValidators = async () => {
        setLoading(true);
        try {
            const result = await recreateCollectionsWithCorrectValidators();
            setResult(result);
            console.log('Recreate with correct validators result:', result);
        } catch (error) {
            console.error('Recreate with correct validators error:', error);
            setResult({ success: false, error: error instanceof Error ? error.message : String(error) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Database Debug</h1>

            <div className="space-x-4 flex flex-wrap gap-2">
                <button
                    onClick={handleDebug}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Debug Collections'}
                </button>

                <button
                    onClick={handleRecreateWithValidators}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Recreate with Correct Validators'}
                </button>

                <button
                    onClick={handleUpdateValidators}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Fix Schema Validators'}
                </button>

                <button
                    onClick={handleRecreate}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Recreate Collections (No Validators)'}
                </button>
            </div>

            {!!result && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
                <p>Check the browser console for detailed logs.</p>
                <p><strong>Recommended:</strong> &quot;Recreate with Correct Validators&quot; - Drops and recreates collections with proper schema validation (userId as string).</p>
                <p>&quot;Fix Schema Validators&quot; - Attempts to update existing collections with corrected schema.</p>
                <p>&quot;Recreate Collections (No Validators)&quot; - Drops and recreates without any validation (not recommended for production).</p>
            </div>
        </div>
    );
}