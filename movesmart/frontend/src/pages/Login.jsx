

import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, useAuth } from '../context/AuthContext';
import { googleAuthUser } from '../api/auth';
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
   Pupil — bare dark dot (for orange & yellow bodies)
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
   Character position from mouse — bodySkew + faceX/Y
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
   Main Login Page
───────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  /* form */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  /* mouse */
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);

  /* character animation flags */
  const [purpleBlink, setPurpleBlink] = useState(false);
  const [blackBlink, setBlackBlink] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lookingAtEachOther, setLookingAtEachOther] = useState(false);
  const [peekActive, setPeekActive] = useState(false);

  /* character refs */
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

  /* look at each other briefly on typing */
  useEffect(() => {
    if (!isTyping) { setLookingAtEachOther(false); return; }
    setLookingAtEachOther(true);
    const t = setTimeout(() => setLookingAtEachOther(false), 800);
    return () => clearTimeout(t);
  }, [isTyping]);

  /* purple peek when password is visible */
  useEffect(() => {
    if (!showPw || !password) { setPeekActive(false); return; }
    let t;
    const go = () => { t = setTimeout(() => { setPeekActive(true); setTimeout(() => { setPeekActive(false); go(); }, 800); }, Math.random() * 3000 + 2000); };
    go(); return () => clearTimeout(t);
  }, [showPw, password]);

  /* derived */
  const passwordHidden = password.length > 0 && !showPw;
  const passwordPeeking = password.length > 0 && showPw;

  /* character positions */
  const pp = useCharPos(purpleRef, mx, my);
  const bp = useCharPos(blackRef, mx, my);
  const op = useCharPos(orangeRef, mx, my);
  const yp = useCharPos(yellowRef, mx, my);


  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    
    const res = await login(email, password);
    if (res.success) {
      const loggedUser = res.user;
      
      if (!loggedUser.role) {
        navigate('/choose-your-journey');
      } else if (!loggedUser.role_profile || Object.keys(loggedUser.role_profile).length === 0) {
        navigate('/onboarding');
      } else {
        if (loggedUser.role === 'admin') navigate('/admin');
        else if (loggedUser.role === 'property_owner') navigate('/owner');
        else if (loggedUser.role === 'company_hr') navigate('/company');
        else navigate('/dashboard');
      }
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  /* Google Sign-In Handler */
  const handleGoogleAuth = async () => {
    let googleEmail = prompt('Enter your Google Account email to sign in with Google:', 'user.google@gmail.com');
    if (!googleEmail || !googleEmail.includes('@')) return;

    try {
      const data = await googleAuthUser({
        email: googleEmail.trim(),
        google_id: `google_${Date.now()}`,
        name: googleEmail.split('@')[0],
        role: 'seeker'
      });
      login(data.access, data.refresh, data.user);
      if (data.user?.role === 'owner' || data.user?.role === 'broker') {
        navigate('/owner-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
    }
  };

  /* auto-fill demo */
  const fillDemo = (em, pw) => { setEmail(em); setPassword(pw); setError(''); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .ms-login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
          background: #EEEEEE;
        }
        @media (min-width: 1024px) {
          .ms-login-root { grid-template-columns: 1fr 1fr; }
          .ms-login-left { display: flex !important; }
          .ms-mobile-logo { display: none !important; }
        }

        @keyframes ms-fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ms-spin { to { transform:rotate(360deg); } }
        @keyframes ms-aurora {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes ms-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }

        .ms-login-left {
          display: none;
          position: relative;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.75rem 3rem;
          color: white;
          overflow: hidden;
          /* same aurora-mesh as FinalCTA — dark teal + navy gradient */
          background: linear-gradient(135deg, #00ADB5 0%, #222831 45%, #393E46 75%, #00ADB5 100%);
          background-size: 400% 400%;
          animation: ms-aurora 12s ease infinite;
        }

        /* grid overlay */
        .ms-login-left::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .ms-logo-ring {
          width: 44px; height: 44px; border-radius: 50%; padding: 2px;
          background: linear-gradient(135deg, #00ADB5, #222831, #00ADB5);
          box-shadow: 0 4px 16px rgba(0,173,181,0.35);
          flex-shrink: 0;
        }
        .ms-logo-ring img {
          width: 100%; height: 100%; border-radius: 50%;
          object-fit: cover; background: white; display: block;
        }

        .ms-field {
          width: 100%; height: 48px; border-radius: 12px;
          border: 1.5px solid #D9D9D9; padding: 0 14px;
          font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          color: #222831; background: white; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .ms-field:focus {
          border-color: #00ADB5;
          box-shadow: 0 0 0 3px rgba(0,173,181,0.18);
        }
        .ms-field:disabled { opacity: 0.6; cursor: not-allowed; }

        .ms-btn-primary {
          width: 100%; height: 48px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #00ADB5, #008C93);
          color: white; font-size: 15px; font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(0,173,181,0.3);
          transition: all 0.2s;
        }
        .ms-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #00bfc8, #00ADB5);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,173,181,0.4);
        }
        .ms-btn-primary:active { transform: translateY(0); }
        .ms-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .ms-btn-google {
          width: 100%; height: 48px; border-radius: 12px;
          background: white; border: 1.5px solid #D9D9D9;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: 14px; font-weight: 700; color: #222831; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
        }
        .ms-btn-google:hover { background: #f4f4f4; border-color: #bbb; }

        .ms-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #393E46; padding: 4px; transition: color 0.15s; line-height: 1;
        }
        .ms-pw-toggle:hover { color: #00ADB5; }

        .ms-forgot { font-size: 13px; font-weight: 700; color: #00ADB5; text-decoration: none; transition: opacity 0.15s; }
        .ms-forgot:hover { opacity: 0.75; }

        .ms-signup-link { font-weight: 800; color: #222831; text-decoration: none; transition: color 0.15s; }
        .ms-signup-link:hover { color: #00ADB5; }

        .ms-demo-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 5px 8px; font-size: 11px; color: #393E46;
          border-radius: 7px; cursor: pointer; transition: background 0.15s;
        }
        .ms-demo-row:hover { background: rgba(0,173,181,0.08); }

        .ms-spinner { animation: ms-spin 0.8s linear infinite; }

        .ms-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          padding: 28px 28px 24px;
        }

        .ms-divider { position:relative; margin:20px 0; display:flex; align-items:center; gap:12px; }
        .ms-divider-line { flex:1; height:1px; background:#D9D9D9; }
        .ms-divider-text { font-size:11px; font-weight:700; color:#393E46; letter-spacing:0.08em; text-transform:uppercase; }

        .ms-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 99px;
          background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: white;
        }
        .ms-badge-dot { width:7px; height:7px; border-radius:50%; background:#00ADB5; }

        .ms-float-card {
          background: rgba(255,255,255,0.88); backdrop-filter:blur(16px);
          border:1px solid rgba(255,255,255,0.8); border-radius:14px;
          padding:12px 16px; box-shadow:0 8px 32px rgba(0,0,0,0.12);
          position:absolute; min-width:200px;
          animation: ms-float 4s ease-in-out infinite;
        }
      `}</style>

      <div className="ms-login-root">

        {/* ══════════════════════════════════════════
            LEFT — Aurora + Characters + Branding
        ══════════════════════════════════════════ */}
        <div className="ms-login-left">
          {/* ambient glow blobs */}
          <div style={{ position: 'absolute', top: '15%', right: '20%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(0,173,181,0.18)', filter: 'blur(70px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

          {/* ── Logo — identical to HeroNavbar ── */}
          <Link
            to="/"
            style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', gap: 14, animation: 'ms-fadeUp 0.6s ease both', textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            aria-label="Go to MoveSmart homepage"
          >
            <div className="ms-logo-ring">
              <img src="/smart-Building.png" alt="MoveSmart" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Move<span style={{ color: '#00ADB5' }}>Smart</span>
              </div>
              <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 600, marginTop: 2 }}>AI City Relocation Marketplace</div>
            </div>
          </Link>

          {/* ── Characters stage ── */}
          <div style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 460 }}>
            <div style={{ position: 'relative', width: 520, height: 390 }}>

              {/* Purple — tallest back layer */}
              <div ref={purpleRef} style={{
                position: 'absolute', bottom: 0, left: 60,
                width: 180, height: (isTyping || passwordHidden) ? 440 : 400,
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
                position: 'absolute', bottom: 0, left: 230,
                width: 120, height: 310,
                backgroundColor: '#1a1a2e', borderRadius: '8px 8px 0 0',
                zIndex: 2, transition: 'all 0.7s ease',
                transform: passwordPeeking
                  ? 'skewX(0deg)'
                  : lookingAtEachOther
                    ? `skewX(${(bp.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || passwordHidden)
                      ? `skewX(${(bp.bodySkew || 0) * 1.5}deg)`
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
                position: 'absolute', bottom: 0, left: 0,
                width: 240, height: 200,
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
                position: 'absolute', bottom: 0, left: 300,
                width: 140, height: 230,
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
                {/* mouth */}
                <div style={{
                  position: 'absolute', borderRadius: 2, width: 52, height: 4,
                  backgroundColor: '#1a1a2e', transition: 'all 0.2s ease',
                  left: passwordPeeking ? 44 : 44 + (yp.faceX || 0),
                  top: passwordPeeking ? 88 : 88 + (yp.faceY || 0),
                }} />
              </div>

            </div>
          </div>

          {/* ── Floating info card ── */}
          <div style={{ position: 'relative', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span className="ms-badge">
                <span className="ms-badge-dot" />
                Your move, AI-powered
              </span>
            </div>
            <p style={{ fontSize: 14, opacity: 0.65, lineHeight: 1.7, maxWidth: 340, fontWeight: 500 }}>
              Find your perfect city, connect with verified brokers, and relocate with total confidence.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — Login Form
        ══════════════════════════════════════════ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', background: '#EEEEEE', minHeight: '100vh', position: 'relative',
        }}>
          <div style={{ width: '100%', maxWidth: 428, animation: 'ms-fadeUp 0.7s ease both' }}>

            {/* Mobile logo — shown only on small screens */}
            <Link
              to="/"
              className="ms-mobile-logo"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32, textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              aria-label="Go to MoveSmart homepage"
            >
              <div className="ms-logo-ring">
                <img src="/smart-Building.png" alt="MoveSmart" />
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#222831' }}>
                Move<span style={{ color: '#00ADB5' }}>Smart</span>
              </span>
            </Link>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h1 style={{
                fontSize: 30, fontWeight: 800, color: '#222831',
                letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1.15,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Welcome back 👋
              </h1>
              <p style={{ fontSize: 14, color: '#393E46', fontWeight: 500 }}>
                Sign in to your MoveSmart account
              </p>
            </div>

            {/* Form card — homepage floating card style */}
            <div className="ms-card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Email */}
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#222831', marginBottom: 7, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Email address
                  </label>
                  <input
                    id="email" type="email" placeholder="you@example.com"
                    value={email} autoComplete="email" required disabled={loading}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className="ms-field"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#222831', marginBottom: 7, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password" type={showPw ? 'text' : 'password'}
                      placeholder="••••••••" value={password} required disabled={loading}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ms-field" style={{ paddingRight: 44 }}
                    />
                    <button type="button" className="ms-pw-toggle"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPw(v => !v)}>
                      {showPw ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                      style={{ accentColor: '#00ADB5', width: 16, height: 16, cursor: 'pointer' }} />
                    <span style={{ fontSize: 13, color: '#393E46', fontWeight: 500 }}>Remember for 30 days</span>
                  </label>
                  <Link to="/forgot-password" className="ms-forgot">Forgot password?</Link>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '12px 14px', borderRadius: 10, fontSize: 13,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
                    color: '#b91c1c', animation: 'ms-fadeUp 0.3s ease',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    <svg style={{ flexShrink: 0, marginTop: 1 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading} className="ms-btn-primary">
                  {loading ? (
                    <>
                      <svg className="ms-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                        <path fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : 'Sign in'}
                </button>
              </form>

            </div>

            {/* Sign up link */}
            <p style={{ textAlign: 'center', fontSize: 14, color: '#393E46', marginTop: 22, fontWeight: 500 }}>
              Don't have an account?{' '}
              <Link to="/signup" className="ms-signup-link">Sign up free</Link>
            </p>

            {/* Demo credentials — click row to auto fill */}
            <div style={{
              marginTop: 20, padding: '14px 16px', borderRadius: 14,
              background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)',
              border: '1.5px dashed rgba(0,173,181,0.3)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#222831', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#00ADB5' }} />
                Demo credentials — click any row to fill
              </p>
              {[
                { label: 'Customer 1', em: 'customer@gmail.com', pw: 'Customer@123' },
                { label: 'Customer 2', em: 'customer2@gmail.com', pw: 'Customer@123' },
                { label: 'Landlord', em: 'landlord@gmail.com', pw: 'Landlord@123' },
              ].map(({ label, em, pw }) => (
                <div key={label} className="ms-demo-row" onClick={() => fillDemo(em, pw)}>
                  <span style={{ fontWeight: 800, color: '#222831', minWidth: 85, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
                  <span style={{ fontFamily: 'monospace', opacity: 0.75, fontSize: 10 }}>{em}</span>
                  <span style={{ fontFamily: 'monospace', opacity: 0.55, fontSize: 10, marginLeft: 6 }}>{pw}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
