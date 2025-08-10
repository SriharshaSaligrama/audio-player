import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put, del } from '@vercel/blob';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { sessionClaims } = await auth();
        if (!sessionClaims) return NextResponse.json({ error: { message: 'Authentication required', statusCode: 401 } }, { status: 401 });
        if (sessionClaims?.metadata?.role !== 'admin') return NextResponse.json({ error: { message: 'Admin access required', statusCode: 403 } }, { status: 403 });
        const form = await req.formData();
        const file = form.get('file');
        const folder = String(form.get('folder') || 'misc');
        const entityId = String(form.get('entityId') || '').trim();
        const oldPathname = String(form.get('oldPathname') || '').trim();
        if (!(file instanceof File)) {
            return NextResponse.json({ error: { message: 'No file uploaded', statusCode: 400 } }, { status: 400 });
        }
        // Derive file extension from filename or mime type
        const originalName = file.name || 'upload';
        const extFromName = originalName.includes('.') ? `.${originalName.split('.').pop()}` : '';
        const extFromType = file.type?.split('/')[1] ? `.${file.type.split('/')[1]}` : '';
        const ext = (extFromName || extFromType || '.bin').toLowerCase();

        const key = entityId
            ? `${folder}/${entityId}${ext}`
            : `${folder}/${Date.now()}-${originalName}`;

        // If old pathname provided and different from the new key, delete old to avoid duplicates
        if (oldPathname && !oldPathname.endsWith(`/${entityId}${ext}`)) {
            try { await del(oldPathname); } catch { }
        }
        const blob = await put(key, file, { access: 'public', addRandomSuffix: false, allowOverwrite: true });
        return NextResponse.json({ url: blob.url, pathname: blob.pathname });
    } catch (error) {
        return NextResponse.json({ error: { message: (error as Error).message, statusCode: 500 } }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { sessionClaims } = await auth();
        if (!sessionClaims) return NextResponse.json({ error: { message: 'Authentication required', statusCode: 401 } }, { status: 401 });
        if (sessionClaims?.metadata?.role !== 'admin') return NextResponse.json({ error: { message: 'Admin access required', statusCode: 403 } }, { status: 403 });
        const { pathname } = await req.json();
        if (!pathname) return NextResponse.json({ error: { message: 'pathname required', statusCode: 400 } }, { status: 400 });
        await del(pathname);
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: { message: (error as Error).message, statusCode: 500 } }, { status: 500 });
    }
}
