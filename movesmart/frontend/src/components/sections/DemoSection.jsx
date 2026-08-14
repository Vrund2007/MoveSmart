// frontend/src/components/sections/DemoSection.jsx
// Section — Product Demo Video Showcase
import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, ShieldCheck, MapPin, Navigation, Volume2, VolumeX } from 'lucide-react';

export const DEMO_VIDEO_URL = 'https://www.youtube.com/embed/YsWYBjXRmGU';

const DEMO_HIGHLIGHTS = [
  { icon: MapPin, label: 'AI Locality Scoring' },
  { icon: Navigation, label: 'Real-Time Commute Analysis' },
  { icon: ShieldCheck, label: 'Admin-Verified Homes' },
];

export default function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef(null);

  // Listen for custom "play-demo-video" event dispatched when clicking "Show Demo"
  useEffect(() => {
    const handleAutoplayEvent = () => {
      setIsPlaying(true);
    };

    window.addEventListener('play-demo-video', handleAutoplayEvent);
    return () => window.removeEventListener('play-demo-video', handleAutoplayEvent);
  }, []);

  const getEmbedUrl = () => {
    const baseUrl = DEMO_VIDEO_URL;
    const params = new URLSearchParams({
      enablejsapi: '1',
      rel: '0',
      modestbranding: '1',
    });

    if (isPlaying) {
      params.append('autoplay', '1');
      if (isMuted) {
        params.append('mute', '1');
      }
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const handleStartPlay = () => {
    setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <section
      id="demo"
      className="relative bg-[#EEEEEE]/90 scroll-mt-24 md:scroll-mt-28 py-20 px-6 md:px-16 overflow-hidden border-t border-b border-black/5"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-black/5 shadow-xs">
            <Sparkles size={14} className="text-[#00ADB5]" />
            <span className="text-xs font-bold text-[#00ADB5] uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              Product Tour
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-[#222831] tracking-tight font-['Plus_Jakarta_Sans']">
            Experience MoveSmart in Action
          </h2>

          <p className="text-[#393E46] text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Discover how our AI-powered companion matches you with the right neighborhood, calculates real commutes, and simplifies your city relocation.
          </p>
        </div>

        {/* Video Showcase Card */}
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl p-3 sm:p-5 md:p-6 shadow-2xl shadow-[#00ADB5]/10 border border-white/90 relative overflow-hidden group">
          {/* Card Top Title Bar */}
          <div className="flex items-center justify-between px-3 py-2 mb-3 border-b border-black/5 text-xs text-[#393E46] font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
              <span className="ml-2 font-bold text-[#222831] hidden sm:inline font-['Plus_Jakarta_Sans']">
                MoveSmart Interactive Showcase
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isPlaying && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00ADB5] hover:text-[#008C93] transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isMuted ? 'Muted' : 'Audio On'}</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 bg-[#00ADB5]/10 px-2.5 py-0.5 rounded-full border border-[#00ADB5]/20">
                <span className="w-2 h-2 rounded-full bg-[#00ADB5] animate-pulse" />
                <span className="font-bold text-[#008C93] text-[11px] uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                  HD Walkthrough
                </span>
              </div>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#222831] shadow-inner border border-black/10">
            <iframe
              ref={iframeRef}
              src={getEmbedUrl()}
              title="MoveSmart Product Demo Video"
              className="w-full h-full border-0 rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            {/* Custom Interactive Play Overlay (Before user clicks Play) */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#222831]/80 via-[#222831]/40 to-transparent flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group-hover:bg-[#222831]/50">
                <button
                  type="button"
                  onClick={handleStartPlay}
                  className="interactive-hover relative group/play flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#00ADB5] text-white shadow-xl shadow-[#00ADB5]/40 hover:scale-110 hover:bg-[#00969d] active:scale-95 transition-all duration-300 cursor-pointer mb-4"
                  aria-label="Play MoveSmart Demo Video"
                >
                  <Play size={32} className="ml-1 fill-current transition-transform group-hover/play:scale-110" />
                </button>
                <p className="text-white font-extrabold text-lg sm:text-xl font-['Plus_Jakarta_Sans'] tracking-tight drop-shadow-md">
                  Watch MoveSmart Demo Showcase
                </p>
                <p className="text-[#EEEEEE]/80 text-xs sm:text-sm font-medium max-w-sm mt-1">
                  Click to play full product walkthrough in HD
                </p>
              </div>
            )}
          </div>

          {/* Feature Highlights Pills Below Video */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-black/5">
            {DEMO_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#EEEEEE]/60 border border-black/5 text-xs font-bold text-[#222831] font-['Plus_Jakarta_Sans'] justify-center"
                >
                  <div className="w-6 h-6 rounded-full bg-[#00ADB5]/15 flex items-center justify-center text-[#00ADB5]">
                    <Icon size={13} />
                  </div>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
