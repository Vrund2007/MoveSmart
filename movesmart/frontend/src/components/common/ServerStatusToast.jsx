import React, { useState, useEffect, useRef, useCallback } from 'react';
import { checkHealth } from '../../api/health';

/**
 * ServerStatusToast — Non-intrusive backend connection & Render wake-up status toast.
 *
 * Requirements fulfilled:
 * 1. Checks GET /api/health/ on mount.
 * 2. Shows "Connecting to server..." -> after 4s pending transitions to "Waking up server... This may take a few seconds."
 * 3. Keeps notification visible until actual backend responds (no fake countdowns).
 * 4. On success: Shows "Server connected ✓", auto-dismisses after 3s, caches in sessionStorage.
 * 5. On failure: Shows "Unable to connect to server" with interactive "Retry" button.
 * 6. Non-blocking & unobtrusive using MoveSmart teal/dark glassmorphism design system.
 */
export default function ServerStatusToast() {
  const [status, setStatus] = useState(() => {
    // If already verified in current browser session, start hidden
    const isHealthy = sessionStorage.getItem('movesmart_backend_healthy');
    return isHealthy === 'true' ? 'idle' : 'connecting';
  });

  const wakingTimerRef = useRef(null);
  const dismissTimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (wakingTimerRef.current) clearTimeout(wakingTimerRef.current);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  }, []);

  const runHealthCheck = useCallback(async () => {
    clearTimers();
    setStatus('connecting');

    // After 4 seconds, if still pending, update text to "Waking up server..."
    wakingTimerRef.current = setTimeout(() => {
      setStatus((current) => (current === 'connecting' ? 'waking' : current));
    }, 4000);

    try {
      await checkHealth();
      clearTimers();
      setStatus('connected');
      sessionStorage.setItem('movesmart_backend_healthy', 'true');

      // Auto dismiss success toast after 3 seconds
      dismissTimerRef.current = setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err) {
      clearTimers();
      setStatus('error');
    }
  }, [clearTimers]);

  useEffect(() => {
    const isHealthy = sessionStorage.getItem('movesmart_backend_healthy');
    if (isHealthy !== 'true') {
      runHealthCheck();
    }
    return () => clearTimers();
  }, [runHealthCheck, clearTimers]);

  if (status === 'idle') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[99999] max-w-sm w-[90vw] sm:w-auto bg-[#222831]/95 text-white backdrop-blur-md border border-[#00ADB5]/30 shadow-2xl rounded-2xl p-4 flex items-center gap-3.5 font-sans transition-all animate-fade-in"
    >
      {/* Icon Indicator */}
      {(status === 'connecting' || status === 'waking') && (
        <div className="relative flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin" />
        </div>
      )}

      {status === 'connected' && (
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold border border-emerald-500/40 shrink-0">
          ✓
        </div>
      )}

      {status === 'error' && (
        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm font-bold border border-rose-500/40 shrink-0">
          ⚠️
        </div>
      )}

      {/* Status Content */}
      <div className="flex-1 text-left">
        {status === 'connecting' && (
          <div>
            <p className="text-xs font-bold text-white">Connecting to server...</p>
            <p className="text-[10px] text-gray-400">Verifying backend response</p>
          </div>
        )}

        {status === 'waking' && (
          <div>
            <p className="text-xs font-bold text-[#00ADB5]">Waking up server...</p>
            <p className="text-[10px] text-gray-300">This may take up to 60 seconds on free tier.</p>
          </div>
        )}

        {status === 'connected' && (
          <div>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              Server connected ✓
            </p>
            <p className="text-[10px] text-gray-300">MoveSmart API is ready</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className="text-xs font-bold text-rose-300">Unable to connect to server</p>
            <p className="text-[10px] text-gray-400">Network or timeout issue</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {status === 'error' && (
        <button
          type="button"
          onClick={runHealthCheck}
          className="bg-[#00ADB5] hover:bg-teal-500 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg shadow transition-all transform active:scale-95 flex items-center gap-1 whitespace-nowrap ml-1"
        >
          <span>🔄</span>
          <span>Retry</span>
        </button>
      )}

      {/* Manual Dismiss */}
      <button
        type="button"
        onClick={() => setStatus('idle')}
        className="text-gray-400 hover:text-white text-xs p-1 ml-1 rounded transition-colors"
        title="Dismiss notice"
      >
        ✕
      </button>
    </div>
  );
}
