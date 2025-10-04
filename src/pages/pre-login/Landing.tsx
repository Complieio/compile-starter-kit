import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function CompliePage(): JSX.Element {
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
    <div className="min-h-screen bg-background">
      <nav className="flex justify-between items-center px-10 py-4 bg-background shadow-sm sticky top-0 z-50">
        <Link to="/" className="text-2xl font-black text-foreground tracking-wide">COMPLIE</Link>
        <div className="hidden md:flex gap-9 text-base font-semibold">
          <Link to="/features" className="text-foreground hover:text-primary transition-colors">Features</Link>
          <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">Pricing</Link>
          <Link to="/faq" className="text-foreground hover:text-primary transition-colors">FAQ</Link>
        </div>
        <button 
          className="bg-gradient-to-r from-complie-primary to-complie-accent text-white px-7 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          onClick={(e) => { e.preventDefault(); openModal(); }}
        >
          Try Complie Now
        </button>
      </nav>

      <section className="flex flex-col justify-center items-center text-center py-28 px-5 bg-background">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-foreground leading-tight">
          Stay on top of your freelance<br />projects effortlessly
        </h1>
        <p className="text-base opacity-80 mb-8 max-w-3xl text-muted-foreground">
          Your all-in-one tool for staying organized, managing clients and projects, tracking deadlines, and generating reports in a simple platform.
        </p>
        <button 
          className="bg-gradient-to-r from-complie-accent to-complie-primary text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={(e) => { e.preventDefault(); openModal(); }}
        >
          Start Tracking Today
        </button>
      </section>

      <section className="flex justify-center text-left bg-muted py-14 px-5 gap-5 flex-wrap">
        <div className="bg-card max-w-sm p-5 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="text-base font-extrabold text-card-foreground">Client & Project Tracking</div>
          <p className="m-0 text-sm opacity-75 text-muted-foreground">Keep all your client info and projects in one place with clear status and deadlines.</p>
        </div>
        <div className="bg-card max-w-sm p-5 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="text-base font-extrabold text-card-foreground">Checklists & Deadlines</div>
          <p className="m-0 text-sm opacity-75 text-muted-foreground">Create simplified checklists and automatic reminders so nothing slips through.</p>
        </div>
        <div className="bg-card max-w-sm p-5 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="text-base font-extrabold text-card-foreground">Notes & Documents</div>
          <p className="m-0 text-sm opacity-75 text-muted-foreground">Attach notes, upload documents and keep everything linked to the right client or project.</p>
        </div>
      </section>

      <footer className="bg-background text-center py-6 text-sm opacity-80 flex justify-center gap-6 flex-wrap">
        <Link to="/privacypolicy" className="text-foreground font-medium hover:text-primary transition-colors">Privacy Policy</Link>
        <Link to="/refundpolicy" className="text-foreground font-medium hover:text-primary transition-colors">Refund Policy</Link>
        <Link to="/termsofservice" className="text-foreground font-medium hover:text-primary transition-colors">Terms of Service</Link>
      </footer>

      <nav className="navbar">
        <Link to="/" className="logo">COMPLIE</Link>
        <div className="nav-links">
          <Link to="/pre-login/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <button className="cta" onClick={(e) => { e.preventDefault(); openModal(); }}>Try Complie Now</button>
      </nav>

      <section className="hero">
        <h1>Stay on top of your freelance<br />projects effortlessly</h1>
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-5">
          <div className="bg-background rounded-2xl shadow-2xl max-w-lg w-full p-14 relative">
            <button 
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground font-bold text-lg transition-colors"
              onClick={closeModal}
            >
              ×
            </button>
            
            <div className="flex justify-center mb-3">
              <svg className="w-12 h-12 text-muted-foreground/60" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <g stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="24" cy="16" r="6" />
                  <path d="M8 36c2.6-6 9.2-10 16-10s13.4 4 16 10" />
                </g>
                <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="36.5" y1="11.5" x2="36.5" y2="17.5" />
                  <line x1="33.5" y1="14.5" x2="39.5" y2="14.5" />
                </g>
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-center text-foreground mb-4">Welcome to Complie</h3>
            <div className="flex gap-9 justify-center mb-4 border-b border-border pb-2">
              <button 
                className={`font-extrabold text-sm py-2 px-1 relative transition-colors ${
                  activeTab === "signup" ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab("signup")}
              >
                Create account
                {activeTab === "signup" && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-complie-primary to-complie-accent rounded-full" />
                )}
              </button>
              <button 
                className={`font-extrabold text-sm py-2 px-1 relative transition-colors ${
                  activeTab === "login" ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab("login")}
              >
                Login
                {activeTab === "login" && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-complie-primary to-complie-accent rounded-full" />
                )}
              </button>
            </div>

            {activeTab === "signup" && (
              <form className="space-y-3 mt-2" onSubmit={(e) => { e.preventDefault(); if (!signupDisabled()) handleSignupClick(); }}>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 20c1.8-3.2 5-5 7-5s5.2 1.8 7 5" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input 
                    ref={nameRef}
                    className="w-full pl-10 pr-3 py-3 border border-border rounded-lg text-sm focus:border-foreground focus:outline-none transition-colors bg-background"
                    type="text" 
                    placeholder="Full name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.5 7.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input 
                    className="w-full pl-10 pr-3 py-3 border border-border rounded-lg text-sm focus:border-foreground focus:outline-none transition-colors bg-background"
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input 
                    className="w-full pl-10 pr-3 py-3 border border-border rounded-lg text-sm focus:border-foreground focus:outline-none transition-colors bg-background"
                    type="password" 
                    placeholder="Create password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-complie-primary to-complie-accent text-white py-3 px-4 rounded-lg font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={signupDisabled()}
                >
                  {loadingSignup ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Create account'
                  )}
                </button>
                <div className="flex items-center gap-3 my-2 text-muted-foreground text-xs">
                  <div className="flex-1 h-px bg-muted" />
                  <span className="px-2.5 py-1 bg-muted rounded-full font-bold text-xs">OR</span>
                  <div className="flex-1 h-px bg-muted" />
                </div>
                <button 
                  type="button"
                  className="w-full py-3 px-4 border border-border rounded-lg bg-background flex items-center justify-center gap-2.5 font-bold text-sm hover:bg-muted/50 transition-colors"
                  onClick={handleGoogleAuth}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google logo" />
                  Continue with Google
                </button>
              </form>
            )}

            {activeTab === "login" && (
              <form className="space-y-3 mt-2" onSubmit={(e) => { e.preventDefault(); if (!loginDisabled()) handleLoginClick(); }}>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.5 7.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input 
                    className="w-full pl-10 pr-3 py-3 border border-border rounded-lg text-sm focus:border-foreground focus:outline-none transition-colors bg-background"
                    type="email" 
                    placeholder="Email" 
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)} 
                  />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input 
                    className="w-full pl-10 pr-3 py-3 border border-border rounded-lg text-sm focus:border-foreground focus:outline-none transition-colors bg-background"
                    type="password" 
                    placeholder="Password" 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-complie-primary to-complie-accent text-white py-3 px-4 rounded-lg font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loginDisabled()}
                >
                  {loadingLogin ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Log in'
                  )}
                </button>
                <div className="flex items-center gap-3 my-2 text-muted-foreground text-xs">
                  <div className="flex-1 h-px bg-muted" />
                  <span className="px-2.5 py-1 bg-muted rounded-full font-bold text-xs">OR</span>
                  <div className="flex-1 h-px bg-muted" />
                </div>
                <button 
                  type="button"
                  className="w-full py-3 px-4 border border-border rounded-lg bg-background flex items-center justify-center gap-2.5 font-bold text-sm hover:bg-muted/50 transition-colors"
                  onClick={handleGoogleAuth}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google logo" />
                  Continue with Google
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

