import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function PrivacyPage(): JSX.Element {
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const modalRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const supabaseProjectUrl = 'https://gaogwkgdkdwitbfwmsmu.supabase.co';
  const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard.html` : '/dashboard.html';

  useEffect(() => {
    const shown = localStorage.getItem('complieModalShown');
    if (shown !== 'true') {
      const t = setTimeout(() => { setAuthOpen(true); localStorage.setItem('complieModalShown', 'true'); }, 1000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (authOpen) setTimeout(() => { nameRef.current?.focus(); }, 80);
  }, [authOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAuthOpen(false);
      if (e.key === 'Enter') {
        const active = document.activeElement as Element | null;
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        const signupBtn = document.getElementById('signupBtn') as HTMLButtonElement | null;
        const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement | null;
        if (signupForm?.contains(active) && signupBtn && !signupBtn.disabled) signupBtn.click();
        if (loginForm?.contains(active) && loginBtn && !loginBtn.disabled) loginBtn.click();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleGoogleAuth = () => {
    window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
  };

  const isSignupValid = signupData.name.trim().length > 1 && signupData.email.includes('@') && signupData.password.length >= 6;
  const isLoginValid = loginData.email.includes('@') && loginData.password.length >= 6;

  const showLoading = (buttonEl: HTMLButtonElement | null, labelId: string) => {
    if (!buttonEl) return;
    buttonEl.disabled = true;
    const labelEl = document.getElementById(labelId);
    const original = labelEl?.textContent || '';
    if (labelEl) labelEl.textContent = '';
    const s = document.createElement('span');
    s.className = 'spinner';
    labelEl?.parentNode?.insertBefore(s, labelEl);
    setTimeout(() => { s.remove(); if (labelEl) labelEl.textContent = original; buttonEl.disabled = false; setAuthOpen(false); }, 900);
  };

  const openModalFromLink = (e?: React.MouseEvent) => { e?.preventDefault(); setAuthOpen(true); };

  const onOverlayClick = (e: React.MouseEvent) => { if (e.target === modalRef.current) setAuthOpen(false); };

  return (
    <div>
      <style>{`:root{--accent-start:#1F73FF;--accent-end:#000000;--accent-grad:linear-gradient(90deg,var(--accent-start),var(--accent-end));--bg:#ffffff;--muted:#ffffff;--card-shadow:0 12px 30px rgba(15,23,42,0.06);--card-shadow-strong:0 20px 40px rgba(15,23,42,0.09);--radius:14px;--maxw:1200px;--surface:#ffffff;--text:#1a1a1a;--muted-border:#e6e6e6}*{box-sizing:border-box}body{margin:0;font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;background:var(--muted);color:var(--text);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.navbar{display:flex;justify-content:space-between;align-items:center;padding:16px 40px;background:var(--surface);box-shadow:0 2px 5px rgba(0,0,0,0.05);position:sticky;top:0;z-index:100}.logo{font-size:24px;font-weight:900;color:#000;letter-spacing:0.5px;cursor:pointer}.nav-links{display:flex;gap:36px;font-size:16px;font-weight:600}.nav-links a{text-decoration:none;color:#000}.cta{background:var(--accent-grad);color:#fff;padding:12px 28px;border-radius:50px;font-weight:600;font-size:16px;text-decoration:none;cursor:pointer;border:none}.wrap{max-width:var(--maxw);margin:28px auto;padding:20px}h1{font-size:64px;color:#1a1a1a;text-align:center;margin-bottom:8px}h1 span{font-weight:700}h2{font-size:24px;margin-top:30px;margin-bottom:10px;background:var(--accent-grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}p, li{font-size:16px;margin-bottom:10px}p.opacity{opacity:0.75;text-align:center;margin-bottom:40px}ul{padding-left:20px;margin-bottom:20px}a.contact-link{background:none;color:var(--accent-start);background:var(--accent-grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none}footer{background:var(--surface);text-align:center;padding:24px;font-size:14px;opacity:0.8;display:flex;justify-content:center;gap:24px;flex-wrap:wrap}footer a{text-decoration:none;color:#000;font-weight:500}.popup{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.28);backdrop-filter:blur(1.5px);justify-content:center;align-items:center;z-index:1200;padding:20px}.popup.show{display:flex}.popup-content{background:#fff;border-radius:16px;box-shadow:0 28px 80px rgba(8,20,12,0.18);max-width:560px;width:100%;padding:56px 40px;display:flex;flex-direction:column;gap:12px;position:relative;min-width:320px}.popup-icon{display:flex;justify-content:center;align-items:center;width:48px;height:48px;margin-bottom:2px;align-self:center;opacity:0.55;background:transparent;box-shadow:none}.popup-icon svg{width:48px;height:48px}.popup-content h3{margin:0;font-size:26px;font-weight:800;color:#000;text-align:center}.tabs{display:flex;gap:36px;justify-content:center;margin-top:10px;border-bottom:1px solid var(--muted-border);padding-bottom:8px}.tab{font-weight:800;font-size:15px;cursor:pointer;color:#6b6b6b;padding:8px 4px;position:relative}.tab.active{color:#000}.tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-12px;height:3px;border-radius:3px;background:var(--accent-grad)}.form{display:flex;flex-direction:column;gap:12px;margin-top:8px}.input-wrap{position:relative}.input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:18px;height:18px;opacity:0.9}.form input{width:100%;padding:12px 14px 12px 42px;border-radius:10px;border:1px solid var(--muted-border);font-size:15px;outline:none;transition:border-color .12s ease,box-shadow .08s ease}.form input:focus{border-color:#000;box-shadow:none}.submit{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent-grad);color:#fff;padding:12px 14px;border-radius:10px;border:none;font-weight:800;cursor:pointer;font-size:15px;transition:opacity .12s ease}.submit:hover{opacity:0.86}.submit:active{opacity:0.86}.submit[disabled]{opacity:0.62;cursor:not-allowed}.spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.45);border-top-color:rgba(255,255,255,0.95);animation:spin .9s linear infinite;display:inline-block}@keyframes spin{to{transform:rotate(360deg)}}.divider{display:flex;align-items:center;gap:12px;margin:8px 0;color:#777;font-size:13px}.divider:before,.divider:after{content:"";flex:1;height:1px;background:#eaeaea}.or-pill{padding:4px 10px;border-radius:999px;background:#fafafa;border:1px solid #eee;font-weight:700;font-size:12px}.social-btn{padding:12px;border-radius:10px;border:1px solid #e6e6e6;background:#fff;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;font-weight:700;font-size:14px;transition:background .12s ease}.social-btn:hover{background:#fbfbfb}.google-logo{width:18px;height:18px}.close-btn{position:absolute;top:14px;right:14px;font-size:18px;font-weight:700;color:#444;cursor:pointer;background:#f3f3f3;width:34px;height:34px;display:flex;justify-content:center;align-items:center;border-radius:50%;border:0}.close-btn:hover{background:#eaeaea}.legal{font-size:12px;color:#888;text-align:center;margin-top:6px}@media (max-width:640px){.popup-content{padding:36px 20px;border-radius:12px}.popup-icon svg{width:40px;height:40px}}`}</style>

      <nav className="navbar">
        <div className="logo" onClick={() => (window.location.href = '/')}>
          COMPLIE
        </div>
        <div className="nav-links">
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <button className="cta" id="openModal" onClick={openModalFromLink}>Try Complie Now</button>
      </nav>

      <div className="wrap">
        <h1><span>Privacy Policy</span></h1>
        <p className="opacity">Last updated: August 25, 2025</p>

        <h2>Information Collection</h2>
        <ul>
          <li><strong>Information You Provide:</strong> When you sign up, we collect your name, email address, and any other information you provide to create and manage your account. When you use our services, we also store the information you provide while interacting with Complie. If you contact support, we may collect the information you share in your messages.</li>
          <li><strong>Automated Information Collection:</strong> We collect data on how you use Complie, such as which features you interact with, login times, and activity patterns.</li>
          <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to improve your experience, keep you logged in, and analyze usage patterns. These do not track personal details outside of our platform.</li>
        </ul>

        <h2>Use of Information</h2>
        <ul>
          <li>Provide and improve Complie’s services.</li>
          <li>Help you track compliance and manage your freelance projects efficiently.</li>
          <li>Communicate with you about updates, new features, and support.</li>
          <li>Analyze usage to optimize the platform.</li>
        </ul>

        <h2>Sharing of Information</h2>
        <ul>
          <li><strong>Service Providers:</strong> With third-party service providers who perform services on our behalf, under strict data protection terms.</li>
          <li><strong>Legal Obligations:</strong> When required by law or to respond to legal process or lawful requests, including from law enforcement and government agencies.</li>
          <li><strong>Protection of Rights and Safety:</strong> To protect the rights, property, or safety of Complie, our users, or others, including to prevent fraud and reduce credit risk.</li>
        </ul>

        <h2>Security</h2>
        <p style={{ fontWeight: 600 }}>We take the security of your information seriously and implement reasonable security measures to protect it. However, no security system is impenetrable, and we cannot guarantee the security of our databases, nor can we guarantee that the information you supply won't be intercepted while being transmitted to us over the Internet.</p>

        <h2>International Transfers</h2>
        <p style={{ fontWeight: 600 }}>Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.</p>

        <h2>Your Rights</h2>
        <p style={{ fontWeight: 600 }}>Depending on where you reside, you may have certain rights regarding your personal information, including the right to access, correct, delete, or restrict its use. To exercise these rights, please contact us at the information below.</p>

        <h2>Changes to This Privacy Policy</h2>
        <p style={{ fontWeight: 600 }}>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

        <h2>Contact Us</h2>
        <p>Email: <a className="contact-link" href="mailto:Liana.digital18@gmail.com">Liana.digital18@gmail.com</a></p>
        <p>Discord: <a className="contact-link" href="https://discord.gg/9HdmMjbQXW" target="_blank" rel="noreferrer">Complie Discord Server</a></p>
      </div>

      <footer>
        <a href="privacypolicy.html">Privacy Policy</a>
        <a href="refundpolicy.html">Refund Policy</a>
        <a href="termsofservice.html">Terms of Service</a>
      </footer>

      <div ref={modalRef} className={`popup ${authOpen ? 'show' : ''}`} id="authModal" onClick={onOverlayClick} role="presentation">
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
            <div className={`tab ${activeTab === 'signup' ? 'active' : ''}`} id="tabSignup" role="tab" tabIndex={0} aria-selected={activeTab === 'signup'} onClick={() => setActiveTab('signup')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('signup'); }}>Create account</div>
            <div className={`tab ${activeTab === 'login' ? 'active' : ''}`} id="tabLogin" role="tab" tabIndex={0} aria-selected={activeTab === 'login'} onClick={() => setActiveTab('login')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('login'); }}>Login</div>
          </div>

          {activeTab === 'signup' && (
            <form id="signupForm" className="form" autoComplete="on" noValidate>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="8" r="3" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 20c1.8-3.2 5-5 7-5s5.2 1.8 7 5" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input ref={nameRef} id="name" name="name" type="text" placeholder="Full name" aria-label="Full name" required value={signupData.name} onChange={e => setSignupData(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.5 7.5l8.5 6 8.5-6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="email" name="email" type="email" placeholder="Email" aria-label="Email" required value={signupData.email} onChange={e => setSignupData(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="password" name="password" type="password" placeholder="Create password" aria-label="Create password" required value={signupData.password} onChange={e => setSignupData(prev => ({ ...prev, password: e.target.value }))} />
              </div>
              <button type="button" id="signupBtn" className="submit" disabled={!isSignupValid} onClick={() => showLoading(document.getElementById('signupBtn') as HTMLButtonElement | null, 'signupLabel')}>
                <span id="signupLabel">Create account</span>
              </button>
              <div className="divider"><span className="or-pill">OR</span></div>
              <div className="social-btn" id="googleSignup" onClick={handleGoogleAuth}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" />
                Continue with Google
              </div>
              <div className="legal">By creating an account you agree to our <a href="termsofservice.html">Terms</a> and <a href="privacypolicy.html">Privacy Policy</a>.</div>
            </form>
          )}

          {activeTab === 'login' && (
            <form id="loginForm" className="form" autoComplete="on" noValidate>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.5 7.5l8.5 6 8.5-6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="loginEmail" name="loginEmail" type="email" placeholder="Email" aria-label="Email" required value={loginData.email} onChange={e => setLoginData(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="loginPassword" name="loginPassword" type="password" placeholder="Password" aria-label="Password" required value={loginData.password} onChange={e => setLoginData(prev => ({ ...prev, password: e.target.value }))} />
              </div>
              <button type="button" id="loginBtn" className="submit" disabled={!isLoginValid} onClick={() => showLoading(document.getElementById('loginBtn') as HTMLButtonElement | null, 'loginLabel')}>
                <span id="loginLabel">Log in</span>
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
