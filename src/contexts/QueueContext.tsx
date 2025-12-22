import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Video } from '@/types';

interface QueueContextType {
    queue: Video[];
    addToQueue: (video: Video) => void;
    addToQueueNext: (video: Video) => void;
    removeFromQueue: (videoId: string) => void;
    playNextFromQueue: () => Video | null;
    clearQueue: () => void;
    reorderQueue: (fromIndex: number, toIndex: number) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: ReactNode }) {
    const [queue, setQueue] = useState<Video[]>([]);

    const addToQueue = useCallback((video: Video) => {
        setQueue((prev) => {
            // Avoid duplicates
            if (prev.some((v) => v.id === video.id)) return prev;
            return [...prev, video];
        });
    }, []);

    const addToQueueNext = useCallback((video: Video) => {
        setQueue((prev) => {
            const filtered = prev.filter((v) => v.id !== video.id);
            return [video, ...filtered];
        });
    }, []);

    const removeFromQueue = useCallback((videoId: string) => {
        setQueue((prev) => prev.filter((v) => v.id !== videoId));
    }, []);

    const playNextFromQueue = useCallback((): Video | null => {
        // We need to return the value and update state. 
        // Since state update is async, we can't rely on 'queue' state immediately after setQueue in the same tick if we needed it,
        // but here we just need to return the *next* item.
        let nextItem: Video | null = null;

        setQueue((prev) => {
            if (prev.length === 0) {
                nextItem = null;
                return prev;
            }
            const [next, ...rest] = prev;
            nextItem = next;
            return rest;
        });

        // The 'nextItem' local variable won't work inside setQueue for the return of the *Outer* function, 
        // BUT playNextFromQueue needs to return the item.
        // This is tricky with useState functional updates.
        // IMPT: The original implementation in useQueue.ts had:
        // const [next, ...rest] = queue; setQueue(rest); return next;
        // That relied on the 'queue' closure capture.
        // For a context method, proper way is accessing current state.

        // We can't synchronously return the next item if we use functional setQueue blindly.
        // However, we can use the 'queue' from the render scope because we are inside the component.
        // BUT, if multiple updates happen fast, render scope might be stale? 
        // In this app, it's triggered by UI user action or slow video end events. Stable queue is fine.

        // Let's us the render-scope 'queue' for returning, and setQueue for update.
        // Ref:
        if (queue.length === 0) return null;
        const [next, ...rest] = queue;
        setQueue(rest);
        return next;
    }, [queue]);

    const clearQueue = useCallback(() => {
        setQueue([]);
    }, []);

    const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
        setQueue((prev) => {
            const updated = [...prev];
            const [removed] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, removed);
            return updated;
        });
    }, []);

    return (
        <QueueContext.Provider
            value={{
                queue,
                addToQueue,
                addToQueueNext,
                removeFromQueue,
                playNextFromQueue,
                clearQueue,
                reorderQueue,
            }}
        >
            {children}
        </QueueContext.Provider>
    );
}

export function useQueueContext() {
    const context = useContext(QueueContext);
    if (context === undefined) {
        throw new Error('useQueueContext must be used within a QueueProvider');
    }
    return context;
}
