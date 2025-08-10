"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
    open: boolean;
    src: string; // data URL
    aspect?: number; // width / height, default 1
    onCancel: () => void;
    onCropped: (file: File) => void;
    title?: string;
};

export function ImageCropper({ open, src, aspect = 1, onCancel, onCropped, title = "Crop image" }: Props) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // frame px
    const [userScale, setUserScale] = useState(1); // user zoom
    const [baseScale, setBaseScale] = useState(1); // fit-to-frame scale
    const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 });

    // Frame dimensions (square by default, but respect aspect by width)
    const frameSize = 360; // px for preview
    const frameWidth = useMemo(() => (aspect >= 1 ? frameSize : frameSize * aspect), [aspect]);
    const frameHeight = useMemo(() => (aspect >= 1 ? frameSize / aspect : frameSize), [aspect]);

    useEffect(() => {
        // Reset when opening with a new image
        if (open) {
            setOffset({ x: 0, y: 0 });
            setUserScale(1);
            setIsDragging(false);
            setDragStart(null);
        }
    }, [open, src]);

    const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        const delta = -e.deltaY;
        const zoomStep = 0.0015 * delta;
        setUserScale((s) => Math.min(5, Math.max(0.5, s + zoomStep)));
    };

    const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };
    const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
        if (!isDragging || !dragStart) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setDragStart({ x: e.clientX, y: e.clientY });
        setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    };
    const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (_e) => {
        setIsDragging(false);
        setDragStart(null);
    };

    async function handleConfirm() {
        const el = imgRef.current;
        if (!el) return;
        const naturalWidth = naturalSize.w;
        const naturalHeight = naturalSize.h;
        if (!naturalWidth || !naturalHeight) return;

        const combinedScale = baseScale * userScale;
        const displayWidth = naturalWidth * combinedScale;
        const displayHeight = naturalHeight * combinedScale;

        // The image is centered initially; offset shifts it within frame
        const centerX = frameWidth / 2;
        const centerY = frameHeight / 2;

        // Top-left of image relative to frame
        const imageLeft = centerX - displayWidth / 2 + offset.x;
        const imageTop = centerY - displayHeight / 2 + offset.y;

        // We will export square/rect at 1024 on the smallest dimension for quality
        const exportHeight = 1024;
        const exportWidth = Math.round(exportHeight * aspect);

        const canvas = document.createElement("canvas");
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Source rect in image coordinates corresponding to the frame
        const srcX = (0 - imageLeft) / displayWidth * naturalWidth;
        const srcY = (0 - imageTop) / displayHeight * naturalHeight;
        const srcW = frameWidth / displayWidth * naturalWidth;
        const srcH = frameHeight / displayHeight * naturalHeight;

        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
            el,
            srcX,
            srcY,
            srcW,
            srcH,
            0,
            0,
            exportWidth,
            exportHeight
        );

        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
        if (!blob) return;
        const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
        onCropped(file);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[720px] rounded-lg bg-white dark:bg-neutral-900 shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    <button type="button" onClick={onCancel} className="text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800">Close</button>
                </div>
                <div className="p-4">
                    <div
                        onWheel={onWheel}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        className="mx-auto relative overflow-hidden bg-neutral-200 dark:bg-neutral-800 rounded-md touch-none select-none"
                        style={{ width: frameWidth, height: frameHeight }}
                    >
                        <div
                            className="absolute left-1/2 top-1/2"
                            style={{
                                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${baseScale * userScale})`,
                                transformOrigin: "center",
                                width: naturalSize.w,
                                height: naturalSize.h,
                            }}
                        >
                            <Image
                                ref={imgRef}
                                src={src}
                                alt="Crop source"
                                fill
                                sizes={`${Math.round(frameWidth)}px`}
                                unoptimized
                                className="pointer-events-none select-none will-change-transform"
                                onLoadingComplete={(img) => {
                                    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                                    const cover = Math.max(frameWidth / img.naturalWidth, frameHeight / img.naturalHeight);
                                    setBaseScale(cover);
                                    setUserScale(1);
                                    setOffset({ x: 0, y: 0 });
                                }}
                                style={{ objectFit: "contain" }}
                            />
                        </div>
                        {/* Frame overlay */}
                        <div className="absolute inset-0 ring-1 ring-white/60" />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-xs text-gray-500">Zoom</span>
                        <input
                            type="range"
                            min={0.5}
                            max={5}
                            step={0.01}
                            value={userScale}
                            onChange={(e) => setUserScale(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-neutral-800">
                    <button type="button" onClick={onCancel} className="h-9 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                    <button type="button" onClick={handleConfirm} className="h-9 px-3 text-sm rounded-md bg-[#6c47ff] text-white hover:bg-[#5b3dff]">Crop</button>
                </div>
            </div>
        </div>
    );
}
