// pages/Signup.jsx — MoveSmart signup page
// Same design system as Login.jsx: Design.md §2 tokens, Plus Jakarta Sans, aurora left panel
// Step 1: collect name, email, password, role → on success redirect to /choose-your-journey
// Frontend-only stub — wire to POST /api/auth/register when backend is ready

import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/* ─────────────────────────────────────────────────────────────
   EyeBall — white sclera + tracking pupil
───────────────────────────────────────────────────────────── */
function EyeBall({
  size = 18, pupilSize = 7, maxDistance = 5,
  eyeColor = 'white', pupilColor = '#1a1a2e',
  isBlinking = false, forceLookX, forceLookY,
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (forceLookX !== undefined || forceLookY !== undefined) {
      setPos({ x: forceLookX ?? 0, y: forceLookY ?? 0 });
      return;
    }
    const onMove = (e) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const s = Math.min(d, maxDistance) / d;
      setPos({ x: dx * s, y: dy * s });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [forceLookX, forceLookY, maxDistance]);

  return (
    <div ref={ref} style={{
      width: size, height: isBlinking ? 2 : size,
      borderRadius: isBlinking ? 1 : '50%',
      backgroundColor: eyeColor, position: 'relative', overflow: 'hidden',
      flexShrink: 0, transition: 'height 0.06s ease',
      boxShadow: '0 0 0 1.5px rgba(0,0,0,0.12)',
    }}>
      {!isBlinking && (
        <div style={{
          width: pupilSize, height: pupilSize, borderRadius: '50%',
          backgroundColor: pupilColor, position: 'absolute',
          top: '50%', left: '50%',
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
          transition: 'transform 0.08s ease-out',
        }} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Pupil — bare dot for orange & yellow bodies
───────────────────────────────────────────────────────────── */
function Pupil({ size = 12, maxDistance = 5, pupilColor = '#1a1a2e', forceLookX, forceLookY }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (forceLookX !== undefined || forceLookY !== undefined) {
      setPos({ x: forceLookX ?? 0, y: forceLookY ?? 0 });
      return;
    }
    const onMove = (e) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const s = Math.min(d, maxDistance) / d;
      setPos({ x: dx * s, y: dy * s });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [forceLookX, forceLookY, maxDistance]);

  return (
    <div ref={ref} style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: pupilColor, flexShrink: 0,
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      transition: 'transform 0.08s ease-out', position: 'relative',
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────
   Character position from mouse
───────────────────────────────────────────────────────────── */
function useCharPos(ref, mx, my) {
  if (!ref?.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
  const r = ref.current.getBoundingClientRect();
  const dx = mx - (r.left + r.width / 2);
  const dy = my - (r.top + r.height / 3);
  return {
    faceX: Math.max(-15, Math.min(15, dx / 20)),
    faceY: Math.max(-10, Math.min(10, dy / 30)),
    bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
  };
}

/* ─────────────────────────────────────────────────────────────
   Role options
───────────────────────────────────────────────────────────── */
const ROLES = [
  { value: 'find_accommodation', label: '🏠 Buyer / Renter', desc: 'Find your perfect home' },
  { value: 'property_owner', label: '🏢 Property Owner', desc: 'List & manage properties' },
  { value: 'broker', label: '🤝 Certified Broker', desc: 'Connect buyers & owners' },
  { value: 'company_hr', label: '👔 HR / Relocation', desc: 'Manage employee moves' },
];

/* ─────────────────────────────────────────────────────────────
   Password strength helper
───────────────────────────────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '', color: 'transparent' },
    { label: 'Weak', color: '#EF4444' },
    { label: 'Fair', color: '#F59E0B' },
    { label: 'Good', color: '#3B82F6' },
    { label: 'Strong', color: '#22C55E' },
  ];
  return { score, ...map[score] };
}

/* ─────────────────────────────────────────────────────────────
   Main Signup Page
───────────────────────────────────────────────────────────── */
export default function Signup() {
  const navigate = useNavigate();
  const { register, setRole, loading, setUser } = useContext(AuthContext);

  /* form */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setSelectedRole] = useState('find_accommodation');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  /* mouse */
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);

  /* animation flags */
  const [purpleBlink, setPurpleBlink] = useState(false);
  const [blackBlink, setBlackBlink] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lookingAtEachOther, setLookingAtEachOther] = useState(false);
  const [peekActive, setPeekActive] = useState(false);

  /* refs */
  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const orangeRef = useRef(null);
  const yellowRef = useRef(null);

  /* mouse tracking */
  useEffect(() => {
    const h = (e) => { setMx(e.clientX); setMy(e.clientY); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  /* random blinks */
  useEffect(() => {
    let t;
    const go = () => { t = setTimeout(() => { setPurpleBlink(true); setTimeout(() => { setPurpleBlink(false); go(); }, 150); }, Math.random() * 4000 + 3000); };
    go(); return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    let t;
    const go = () => { t = setTimeout(() => { setBlackBlink(true); setTimeout(() => { setBlackBlink(false); go(); }, 150); }, Math.random() * 4000 + 3000); };
    go(); return () => clearTimeout(t);
  }, []);

  /* look at each other on typing */
  useEffect(() => {
    if (!isTyping) { setLookingAtEachOther(false); return; }
    setLookingAtEachOther(true);
    const t = setTimeout(() => setLookingAtEachOther(false), 800);
    return () => clearTimeout(t);
  }, [isTyping]);

  /* peek when password visible */
  useEffect(() => {
    if ((!showPw && !showCPw) || !password) { setPeekActive(false); return; }
    let t;
    const go = () => { t = setTimeout(() => { setPeekActive(true); setTimeout(() => { setPeekActive(false); go(); }, 800); }, Math.random() * 3000 + 2000); };
    go(); return () => clearTimeout(t);
  }, [showPw, showCPw, password]);

  /* derived */
  const passwordPeeking = (showPw || showCPw) && password.length > 0;
  const passwordHidden = !showPw && !showCPw && password.length > 0;
  const strength = getStrength(password);

  /* char positions */
  const pp = useCharPos(purpleRef, mx, my);
  const bp = useCharPos(blackRef, mx, my);
  const op = useCharPos(orangeRef, mx, my);
  const yp = useCharPos(yellowRef, mx, my);


  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email) { setError('Please enter your email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!agree) { setError('Please accept the Terms & Privacy Policy.'); return; }

    const res = await register(name, email, password, confirm);
    if (res.success) {
      navigate('/choose-your-journey');
    } else {
      setError(res.error || 'Registration failed. Please check your inputs.');
    }
  };

  /* ──────────── Eye/PW toggle SVGs ──────────── */
  const EyeOff = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
  const EyeOn = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .ms-su-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
          background: #EEEEEE;
        }
        @media (min-width: 1024px) {
          .ms-su-root        { grid-template-columns: 1fr 1fr; }
          .ms-su-left        { display: flex !important; }
          .ms-su-mobile-logo { display: none !important; }
        }

        @keyframes ms-su-fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ms-su-spin { to { transform:rotate(360deg); } }
        @keyframes ms-su-aurora {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }

        .ms-su-left {
          display: none;
          position: relative;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.75rem 3rem;
          color: white;
          overflow: hidden;
          background: linear-gradient(135deg, #00ADB5 0%, #222831 45%, #393E46 75%, #00ADB5 100%);
          background-size: 400% 400%;
          animation: ms-su-aurora 12s ease infinite;
        }
        .ms-su-left::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .ms-su-logo-ring {
          width: 44px; height: 44px; border-radius: 50%; padding: 2px;
          background: linear-gradient(135deg, #00ADB5, #222831, #00ADB5);
          box-shadow: 0 4px 16px rgba(0,173,181,0.35);
          flex-shrink: 0;
        }
        .ms-su-logo-ring img {
          width: 100%; height: 100%; border-radius: 50%;
          object-fit: cover; background: white; display: block;
        }

        .ms-su-field {
          width: 100%; height: 48px; border-radius: 12px;
          border: 1.5px solid #D9D9D9; padding: 0 14px;
          font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          color: #222831; background: white; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s; outline: none;
        }
        .ms-su-field:focus {
          border-color: #00ADB5;
          box-shadow: 0 0 0 3px rgba(0,173,181,0.18);
        }
        .ms-su-field:disabled { opacity: 0.6; cursor: not-allowed; }

        .ms-su-btn-primary {
          width: 100%; height: 48px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #00ADB5, #008C93);
          color: white; font-size: 15px; font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(0,173,181,0.3);
          transition: all 0.2s;
        }
        .ms-su-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #00bfc8, #00ADB5);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,173,181,0.4);
        }
        .ms-su-btn-primary:active { transform: translateY(0); }
        .ms-su-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .ms-su-btn-google {
          width: 100%; height: 48px; border-radius: 12px;
          background: white; border: 1.5px solid #D9D9D9;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: 14px; font-weight: 700; color: #222831; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .ms-su-btn-google:hover { background: #f4f4f4; border-color: #bbb; }

        .ms-su-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #393E46; padding: 4px; transition: color 0.15s; line-height: 1;
        }
        .ms-su-pw-toggle:hover { color: #00ADB5; }

        .ms-su-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          padding: 28px 28px 24px;
        }

        .ms-su-divider { position:relative; margin:18px 0; display:flex; align-items:center; gap:12px; }
        .ms-su-divider-line { flex:1; height:1px; background:#D9D9D9; }
        .ms-su-divider-text { font-size:11px; font-weight:700; color:#393E46; letter-spacing:0.08em; text-transform:uppercase; }

        .ms-su-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 99px;
          background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: white;
        }
        .ms-su-badge-dot { width:7px; height:7px; border-radius:50%; background:#00ADB5; }

        .ms-su-role-card {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          border: 1.5px solid #D9D9D9; background: white;
          cursor: pointer; transition: all 0.18s; width: 100%;
          text-align: left; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .ms-su-role-card:hover { border-color: #00ADB5; background: rgba(0,173,181,0.04); }
        .ms-su-role-card.active {
          border-color: #00ADB5; background: rgba(0,173,181,0.07);
          box-shadow: 0 0 0 3px rgba(0,173,181,0.15);
        }

        .ms-su-spinner { animation: ms-su-spin 0.8s linear infinite; }

        .ms-su-strength-bar {
          height: 4px; border-radius: 4px;
          transition: width 0.3s ease, background 0.3s ease;
          background: #D9D9D9;
        }

        .ms-su-login-link { font-weight: 800; color: #222831; text-decoration: none; transition: color 0.15s; }
        .ms-su-login-link:hover { color: #00ADB5; }
      `}</style>

      <div className="ms-su-root">

        {/* ══════════════════════════════════════════
            LEFT — Aurora + Characters + Branding
        ══════════════════════════════════════════ */}
        <div className="ms-su-left">
          {/* ambient blobs */}
          <div style={{ position: 'absolute', top: '15%', right: '20%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(0,173,181,0.18)', filter: 'blur(70px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

          {/* Logo — links to home */}
          <Link
            to="/"
            style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', gap: 14, animation: 'ms-su-fadeUp 0.6s ease both', textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            aria-label="Go to MoveSmart homepage"
          >
            <div className="ms-su-logo-ring">
              <img src="/smart-Building.png" alt="MoveSmart" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Move<span style={{ color: '#00ADB5' }}>Smart</span>
              </div>
              <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 600, marginTop: 2 }}>AI City Relocation Marketplace</div>
            </div>
          </Link>

          {/* Characters stage */}
          <div style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 460 }}>
            <div style={{ position: 'relative', width: 520, height: 390 }}>

              {/* Purple — tallest back layer */}
              <div ref={purpleRef} style={{
                position: 'absolute', bottom: 0, left: 60, width: 180,
                height: (isTyping || passwordHidden) ? 440 : 400,
                backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0',
                zIndex: 1, transition: 'all 0.7s ease',
                transform: passwordPeeking
                  ? 'skewX(0deg)'
                  : (isTyping || passwordHidden)
                    ? `skewX(${(pp.bodySkew || 0) - 12}deg) translateX(40px)`
                    : `skewX(${pp.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}>
                <div style={{
                  position: 'absolute', display: 'flex', gap: 30, transition: 'all 0.7s ease',
                  left: passwordPeeking ? 20 : lookingAtEachOther ? 55 : 45 + (pp.faceX || 0),
                  top: passwordPeeking ? 35 : lookingAtEachOther ? 65 : 40 + (pp.faceY || 0),
                }}>
                  <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#1a1a2e"
                    isBlinking={purpleBlink}
                    forceLookX={passwordPeeking ? (peekActive ? 4 : -4) : lookingAtEachOther ? 3 : undefined}
                    forceLookY={passwordPeeking ? (peekActive ? 5 : -4) : lookingAtEachOther ? 4 : undefined} />
                  <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#1a1a2e"
                    isBlinking={purpleBlink}
                    forceLookX={passwordPeeking ? (peekActive ? 4 : -4) : lookingAtEachOther ? 3 : undefined}
                    forceLookY={passwordPeeking ? (peekActive ? 5 : -4) : lookingAtEachOther ? 4 : undefined} />
                </div>
              </div>

              {/* Black — middle */}
              <div ref={blackRef} style={{
                position: 'absolute', bottom: 0, left: 230, width: 120, height: 310,
                backgroundColor: '#1a1a2e', borderRadius: '8px 8px 0 0',
                zIndex: 2, transition: 'all 0.7s ease',
                transform: passwordPeeking ? 'skewX(0deg)'
                  : lookingAtEachOther ? `skewX(${(bp.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || passwordHidden) ? `skewX(${(bp.bodySkew || 0) * 1.5}deg)`
                      : `skewX(${bp.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}>
                <div style={{
                  position: 'absolute', display: 'flex', gap: 24, transition: 'all 0.7s ease',
                  left: passwordPeeking ? 10 : lookingAtEachOther ? 32 : 26 + (bp.faceX || 0),
                  top: passwordPeeking ? 28 : lookingAtEachOther ? 12 : 32 + (bp.faceY || 0),
                }}>
                  <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#1a1a2e"
                    isBlinking={blackBlink}
                    forceLookX={passwordPeeking ? -4 : lookingAtEachOther ? 0 : undefined}
                    forceLookY={passwordPeeking ? -4 : lookingAtEachOther ? -4 : undefined} />
                  <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#1a1a2e"
                    isBlinking={blackBlink}
                    forceLookX={passwordPeeking ? -4 : lookingAtEachOther ? 0 : undefined}
                    forceLookY={passwordPeeking ? -4 : lookingAtEachOther ? -4 : undefined} />
                </div>
              </div>

              {/* Orange — front-left semicircle */}
              <div ref={orangeRef} style={{
                position: 'absolute', bottom: 0, left: 0, width: 240, height: 200,
                backgroundColor: '#FF9B6B', borderRadius: '120px 120px 0 0',
                zIndex: 3, transition: 'all 0.7s ease',
                transform: passwordPeeking ? 'skewX(0deg)' : `skewX(${op.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}>
                <div style={{
                  position: 'absolute', display: 'flex', gap: 32, transition: 'all 0.2s ease',
                  left: passwordPeeking ? 50 : 82 + (op.faceX || 0),
                  top: passwordPeeking ? 85 : 90 + (op.faceY || 0),
                }}>
                  <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e"
                    forceLookX={passwordPeeking ? -5 : undefined}
                    forceLookY={passwordPeeking ? -4 : undefined} />
                  <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e"
                    forceLookX={passwordPeeking ? -5 : undefined}
                    forceLookY={passwordPeeking ? -4 : undefined} />
                </div>
              </div>

              {/* Yellow — front-right capsule */}
              <div ref={yellowRef} style={{
                position: 'absolute', bottom: 0, left: 300, width: 140, height: 230,
                backgroundColor: '#E8D754', borderRadius: '70px 70px 0 0',
                zIndex: 4, transition: 'all 0.7s ease',
                transform: passwordPeeking ? 'skewX(0deg)' : `skewX(${yp.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}>
                <div style={{
                  position: 'absolute', display: 'flex', gap: 24, transition: 'all 0.2s ease',
                  left: passwordPeeking ? 20 : 52 + (yp.faceX || 0),
                  top: passwordPeeking ? 35 : 40 + (yp.faceY || 0),
                }}>
                  <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e"
                    forceLookX={passwordPeeking ? -5 : undefined}
                    forceLookY={passwordPeeking ? -4 : undefined} />
                  <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e"
                    forceLookX={passwordPeeking ? -5 : undefined}
                    forceLookY={passwordPeeking ? -4 : undefined} />
                </div>
                <div style={{
                  position: 'absolute', borderRadius: 2, width: 52, height: 4,
                  backgroundColor: '#1a1a2e', transition: 'all 0.2s ease',
                  left: passwordPeeking ? 44 : 44 + (yp.faceX || 0),
                  top: passwordPeeking ? 88 : 88 + (yp.faceY || 0),
                }} />
              </div>
            </div>
          </div>

          {/* Tagline + badge */}
          <div style={{ position: 'relative', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span className="ms-su-badge">
                <span className="ms-su-badge-dot" />
                Join 10,000+ smart movers
              </span>
            </div>
            <p style={{ fontSize: 14, opacity: 0.65, lineHeight: 1.7, maxWidth: 340, fontWeight: 500 }}>
              Create your free account and start your AI-powered relocation journey today.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — Signup Form
        ══════════════════════════════════════════ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', background: '#EEEEEE', minHeight: '100vh',
          overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 440, paddingTop: 16, paddingBottom: 24, animation: 'ms-su-fadeUp 0.7s ease both' }}>

            {/* Mobile logo */}
            <Link
              to="/"
              className="ms-su-mobile-logo"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28, textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              aria-label="Go to MoveSmart homepage"
            >
              <div className="ms-su-logo-ring">
                <img src="/smart-Building.png" alt="MoveSmart" />
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#222831' }}>
                Move<span style={{ color: '#00ADB5' }}>Smart</span>
              </span>
            </Link>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{
                fontSize: 28, fontWeight: 800, color: '#222831',
                letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1.15,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Create your account ✨
              </h1>
              <p style={{ fontSize: 14, color: '#393E46', fontWeight: 500 }}>
                Join MoveSmart and find your perfect city
              </p>
            </div>

            {/* Form card */}
            <div className="ms-su-card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Full Name */}
                <div>
                  <label htmlFor="su-name" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#222831', marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Full name
                  </label>
                  <input
                    id="su-name" type="text" placeholder="Alex Johnson"
                    value={name} autoComplete="name" required disabled={loading}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className="ms-su-field"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="su-email" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#222831', marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Email address
                  </label>
                  <input
                    id="su-email" type="email" placeholder="you@example.com"
                    value={email} autoComplete="email" required disabled={loading}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className="ms-su-field"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="su-password" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#222831', marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="su-password" type={showPw ? 'text' : 'password'}
                      placeholder="Min. 8 characters" value={password}
                      required disabled={loading}
                      onChange={e => setPassword(e.target.value)}
                      className="ms-su-field" style={{ paddingRight: 44 }}
                    />
                    <button type="button" className="ms-su-pw-toggle"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff /> : <EyeOn />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 4, borderRadius: 4,
                            background: i <= strength.score ? strength.color : '#E5E7EB',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="su-confirm" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#222831', marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Confirm password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="su-confirm" type={showCPw ? 'text' : 'password'}
                      placeholder="Re-enter password" value={confirm}
                      required disabled={loading}
                      onChange={e => setConfirm(e.target.value)}
                      className="ms-su-field"
                      style={{
                        paddingRight: 44,
                        borderColor: confirm && confirm !== password ? '#EF4444' : confirm && confirm === password ? '#22C55E' : '#D9D9D9',
                        boxShadow: confirm && confirm === password ? '0 0 0 3px rgba(34,197,94,0.15)' : 'none',
                      }}
                    />
                    <button type="button" className="ms-su-pw-toggle"
                      aria-label={showCPw ? 'Hide password' : 'Show password'}
                      onClick={() => setShowCPw(v => !v)}>
                      {showCPw ? <EyeOff /> : <EyeOn />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4, fontWeight: 600 }}>Passwords do not match</p>
                  )}
                </div>

                {/* Role selector */}
                {/* <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#222831', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    I am a…
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        className={`ms-su-role-card${role === r.value ? ' active' : ''}`}
                        onClick={() => setSelectedRole(r.value)}
                        disabled={loading}
                      >
                        {/* radio dot */}
                {/* <div style={{
                          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${role === r.value ? '#00ADB5' : '#D9D9D9'}`,
                          background: role === r.value ? '#00ADB5' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.18s',
                        }}>
                          {role === r.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#222831', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{r.label}</div>
                          <div style={{ fontSize: 10, color: '#393E46', fontWeight: 500, marginTop: 1 }}>{r.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div> */}

                {/* Terms */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
                  <input
                    type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
                    style={{ accentColor: '#00ADB5', width: 16, height: 16, marginTop: 2, cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: '#393E46', fontWeight: 500, lineHeight: 1.5 }}>
                    I agree to MoveSmart's{' '}
                    <a href="/terms" style={{ color: '#00ADB5', fontWeight: 700, textDecoration: 'none' }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" style={{ color: '#00ADB5', fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</a>
                  </span>
                </label>

                {/* Error */}
                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '12px 14px', borderRadius: 10, fontSize: 13,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
                    color: '#b91c1c', animation: 'ms-su-fadeUp 0.3s ease',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    <svg style={{ flexShrink: 0, marginTop: 1 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading} className="ms-su-btn-primary">
                  {loading ? (
                    <>
                      <svg className="ms-su-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                        <path fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Creating account…
                    </>
                  ) : 'Create account →'}
                </button>
              </form>

              {/* Divider */}
              <div className="ms-su-divider">
                <div className="ms-su-divider-line" />
                <span className="ms-su-divider-text">or</span>
                <div className="ms-su-divider-line" />
              </div>

              {/* Google */}
              <button type="button" className="ms-su-btn-google"
                onClick={() => alert('Google OAuth — configure GOOGLE_CLIENT_ID in your backend .env')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>
            </div>

            {/* Sign in link */}
            <p style={{ textAlign: 'center', fontSize: 14, color: '#393E46', marginTop: 22, fontWeight: 500 }}>
              Already have an account?{' '}
              <Link to="/login" className="ms-su-login-link">Sign in</Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}