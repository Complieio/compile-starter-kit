import React, { useEffect, useState, useRef } from 'react';

const css = `:root{
  --accent-start:#1b5e20;
  --accent-end:#4caf50;
  --accent-grad:linear-gradient(90deg,var(--accent-start),var(--accent-end));
  --bg:#ffffff;
  --muted:#ffffff;
  --muted-border:#e3e3e3;
  --card-shadow:0 12px 30px rgba(15,23,42,0.06);
  --card-shadow-strong:0 20px 40px rgba(15,23,42,0.09);
  --radius:14px;
  --maxw:1200px;
  --surface:#ffffff;
  --text:#1a1a1a;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{
  margin:0;
  font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background:var(--bg);
  color:var(--text);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  min-height: 100vh;
}
.navbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:16px 40px;
  background:var(--surface);
  box-shadow:0 2px 5px rgba(0,0,0,0.05);
  position:sticky;
  top:0;
  z-index:100;
}
.logo{font-size:24px;font-weight:900;color:#000;letter-spacing:0.5px;cursor:pointer}
.nav-links{display:flex;gap:36px;font-size:16px;font-weight:600}
.nav-links a{text-decoration:none;color:#000}
.cta{background:var(--accent-grad);color:#fff;padding:12px 28px;border-radius:50px;font-weight:600;font-size:16px;text-decoration:none;cursor:pointer;border:none}
.wrap{
  max-width:var(--maxw);
  margin:40px auto;
  padding:20px 20px 60px 20px;
}
.toggle {
  display:inline-flex;
  background:#f8fafc;
  border-radius:999px;
  padding:6px;
  gap:6px;
  box-shadow: 0 1px 0 rgba(15,23,42,0.03);
  margin: -12px 0 22px 0;
}
.toggle button {
  background:transparent;
  border:0;
  padding:10px 20px;
  border-radius:999px;
  cursor:pointer;
  color:#475569;
  font-weight:600;
  font-size:15px;
}
.toggle button.active {
  background: var(--accent-grad);
  color:#fff;
  box-shadow: 0 6px 18px rgba(27,94,32,0.18);
}
.plans-grid {
  display:grid;
  grid-template-columns: repeat(2, 1fr);
  gap:22px;
  align-items: stretch;
}
.card {
  background:var(--surface);
  border-radius:var(--radius);
  padding:26px;
  box-shadow: var(--card-shadow);
  border:1px solid rgba(15,23,42,0.03);
  display:flex;
  flex-direction:column;
  height: 100%;
  transition: transform .15s ease, box-shadow .15s ease;
}
.card:hover{ transform: translateY(-6px); box-shadow: var(--card-shadow-strong); }
.card .title { font-weight:700; font-size:18px; color:#0f172a; letter-spacing: -0.2px; }
.card .price { font-weight:800; font-size:34px; margin-top:12px; color:#0f172a; display:flex; align-items:baseline; gap:8px; }
.card .price small { display:block; font-size:13px; color:#475569; font-weight:600; margin-top:6px; opacity:0.95; }
.card .list { margin:14px 0 0 0; padding:0; list-style:none; flex:1; }
.card .list li { display:flex; gap:10px; align-items:flex-start; margin:10px 0; color:#334155; font-size:15px; line-height:1.35; }
.card .list li::before{ content:'¹3'; color:var(--accent-start); font-weight:700; margin-right:6px; font-size:13px; }
.card .cta { margin-top:18px; display:block; text-align:center; padding:12px 16px; border-radius:10px; text-decoration:none; font-weight:700; color:#fff; background: var(--accent-grad); box-shadow: 0 8px 20px rgba(27,94,32,0.12); }
.popular { position:relative; border:1px solid rgba(27,94,32,0.18); box-shadow: 0 22px 50px rgba(27,94,32,0.07); }
.ribbon { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background: var(--accent-grad); color:white; padding:8px 18px; border-radius:999px; font-weight:700; font-size:13px; letter-spacing:1px; box-shadow: 0 8px 18px rgba(27,94,32,0.14); }
.bottom-note { margin-top:28px; text-align:center; color:#64748b; font-size:14px; }
footer{background:var(--surface);text-align:center;padding:24px;font-size:14px;opacity:0.8;display:flex;justify-content:center;gap:24px;flex-wrap:wrap}
footer a{text-decoration:none;color:#000;font-weight:500}
.wide-cta{background:var(--surface);border-radius:var(--radius);box-shadow:var(--card-shadow);border:1px solid rgba(15,23,42,0.04);max-width:1000px;width:90%;margin:40px auto;padding:20px 24px;display:flex;flex-direction:column;align-items:center;transition: transform .15s ease, box-shadow .15s ease;height:140px}
.wide-cta:hover{transform: translateY(-6px);box-shadow: var(--card-shadow-strong)}
.wide-cta .offer-text{font-weight:400;font-size:17px;color:#0f172a;line-height:1.5;text-align:center;margin-bottom:16px;font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial}
.wide-cta .trial-btn{padding:12px 20px;border-radius:10px;font-weight:700}
@media (max-width:640px){.wrap{padding:16px}.plans-grid{grid-template-columns:1fr}.popular{transform:none}.nav-links{display:none}.wide-cta{width:95%}}
.popup{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.28);backdrop-filter:blur(1.5px);justify-content:center;align-items:center;z-index:1200;padding:20px}
.popup[data-open="true"]{display:flex}
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
@media (max-width:640px){.popup-content{padding:36px 20px;border-radius:12px}.popup-icon svg{width:40px;height:40px}}`;

