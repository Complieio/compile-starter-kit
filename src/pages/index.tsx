import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index(): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const signupFormRef = useRef<HTMLFormElement | null>(null);
  const loginFormRef = useRef<HTMLFormElement | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  function openModal() {
    setModalOpen(true);
    setActiveTab("signup");
    setTimeout(() => {
      nameRef.current?.focus();
    }, 80);
  }

  function closeModal() {
    setModalOpen(false);
  }

  useEffect(() => {
    const shown = localStorage.getItem("complieModalShown");
    if (shown !== "true") {
      const t = setTimeout(() => {
        openModal();
        localStorage.setItem("complieModalShown", "true");
      }, 1000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
      if (e.key === "Enter") {
        const active = document.activeElement as Element | null;
        if (signupFormRef.current?.contains(active) && !signupDisabled()) {
          handleSignupClick();
        }
        if (loginFormRef.current?.contains(active) && !loginDisabled()) {
          handleLoginClick();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [name, email, password, loginEmail, loginPassword]);

  function signupDisabled() {
    return !(name.trim().length > 1 && email.includes("@") && password.length >= 6) || loadingSignup;
  }

  function loginDisabled() {
    return !(loginEmail.includes("@") && loginPassword.length >= 6) || loadingLogin;
  }

  async function handleSignupClick() {
    if (!name.trim() || !email || !password) return;
    
    setLoadingSignup(true);
    const { error } = await signUp(email, password, { full_name: name });
    setLoadingSignup(false);
    
    if (!error) {
      closeModal();
      // User will be redirected after email verification
    }
  }

  async function handleLoginClick() {
    if (!loginEmail || !loginPassword) return;
    
    setLoadingLogin(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoadingLogin(false);
    
    if (!error) {
      closeModal();
      navigate('/dashboard');
    }
  }

  async function handleGoogleAuth() {
    await signInWithGoogle();
  }

  function onOverlayClick(e: React.MouseEvent) {
    if (e.target === modalRef.current) closeModal();
  }

  return (
    <div>
      <style>{`:root{--accent-a:#000000;--accent-b:#3367FF;--accent-grad:linear-gradient(90deg,var(--accent-a),var(--accent-b));--surface:#ffffff;--muted:#f5f5f5;--text:#1a1a1a;--muted-border:#e6e6e6}
    *{box-sizing:border-box}
    html,body{height:100%}
    body{margin:0;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;background-color:var(--muted);color:var(--text);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
    .navbar{display:flex;justify-content:space-between;align-items:center;padding:16px 40px;background:var(--surface);box-shadow:0 2px 5px rgba(0,0,0,0.05);position:sticky;top:0;z-index:100}
    .logo{font-size:24px;font-weight:900;color:#000;letter-spacing:0.5px;cursor:pointer}
    .nav-links{display:flex;gap:36px;font-size:16px;font-weight:600}
    .nav-links a{text-decoration:none;color:#000}
    .cta{background:var(--accent-grad);color:#fff;padding:12px 28px;border-radius:50px;font-weight:600;font-size:16px;text-decoration:none;cursor:pointer;border:none}
    .hero{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:110px 20px;background:var(--surface)}
    .hero h1{font-size:40px;line-height:1.12;margin:0 0 14px 0}
    .hero p{font-size:15px;opacity:0.82;margin:0 0 32px 0;max-width:760px}
    .cta-btn{background:var(--accent-grad);color:#fff;font-weight:700;font-size:17px;padding:14px 24px;border-radius:999px;text-decoration:none;cursor:pointer;border:none;transition:opacity .12s ease}
    .cta-btn:hover{opacity:0.88}
    .mini-value{display:flex;justify-content:center;text-align:left;background:var(--muted);padding:56px 18px;gap:20px;flex-wrap:wrap}
    .card{background:var(--surface);max-width:340px;padding:20px;border-radius:12px;box-shadow:0 8px 30px rgba(7,22,11,0.04);display:flex;flex-direction:column;gap:10px}
    .card .title{font-size:16px;font-weight:800}
    .card p{margin:0;font-size:13.5px;opacity:0.78}
    footer{background:var(--surface);text-align:center;padding:22px;font-size:13.5px;opacity:0.85;display:flex;justify-content:center;gap:20px;flex-wrap:wrap}
    footer a{text-decoration:none;color:#000;font-weight:500}
    .popup{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.28);backdrop-filter:blur(1.5px);justify-content:center;align-items:center;z-index:1200;padding:20px}
    .popup.show{display:flex}
    .popup-content{background:#fff;border-radius:16px;box-shadow:0 28px 80px rgba(8,20,12,0.18);max-width:560px;width:100%;padding:56px 40px;display:flex;flex-direction:column;gap:12px;position:relative;min-width:320px}
    .popup-icon{display:flex;justify-content:center;align-items:center;width:48px;height:48px;margin-bottom:2px;align-self:center;opacity:0.55;background:transparent;box-shadow:none}
    .popup-icon svg{width:48px;height:48px}
    .popup-content h3{margin:0;font-size:26px;font-weight:800;color:#000;text-align:center}
    .tabs{display:flex;gap:36px;justify-content:center;margin-top:10px;border-bottom:1px solid var(--muted-border);padding-bottom:8px}
    .tab{font-weight:800;font-size:15px;cursor:pointer;color:#6b6b6b;padding:8px 4px;position:relative}
    .tab.active{color:#000}
    .tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-12px;height:3px;border-radius:3px;background:var(--accent-grad)}
    .form{display:flex;flex-direction:column;gap:12px;margin-top:8px}
    .input-wrap{position:relative}
    .input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:18px;height:18px;opacity:0.9}
    .form input{width:100%;padding:12px 14px 12px 42px;border-radius:10px;border:1px solid var(--muted-border);font-size:15px;outline:none;transition:border-color .12s ease,box-shadow .08s ease}
    .form input:focus{border-color:#000;box-shadow:none}
    .submit{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent-grad);color:#fff;padding:12px 14px;border-radius:10px;border:none;font-weight:800;cursor:pointer;font-size:15px;transition:opacity .12s ease}
    .submit:hover{opacity:0.86}
    .submit:active{opacity:0.86}
    .submit[disabled]{opacity:0.62;cursor:not-allowed}
    .spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.45);border-top-color:rgba(255,255,255,0.95);animation:spin .9s linear infinite;display:inline-block}
    @keyframes spin{to{transform:rotate(360deg)}}
    .divider{display:flex;align-items:center;gap:12px;margin:8px 0;color:#777;font-size:13px}
    .divider:before,.divider:after{content:"";flex:1;height:1px;background:#eaeaea}
    .or-pill{padding:4px 10px;border-radius:999px;background:#fafafa;border:1px solid #eee;font-weight:700;font-size:12px}
    .social-btn{padding:12px;border-radius:10px;border:1px solid #e6e6e6;background:#fff;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;font-weight:700;font-size:14px;transition:background .12s ease}
    .social-btn:hover{background:#fbfbfb}
    .google-logo{width:18px;height:18px}
    .close-btn{position:absolute;top:14px;right:14px;font-size:18px;font-weight:700;color:#444;cursor:pointer;background:#f3f3f3;width:34px;height:34px;display:flex;justify-content:center;align-items:center;border-radius:50%;border:0}
    .close-btn:hover{background:#eaeaea}
    .legal{font-size:12px;color:#888;text-align:center;margin-top:6px}
    @media (max-width:640px){.popup-content{padding:36px 20px;border-radius:12px}.popup-icon svg{width:40px;height:40px}}`}</style>

      <nav className="navbar">
        <div className="logo" onClick={() => (window.location.href = "/")}>COMPLIE</div>
        <div className="nav-links">
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <button className="cta" onClick={(e) => { e.preventDefault(); openModal(); }}>Try Complie Now</button>
      </nav>

      <section className="hero">
        <h1>Stay on top of your<br />projects effortlessly</h1>
        <p>Your all-in-one tool for staying organized, managing clients and projects, tracking deadlines, and generating reports in a simple platform.</p>
        <button className="cta-btn" onClick={(e) => { e.preventDefault(); openModal(); }}>Start Tracking Today</button>
      </section>

      <section className="mini-value">
        <div className="card"><div className="title">Client & Project Tracking</div><p>Keep all your client info and projects in one place with clear status and deadlines.</p></div>
        <div className="card"><div className="title">Checklists & Deadlines</div><p>Create simplified checklists and automatic reminders so nothing slips through.</p></div>
        <div className="card"><div className="title">Notes & Documents</div><p>Attach notes, upload documents and keep everything linked to the right client or project.</p></div>
      </section>

      <footer>
        <Link to="/privacypolicy">Privacy Policy</Link>
        <Link to="/refundpolicy">Refund Policy</Link>
        <Link to="/termsofservice">Terms of Service</Link>
      </footer>

      <div ref={modalRef} className={`popup ${modalOpen ? "show" : ""}`} id="authModal" onClick={onOverlayClick} role="presentation">
        <div className="popup-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button className="close-btn" id="closeAuth" aria-label="Close" onClick={closeModal}>×</button>
          <div className="popup-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g stroke="#000" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="16" r="6" />
                <path d="M8 36c2.6-6 9.2-10 16-10s13.4 4 16 10" />
              </g>
              <g stroke="#000" strokeWidth="1.8" strokeLinecap="round">
                <line x1="36.5" y1="11.5" x2="36.5" y2="17.5" />
                <line x1="33.5" y1="14.5" x2="39.5" y2="14.5" />
              </g>
            </svg>
          </div>
          <h3 id="modalTitle">Welcome to Complie</h3>

          <div className="tabs" role="tablist" aria-label="Auth Tabs">
            <div className={`tab ${activeTab === "signup" ? "active" : ""}`} id="tabSignup" role="tab" tabIndex={0} aria-selected={activeTab === "signup"} onClick={() => setActiveTab("signup")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveTab("signup"); }}>Create account</div>
            <div className={`tab ${activeTab === "login" ? "active" : ""}`} id="tabLogin" role="tab" tabIndex={0} aria-selected={activeTab === "login"} onClick={() => setActiveTab("login")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveTab("login"); }}>Login</div>
          </div>

          <form ref={signupFormRef} id="signupForm" className="form" autoComplete="on" noValidate style={{ display: activeTab === "signup" ? "flex" : "none" }}>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="8" r="3" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 20c1.8-3.2 5-5 7-5s5.2 1.8 7 5" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input ref={nameRef} id="name" name="name" type="text" placeholder="Full name" aria-label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.5 7.5l8.5 6 8.5-6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="email" name="email" type="email" placeholder="Email" aria-label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="password" name="password" type="password" placeholder="Create password" aria-label="Create password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="button" id="signupBtn" className="submit" disabled={signupDisabled()} onClick={handleSignupClick}>
              {loadingSignup ? <span className="spinner" aria-hidden="true" /> : <span id="signupLabel">Create account</span>}
            </button>
            <div className="divider"><span className="or-pill">OR</span></div>
            <div className="social-btn" id="googleSignup" onClick={handleGoogleAuth}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" />
              Continue with Google
            </div>
            <div className="legal">By creating an account you agree to our <Link to="/termsofservice">Terms</Link> and <Link to="/privacypolicy">Privacy Policy</Link>.</div>
          </form>

          <form ref={loginFormRef} id="loginForm" className="form" autoComplete="on" noValidate style={{ display: activeTab === "login" ? "flex" : "none" }}>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.5 7.5l8.5 6 8.5-6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="loginEmail" name="loginEmail" type="email" placeholder="Email" aria-label="Email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            </div>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="loginPassword" name="loginPassword" type="password" placeholder="Password" aria-label="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
            <button type="button" id="loginBtn" className="submit" disabled={loginDisabled()} onClick={handleLoginClick}>
              {loadingLogin ? <span className="spinner" aria-hidden="true" /> : <span id="loginLabel">Log in</span>}
            </button>
            <div className="divider"><span className="or-pill">OR</span></div>
            <div className="social-btn" id="googleLogin" onClick={handleGoogleAuth}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" />
              Continue with Google
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
