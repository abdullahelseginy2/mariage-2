import React, { useEffect, useRef, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';

const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const templateThemes = {
  classic: {
    btnClass: "bg-white/80 border-champagne text-gold hover:bg-gold hover:text-white ring-gold/30",
    pingClass: "bg-gold/50",
    tooltipClass: "bg-white text-gold"
  },
  signature: {
    btnClass: "bg-[#fdfbf7]/90 border-[#c8a96a]/70 text-[#aa8647] hover:bg-[#c8a96a] hover:text-white ring-[#c8a96a]/25",
    pingClass: "bg-[#c8a96a]/35",
    tooltipClass: "bg-[#fdfbf7] text-[#765d2e] border border-[#c8a96a]/35"
  },
  royal: {
    btnClass: "bg-[#100a06]/80 border-[#f5c65c]/35 text-[#f5c65c] hover:bg-[#f5c65c] hover:text-[#100a06] ring-[#f5c65c]/30",
    pingClass: "bg-[#f5c65c]/50",
    tooltipClass: "bg-[#100a06] text-[#fff8e7] border border-[#f5c65c]/20"
  },
  'love-letter': {
    btnClass: "bg-[#fffdf8]/80 border-[#c58c85]/35 text-[#c58c85] hover:bg-[#c58c85] hover:text-white ring-[#c58c85]/30",
    pingClass: "bg-[#c58c85]/50",
    tooltipClass: "bg-[#fffdf8] text-[#3d2d2a] border border-[#c58c85]/20"
  },
  'floral-butterfly': {
    btnClass: "bg-white/80 border-[#cba7ee]/35 text-[#7e3f99] hover:bg-[#7e3f99] hover:text-white ring-[#7e3f99]/30",
    pingClass: "bg-[#7e3f99]/50",
    tooltipClass: "bg-[#fbf7ff] text-[#33273c] border border-[#cba7ee]/20"
  },
  'modern-minimal': {
    btnClass: "bg-[#07070b]/80 border-[#e6c387]/35 text-[#e6c387] hover:bg-[#e6c387] hover:text-[#07070b] ring-[#e6c387]/30",
    pingClass: "bg-[#e6c387]/50",
    tooltipClass: "bg-[#07070b] text-white border border-[#e6c387]/20"
  },
  burgundy: {
    btnClass: "bg-[#4b091d]/90 border-[#e8c78d]/45 text-[#f2d59e] hover:bg-[#e8c78d] hover:text-[#3a0616] ring-[#e8c78d]/25",
    pingClass: "bg-[#e8c78d]/35",
    tooltipClass: "bg-[#310512] text-[#fff7ec] border border-[#e8c78d]/25"
  }
};

const AudioPlayer = ({ invitation, playSignal = 0, className = '' }) => {
  const audioCopy = invitation?.audio || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const iframeRef = useRef(null);
  const playAudioRef = useRef(null);

  const youtubeId = getYouTubeId(audioCopy.src);

  useEffect(() => {
    if (!audioCopy.src) return undefined;

    if (youtubeId) {
      const playAudio = () => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          const targetVol = Math.round(Number(audioCopy.volume ?? 0.4) * 100);
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [targetVol] }), '*');
          setIsPlaying(true);
        }
      };
      playAudioRef.current = playAudio;

      const playAfterInteraction = () => {
        playAudio();
        window.removeEventListener('pointerdown', playAfterInteraction);
        window.removeEventListener('keydown', playAfterInteraction);
        window.removeEventListener('scroll', playAfterInteraction);
      };

      window.addEventListener('pointerdown', playAfterInteraction, { once: true });
      window.addEventListener('keydown', playAfterInteraction, { once: true });
      window.addEventListener('scroll', playAfterInteraction, { once: true });

      return () => {
        window.removeEventListener('pointerdown', playAfterInteraction);
        window.removeEventListener('keydown', playAfterInteraction);
        window.removeEventListener('scroll', playAfterInteraction);
      };
    } else {
      const audio = new Audio(audioCopy.src);
      audio.loop = true;
      audio.volume = Number(audioCopy.volume ?? 0.4);
      audioRef.current = audio;

      const playAudio = () => {
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      };
      playAudioRef.current = playAudio;

      const playAfterInteraction = () => {
        playAudio();
        window.removeEventListener('pointerdown', playAfterInteraction);
        window.removeEventListener('keydown', playAfterInteraction);
        window.removeEventListener('scroll', playAfterInteraction);
      };

      window.addEventListener('pointerdown', playAfterInteraction, { once: true });
      window.addEventListener('keydown', playAfterInteraction, { once: true });
      window.addEventListener('scroll', playAfterInteraction, { once: true });

      return () => {
        audio.pause();
        audioRef.current = null;
        playAudioRef.current = null;
        window.removeEventListener('pointerdown', playAfterInteraction);
        window.removeEventListener('keydown', playAfterInteraction);
        window.removeEventListener('scroll', playAfterInteraction);
      };
    }
  }, [audioCopy.src, audioCopy.volume, youtubeId]);

  useEffect(() => {
    if (playSignal > 0) playAudioRef.current?.();
  }, [playSignal]);

  if (audioCopy.is_enabled === false) return null;
  if (!audioCopy.src) return null;

  const togglePlay = () => {
    if (isPlaying) {
      if (youtubeId) {
        iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } else {
        audioRef.current?.pause();
      }
      setIsPlaying(false);
      return;
    }

    if (youtubeId) {
      iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      const targetVol = Math.round(Number(audioCopy.volume ?? 0.4) * 100);
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [targetVol] }), '*');
      setIsPlaying(true);
    } else {
      audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const templateId = invitation?.template || 'classic';
  const theme = templateThemes[templateId] || templateThemes.classic;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <button
        type="button"
        onClick={togglePlay}
        className={`w-14 h-14 rounded-full shadow-lg border flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 group ${theme.btnClass}`}
        aria-label={isPlaying ? audioCopy.pause : audioCopy.play}
      >
        {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
        <span className={`absolute right-full mr-4 px-3 py-1 rounded-md shadow-md text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${theme.tooltipClass}`}>
          {isPlaying ? audioCopy.pause : audioCopy.play}
        </span>
      </button>
      {isPlaying && <span className={`absolute inset-0 rounded-full animate-ping -z-10 ${theme.pingClass}`} />}

      {youtubeId && (
        <iframe
          ref={iframeRef}
          title="YouTube Background Music"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&loop=1&playlist=${youtubeId}&controls=0&mute=0`}
          allow="autoplay"
          className="hidden"
          style={{ display: 'none', width: 0, height: 0 }}
        />
      )}
    </div>
  );
};

export default AudioPlayer;