const plansData = [
  {
    id: 'basic',
    title: 'Basic',
    monthly: 9,
    annualPrice: 97,
    annualEquivalent: 8,
    features: [
      'Full task tracking & reminders',
      'Up to 10 clients/projects',
      'Unlimited document uploads',
      'Up to 100 custom checklists in total',
      'Access to notes'
    ]
  },
  {
    id: 'pro',
    title: 'Pro',
    popular: true,
    monthly: 19,
    annualPrice: 182,
    annualEquivalent: 15,
    includes: 'Everything in Basic',
    features: [
      'Full task tracking & reminders',
      'Unlimited clients/projects',
      'Unlimited document uploads',
      'Custom checklists per client/project',
      'Access to notes'
    ]
  }
];

export default function PricingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signup'|'login'>('signup');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly');
  const supabaseProjectUrl = 'https://gaogwkgdkdwitbfwmsmu.supabase.co';
  const redirectUrl = window.location.origin + '/dashboard.html';
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const shown = localStorage.getItem('complieModalShown');
    if (shown !== 'true') {
      const t = setTimeout(() => { setModalOpen(true); localStorage.setItem('complieModalShown','true'); }, 1000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModalOpen(false);
      if (e.key === 'Enter') {
        if (modalOpen && activeTab === 'signup' && !isSignupDisabled()) handleSignup();
        if (modalOpen && activeTab === 'login' && !isLoginDisabled()) handleLogin();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, activeTab, signupName, signupEmail, signupPw, loginEmail, loginPw]);

  function isSignupDisabled() {
    return !(signupName.trim().length > 1 && signupEmail.includes('@') && signupPw.length >= 6);
  }
  function isLoginDisabled() {
    return !(loginEmail.includes('@') && loginPw.length >= 6);
  }

  function handleSignup() {
    setSignupLoading(true);
    setTimeout(() => { setSignupLoading(false); setModalOpen(false); }, 900);
  }
  function handleLogin() {
    setLoginLoading(true);
    setTimeout(() => { setLoginLoading(false); setModalOpen(false); }, 900);
  }

  function openAuthModal(tab: 'signup'|'login' = 'signup') {
    setActiveTab(tab);
    setModalOpen(true);
    setTimeout(() => { const el = document.getElementById('name'); if (el) (el as HTMLElement).focus(); }, 80);
  }

  function redirectToGoogle() {
    window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
  }

  return (
    <div>
      <nav className="navbar">
        <div className="logo" onClick={() => { window.location.href = '/'; }}>COMPLIE</div>
        <div className="nav-links">
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </div>
        <button className="cta" onClick={() => openAuthModal('signup')}>Try Complie Now</button>
      </nav>

      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="toggle" role="tablist" aria-label="Billing toggle">
            <button id="monthlyBtn" className={billing === 'monthly' ? 'active' : ''} aria-pressed={billing === 'monthly'} onClick={() => setBilling('monthly')}>Monthly</button>
            <button id="annualBtn" className={billing === 'annual' ? 'active' : ''} aria-pressed={billing === 'annual'} onClick={() => setBilling('annual')}>Yearly (save 20%)</button>
          </div>
        </div>

        <div className="plans-grid">
          {plansData.map(p => (
            <div key={p.id} className={`card ${p.popular ? 'popular' : ''}`} data-plan={p.id} data-monthly={String(p.monthly)} data-annual-price={String(p.annualPrice)} data-annual-equivalent={String(p.annualEquivalent)}>
              {p.popular && <div className="ribbon">MOST POPULAR</div>}
              <div className="title">{p.title}</div>
              {p.includes && <div className="includes">{p.includes}</div>}
              <div className="price">
                <span className="price-amount">${billing === 'monthly' ? p.monthly : p.annualEquivalent}</span>
                <span style={{ fontSize: 16 }}>/mo</span>
                {billing === 'annual' && <small>${p.annualPrice} billed yearly</small>}
              </div>
              <ul className="list">
                {p.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <a href="#" className="cta">Choose {p.title}</a>
            </div>
          ))}
        </div>

        <div className="wide-cta" role="region" aria-label="Early user offer">
          <div className="offer-text">Early users receive 2 months of free access, followed by 50% off any chosen plan for life.</div>
          <button className="cta trial-btn" onClick={() => openAuthModal('signup')}>Start free trial</button>
        </div>

        <div className="bottom-note">Early adopters will be grandfathered at current prices ($9/$19 per month). To keep grandfathered pricing, your subscription must remain active, but exceptions can be made.</div>
      </div>

      <footer>
        <a href="privacypolicy.html">Privacy Policy</a>
        <a href="/refundpolicy.html">Refund Policy</a>
        <a href="termsofservice.html">Terms of Service</a>
      </footer>

      <div className="popup" id="authModal" data-open={modalOpen} ref={modalRef} onClick={(e) => { if (e.target === modalRef.current) setModalOpen(false); }}>
        <div className="popup-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button className="close-btn" id="closeAuth" aria-label="Close" onClick={() => setModalOpen(false)}>×</button>
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
            <form id="signupForm" className="form" autoComplete="on" noValidate onSubmit={(e) => { e.preventDefault(); if (!isSignupDisabled()) handleSignup(); }}>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="8" r="3" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 20c1.8-3.2 5-5 7-5s5.2 1.8 7 5" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="name" name="name" type="text" placeholder="Full name" aria-label="Full name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} />
              </div>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.5 7.5l8.5 6 8.5-6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="email" name="email" type="email" placeholder="Email" aria-label="Email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
              </div>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input id="password" name="password" type="password" placeholder="Create password" aria-label="Create password" required value={signupPw} onChange={(e) => setSignupPw(e.target.value)} />
              </div>
              <button type="submit" id="signupBtn" className="submit" disabled={isSignupDisabled()}>
                {signupLoading ? <span className="spinner" /> : <span id="signupLabel">Create account</span>}
              </button>
              <div className="divider"><span className="or-pill">OR</span></div>
              <div className="social-btn" id="googleSignup" onClick={redirectToGoogle}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" /> Continue with Google
              </div>
              <div className="legal">By creating an account you agree to our <a href="termsofservice.html">Terms</a> and <a href="privacypolicy.html">Privacy Policy</a>.</div>
            </form>
          )}

          {activeTab === 'login' && (
            <form id="loginForm" className="form" autoComplete="on" noValidate onSubmit={(e) => { e.preventDefault(); if (!isLoginDisabled()) handleLogin(); }}>
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
                <input id="loginPassword" name="loginPassword" type="password" placeholder="Password" aria-label="Password" required value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
              </div>
              <button type="submit" id="loginBtn" className="submit" disabled={isLoginDisabled()}>
                {loginLoading ? <span className="spinner" /> : <span id="loginLabel">Log in</span>}
              </button>
              <div className="divider"><span className="or-pill">OR</span></div>
              <div className="social-btn" id="googleLogin" onClick={redirectToGoogle}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" /> Continue with Google
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
