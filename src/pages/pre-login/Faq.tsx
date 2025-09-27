import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function FAQPage(): JSX.Element {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
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

  const faqList = [
    { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel at any time. Your account will remain active until the end of your billing cycle and you won’t be charged again." },
    { q: "What’s included in the free trial?", a: "The free trial gives full access to all core features. No credit card required." },
    { q: "What happens when I hit my client or project limit?", a: "You can still access existing clients or projects. To add new ones, upgrade or delete old ones to free space." },
    { q: "Can I export reports for clients or audits?", a: "Reports can be exported in a shareable format to deliver directly to clients or for audits." },
    { q: "Can I add multiple clients to one project?", a: "Not currently. Each project is tied to a single client for clear data and reporting." },
    { q: "Can I import existing checklists from Excel or CSV?", a: "Yes, you can import data from Excel or CSV files to save time and avoid manual setup." }
  ];

  useEffect(() => {
    const shown = localStorage.getItem("complieModalShown");
    if (shown !== "true") {
      const t = setTimeout(() => { setAuthOpen(true); localStorage.setItem("complieModalShown", "true"); }, 1000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAuthOpen(false);
      if (e.key === "Enter") {
        const active = document.activeElement as Element | null;
        if (signupFormRef.current?.contains(active) && isSignupValid() && !loadingSignup) handleSignup();
        if (loginFormRef.current?.contains(active) && isLoginValid() && !loadingLogin) handleLogin();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [signupData, loginData, loadingSignup, loadingLogin]);

  function toggleItem(i: number) {
    setOpenItems(prev => ({ ...prev, [i]: !prev[i] }));
  }

  async function handleGoogleAuth() {
    await signInWithGoogle();
  }

  function isSignupValid() {
    return signupData.name.trim().length > 1 && signupData.email.includes("@") && signupData.password.length >= 6;
  }

  function isLoginValid() {
    return loginData.email.includes("@") && loginData.password.length >= 6;
  }

  async function handleSignup() {  
    if (!isSignupValid()) return;
    
    setLoadingSignup(true);
    const { error } = await signUp(signupData.email, signupData.password, { full_name: signupData.name });
    setLoadingSignup(false);
    
    if (!error) {
      setAuthOpen(false);
      // User will be redirected after email verification
    }
  }

  async function handleLogin() {
    if (!isLoginValid()) return;
    
    setLoadingLogin(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setLoadingLogin(false);
    
    if (!error) {
      setAuthOpen(false);
      navigate('/dashboard');
    }
  }

  function onOverlayClick(e: React.MouseEvent) {
    if (e.target === modalRef.current) setAuthOpen(false);
  }

  return (
    <div>
      <style>{`:root{--accent-a:#1F73FF;--accent-b:#000000;--accent-grad: linear-gradient(90deg,var(--accent-a),var(--accent-b));--surface:#ffffff;--text:#1a1a1a;--muted:#f5f5f5;--muted-border:#e6e6e6}*{box-sizing:border-box}body{margin:0;font-family:Inter, sans-serif;background-color:#ffffff;color:var(--text);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.navbar{display:flex;justify-content:space-between;align-items:center;padding:16px 40px;background:var(--surface);box-shadow:0 2px 5px rgba(0,0,0,0.05);position:sticky;top:0;z-index:100}.logo{font-size:24px;font-weight:900;color:#000;letter-spacing:0.5px;cursor:pointer}.nav-links{display:flex;gap:36px;font-size:16px;font-weight:600}.nav-links a{text-decoration:none;color:#000}.cta{background:var(--accent-grad);color:#fff;padding:12px 28px;border-radius:50px;font-weight:600;font-size:16px;text-decoration:none;cursor:pointer;border:none}footer{background:var(--surface);text-align:center;padding:24px;font-size:14px;opacity:0.8;display:flex;justify-content:center;gap:24px;flex-wrap:wrap}footer a{text-decoration:none;color:#000;font-weight:500}@media (max-width:600px){.nav-links{display:none}}.faq-header{text-align:center;margin-top:50px}.faq-header h1{color:#1a1a1a;font-size:37px;margin-bottom:10px}.faq-header p{font-size:14.9px;opacity:0.7;margin:0}.faq-container{max-width:900px;margin:40px auto;display:flex;gap:20px;flex-wrap:wrap;justify-content:center}.faq-column{flex:1 1 520px;display:flex;flex-direction:column;gap:15px}.faq-item{background:#f2f2f7;border-radius:8px;padding:20px;cursor:pointer;position:relative;transition:background 0.2s}.faq-item:hover{background:#e6e6eb}.faq-question{font-weight:700;display:flex;justify-content:space-between;align-items:center;font-size:18px;overflow-wrap:anywhere}.faq-answer{max-height:0;overflow:hidden;transition:max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);padding-top:0;font-size:16px;font-weight:400;color:#333}.faq-item.open .faq-answer{max-height:500px;padding-top:15px}.faq-toggle{font-size:24px;font-weight:bold;margin-left:10px}.contact-box{background:#e0ebff;border-radius:35px;padding:25px 30px;display:flex;justify-content:space-between;align-items:center;margin:40px auto 50px auto;max-width:800px}.contact-box p{margin:0;font-size:16px;flex:1;white-space:nowrap;padding-right:20px}.contact-box a{background: var(--accent-grad);color:#fff;padding:15px 30px;font-weight:700;border-radius:9999px;text-decoration:none;font-size:18px;transition:transform 0.2s,box-shadow 0.2s;white-space:nowrap}.contact-box a:hover{transform:scale(1.05);box-shadow:0 5px 15px rgba(0,0,0,0.2)}.popup{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.28);backdrop-filter:blur(1.5px);justify-content:center;align-items:center;z-index:1200;padding:20px}.popup.show{display:flex}.popup-content{background:#fff;border-radius:16px;box-shadow:0 28px 80px rgba(8,20,12,0.18);max-width:560px;width:100%;padding:56px 40px;display:flex;flex-direction:column;gap:12px;position:relative;min-width:320px}.popup-icon{display:flex;justify-content:center;align-items:center;width:48px;height:48px;margin-bottom:2px;align-self:center;opacity:0.55;background:transparent;box-shadow:none}.popup-icon svg{width:48px;height:48px}.popup-content h3{margin:0;font-size:26px;font-weight:800;color:#000;text-align:center}.tabs{display:flex;gap:36px;justify-content:center;margin-top:10px;border-bottom:1px solid var(--muted-border);padding-bottom:8px}.tab{font-weight:800;font-size:15px;cursor:pointer;color:#6b6b6b;padding:8px 4px;position:relative}.tab.active{color:#000}.tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-12px;height:3px;border-radius:3px;background:var(--accent-grad)}.form{display:flex;flex-direction:column;gap:12px;margin-top:8px}.input-wrap{position:relative}.input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:18px;height:18px;opacity:0.9}.form input{width:100%;padding:12px 14px 12px 42px;border-radius:10px;border:1px solid var(--muted-border);font-size:15px;outline:none;transition:border-color .12s ease,box-shadow .08s ease}.form input:focus{border-color:#000;box-shadow:none}.submit{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent-grad);color:#fff;padding:12px 14px;border-radius:10px;border:none;font-weight:800;cursor:pointer;font-size:15px;transition:opacity .12s ease}.submit:hover{opacity:0.86}.submit:active{opacity:0.86}.submit[disabled]{opacity:0.62;cursor:not-allowed}.spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.45);border-top-color:rgba(255,255,255,0.95);animation:spin .9s linear infinite;display:inline-block}@keyframes spin{to{transform:rotate(360deg)}}.divider{display:flex;align-items:center;gap:12px;margin:8px 0;color:#777;font-size:13px}.divider:before,.divider:after{content:"";flex:1;height:1px;background:#eaeaea}.or-pill{padding:4px 10px;border-radius:999px;background:#fafafa;border:1px solid #eee;font-weight:700;font-size:12px}.social-btn{padding:12px;border-radius:10px;border:1px solid #e6e6e6;background:#fff;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;font-weight:700;font-size:14px;transition:background .12s ease}.social-btn:hover{background:#fbfbfb}.google-logo{width:18px;height:18px}.close-btn{position:absolute;top:14px;right:14px;font-size:18px;font-weight:700;color:#444;cursor:pointer;background:#f3f3f3;width:34px;height:34px;display:flex;justify-content:center;align-items:center;border-radius:50%;border:0}.close-btn:hover{background:#eaeaea}.legal{font-size:12px;color:#888;text-align:center;margin-top:6px}@media (max-width:640px){.popup-content{padding:36px 20px;border-radius:12px}.popup-icon svg{width:40px;height:40px}}`}</style>

      <nav className="navbar">
        <div className="logo" onClick={() => (window.location.href = "/")}>COMPLIE</div>
        <div className="nav-links">
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <a className="cta" href="/signup" onClick={(e) => { e.preventDefault(); setAuthOpen(true); }}>Try Complie Now</a>
      </nav>

      <div className="faq-header">
        <h1>Frequently asked questions</h1>
        <p>Everything you need to know about the product and billing.</p>
      </div>

      <div className="faq-container">
        <div className="faq-column">
          {faqList.slice(0, 3).map((item, i) => (
            <div key={i} className={`faq-item ${openItems[i] ? "open" : ""}`} onClick={() => toggleItem(i)}>
              <div className="faq-question">{item.q}<span className="faq-toggle">{openItems[i] ? '-' : '+'}</span></div>
              <div className="faq-answer">{item.a}</div>
            </div>
          ))}
        </div>
        <div className="faq-column">
          {faqList.slice(3).map((item, i) => {
            const idx = i + 3;
            return (
              <div key={idx} className={`faq-item ${openItems[idx] ? "open" : ""}`} onClick={() => toggleItem(idx)}>
                <div className="faq-question">{item.q}<span className="faq-toggle">{openItems[idx] ? '-' : '+'}</span></div>
                <div className="faq-answer">{item.a}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="contact-box">
        <p>Can't find the answer you're looking for? Please chat with our friendly team.</p>
        <a href="https://discord.gg/9HdmMjbQXW" target="_blank" rel="noreferrer">Get in touch</a>
      </div>

      <footer>
        <a href="privacypolicy.html">Privacy Policy</a>
        <a href="refundpolicy.html">Refund Policy</a>
        <a href="termsofservice.html">Terms of Service</a>
      </footer>

      <div ref={modalRef} className={`popup ${authOpen ? "show" : ""}`} id="authModal" onClick={onOverlayClick} role="presentation">
        <div className="popup-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button className="close-btn" id="closeAuth" aria-label="Close" onClick={() => setAuthOpen(false)}>×</button>
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

          {activeTab === "signup" && (
            <form ref={signupFormRef} id="signupForm" className="form" autoComplete="on" noValidate>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="8" r="3" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 20c1.8-3.2 5-5 7-5s5.2 1.8 7 5" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input ref={nameRef} id="name" name="name" type="text" placeholder="Full name" aria-label="Full name" required value={signupData.name} onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.5 7.5l8.5 6 8.5-6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="email" name="email" type="email" placeholder="Email" aria-label="Email" required value={signupData.email} onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="password" name="password" type="password" placeholder="Create password" aria-label="Create password" required value={signupData.password} onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))} />
              </div>
              <button type="button" id="signupBtn" className="submit" disabled={!isSignupValid() || loadingSignup} onClick={() => handleSignup()}>
                {loadingSignup ? <span className="spinner" /> : "Create account"}
              </button>
              <div className="divider"><span className="or-pill">OR</span></div>
              <div className="social-btn" id="googleSignup" onClick={handleGoogleAuth}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" />
                Continue with Google
              </div>
              <div className="legal">By creating an account you agree to our <a href="termsofservice.html">Terms</a> and <a href="privacypolicy.html">Privacy Policy</a>.</div>
            </form>
          )}

          {activeTab === "login" && (
            <form ref={loginFormRef} id="loginForm" className="form" autoComplete="on" noValidate>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.5 7.5l8.5 6 8.5-6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="loginEmail" name="loginEmail" type="email" placeholder="Email" aria-label="Email" required value={loginData.email} onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="loginPassword" name="loginPassword" type="password" placeholder="Password" aria-label="Password" required value={loginData.password} onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))} />
              </div>
              <button type="button" id="loginBtn" className="submit" disabled={!isLoginValid() || loadingLogin} onClick={() => handleLogin()}>
                {loadingLogin ? <span className="spinner" /> : "Log in"}
              </button>
              <div className="divider"><span className="or-pill">OR</span></div>
              <div className="social-btn" id="googleLogin" onClick={handleGoogleAuth}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" />
                Continue with Google
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
