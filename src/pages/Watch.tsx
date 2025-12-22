import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { Navbar } from '@/components/Navbar';
import { QueuePanel } from '@/components/QueuePanel';
import { VideoCard } from '@/components/VideoCard';
import { useTheme } from '@/hooks/useTheme';
import { useHistory } from '@/hooks/useHistory';
import { useQueue } from '@/hooks/useQueue';
import { useLanguage } from '@/hooks/useLanguage';
import { getVideoThumbnail, extractPlaylistId } from '@/utils/youtube';
import type { Video } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function Watch() {
  const { videoId } = useParams<{ videoId: string }>();
  const [searchParams] = useSearchParams();
  const playlistId = searchParams.get('list');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { history, addToHistory } = useHistory();
  const { language, toggleLanguage, t } = useLanguage();
  const {
    queue,
    addToQueue,
    removeFromQueue,
    playNextFromQueue,
    clearQueue,
    reorderQueue,
  } = useQueue();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [dominantColor, setDominantColor] = useState<string>('');

  // Create current video object
  const currentPlayingVideo = useMemo<Video | null>(() => videoId
    ? {
      id: videoId,
      thumbnail: getVideoThumbnail(videoId),
      url: `https://youtube.com/watch?v=${videoId}`,
      playlistId: playlistId || undefined,
      addedAt: Date.now(),
    }
    : null, [videoId, playlistId]);



  const handleVideoEnd = useCallback(() => {
    const nextFromQueue = playNextFromQueue();
    if (nextFromQueue) {
      addToHistory(nextFromQueue);
      navigate(`/watch/${nextFromQueue.id}`);
    }
  }, [playNextFromQueue, addToHistory, navigate]);

  const handleAddVideoToQueue = useCallback((video: Video) => {
    addToQueue(video);
    toast({
      title: t('addedToQueue'),
      description: t('videoAddedQueue'),
    });
  }, [addToQueue, t]);

  const handlePlayFromQueue = useCallback((video: Video) => {
    removeFromQueue(video.id);
    addToHistory(video);
    navigate(`/watch/${video.id}`);
  }, [removeFromQueue, addToHistory, navigate]);

  const handlePlayerVideoPlay = useCallback((playedVideoId: string) => {
    // Auto-save to history whenever any video starts playing in the player
    // We need to construct a partial video object or just pass ID if possible, 
    // but addToHistory needs a full object.

    // Check if we are potentially in a loop or redundant update
    // If the playedVideoId matches the current videoId in URL, we assume currentPlayingVideo is valid.

    if (playedVideoId === videoId && currentPlayingVideo) {
      // Only add if it's not the most recent one to avoid duplicates/spam (useHistory handles ID dedup but still updates timestamp)
      addToHistory(currentPlayingVideo);
    } else {
      // It's a next video from playlist/autoplay.
      const autoVideo: Video = {
        id: playedVideoId,
        thumbnail: getVideoThumbnail(playedVideoId),
        url: `https://youtube.com/watch?v=${playedVideoId}`,
        // playlistId: playlistId, // maybe preserve playlist context?
        addedAt: Date.now(),
      };
      addToHistory(autoVideo);

      if (playedVideoId !== videoId) {
        if (playlistId) {
          navigate(`/watch/${playedVideoId}?list=${playlistId}`, { replace: true });
        } else {
          navigate(`/watch/${playedVideoId}`, { replace: true });
        }
      }
    }
  }, [videoId, currentPlayingVideo, addToHistory, navigate, playlistId]);

  if (!videoId) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-1000">
      {/* Dynamic Ambient Background */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000 opacity-60 dark:opacity-40"
        style={{
          background: dominantColor
            ? `radial-gradient(circle at 50% 30%, rgba(${dominantColor}, 0.35) 0%, transparent 70%)`
            : undefined,
          filter: 'blur(100px)',
          zIndex: 0
        }}
      />
      <div className="relative z-10">
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          toggleLanguage={toggleLanguage}
          t={t}
        />

        <main className="container max-w-7xl mx-auto px-4 py-6">
          {/* Player */}
          <div className="mb-6 opacity-0 animate-fade-in">
            <YouTubePlayer
              key={videoId}
              videoId={videoId}
              playlistId={playlistId}
              onVideoEnd={handleVideoEnd}
              onOpenQueue={() => setIsQueueOpen(true)}
              onAddToQueue={handleAddVideoToQueue}
              queueCount={queue.length}
              t={t}
              onColorChange={setDominantColor}
              onVideoPlay={handlePlayerVideoPlay}
            />
          </div>

          {/* Recent History */}
          {history.length > 1 && (
            <section className="opacity-0 animate-fade-in stagger-2 mt-8">
              <h2 className="text-lg font-semibold mb-4">{t('recentlyWatched')}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {history
                  .filter((item) => item.id !== videoId)
                  .slice(0, 16)
                  .map((item) => (
                    <VideoCard
                      key={item.id}
                      video={item}
                      compact
                      onPlay={() => {
                        addToHistory(item);
                        if (item.playlistId) {
                          navigate(`/watch/${item.id}?list=${item.playlistId}`);
                        } else {
                          navigate(`/watch/${item.id}`);
                        }
                      }}
                    />
                  ))}
              </div>
            </section>
          )}
        </main>

        <QueuePanel
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
          queue={queue}
          onRemove={removeFromQueue}
          onReorder={reorderQueue}
          onClear={clearQueue}
          onPlay={handlePlayFromQueue}
          t={t}
        />
      </div>
    </div>
  );
}
