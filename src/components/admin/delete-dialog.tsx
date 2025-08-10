"use client";

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { REASONS_BY_ENTITY } from '@/lib/constants/enums';
import { Collections } from '@/lib/constants/collections';
import { softDeleteTrack } from '@/actions/admin/tracks';
import { softDeleteAlbum } from '@/actions/admin/albums';
import { softDeleteArtist } from '@/actions/admin/artists';
import { useToast } from '@/components/ui/toast';

type Props = {
    entity: typeof Collections.TRACKS | typeof Collections.ALBUMS | typeof Collections.ARTISTS;
    id: string;
    buttonClassName?: string;
};

export function DeleteDialog({ entity, id, buttonClassName }: Props) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>('other');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const reasons = REASONS_BY_ENTITY[entity];

    const onConfirm = async () => {
        setBusy(true);
        setError(null);
        try {
            // The delete actions now handle redirect internally and set success cookies
            if (entity === Collections.TRACKS) await softDeleteTrack(id, reason);
            else if (entity === Collections.ALBUMS) await softDeleteAlbum(id, reason);
            else if (entity === Collections.ARTISTS) await softDeleteArtist(id, reason);
            // If we reach here, the action succeeded and we should be redirected
            // No need to handle success here as the redirect will happen automatically
        } catch (e) {
            // Only handle errors here - success cases will redirect
            const errorMsg = (e as Error).message;
            setError(errorMsg);
            toast.error(errorMsg);
            setBusy(false);
        }
    };

    return (
        <div>
            <button
                type="button"
                className={buttonClassName || 'inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm'}
                onClick={() => setOpen(true)}
            >
                <Trash2 className="h-4 w-4" />
                Delete
            </button>
            {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">Confirm soft delete</h3>
                        <p className="text-sm text-muted-foreground mt-1">Select a reason. This will not permanently remove the item.</p>
                        <div className="mt-4">
                            <label className="block text-sm font-medium">Reason</label>
                            <select className="mt-1 w-full rounded border px-3 py-2" value={reason} onChange={(e) => setReason(e.target.value)}>
                                {reasons.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                        <div className="mt-6 flex justify-end gap-2">
                            <button type="button" className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
                            <button type="button" className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Confirm'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
