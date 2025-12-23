import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
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
    const queueRef = useRef<Video[]>(queue);

    // Keep ref in sync with state
    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

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
        // Use ref to get the absolute latest queue state synchronously
        const currentQueue = queueRef.current;

        if (currentQueue.length === 0) return null;

        const [next, ...rest] = currentQueue;
        // Update state (and thus ref via effect)
        setQueue(rest);
        return next;
    }, []);

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
