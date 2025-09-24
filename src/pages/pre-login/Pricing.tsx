import React, { useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";

const PricingPage: React.FC = () => {
  useEffect(() => {
    const authModal = document.getElementById('authModal') as HTMLElement | null;
    const openModalBtn = document.getElementById('openModal') as HTMLButtonElement | null;
    const openModalHeroBtn = document.getElementById('openModalHero') as HTMLButtonElement | null;
    const openButtons = [openModalBtn, openModalHeroBtn];
    const closeAuth = document.getElementById('closeAuth') as HTMLButtonElement | null;
    const tabSignup = document.getElementById('tabSignup') as HTMLElement | null;
    const tabLogin = document.getElementById('tabLogin') as HTMLElement | null;
    const signupForm = document.getElementById('signupForm') as HTMLFormElement | null;
    const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
    const signupBtn = document.getElementById('signupBtn') as HTMLButtonElement | null;
    const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement | null;
    const nameInput = document.getElementById('name') as HTMLInputElement | null;
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const pwInput = document.getElementById('password') as HTMLInputElement | null;
    const loginEmail = document.getElementById('loginEmail') as HTMLInputElement | null;
    const loginPw = document.getElementById('loginPassword') as HTMLInputElement | null;
    const supabaseProjectUrl = 'https://gaogwkgdkdwitbfwmsmu.supabase.co';
    const redirectUrl = window.location.origin + '/dashboard.html';
    const googleSignupBtn = document.getElementById('googleSignup') as HTMLElement | null;
    const googleLoginBtn = document.getElementById('googleLogin') as HTMLElement | null;

    if (googleSignupBtn)
      googleSignupBtn.addEventListener('click', () => {
        window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
          redirectUrl
        )}`;
      });
    if (googleLoginBtn)
      googleLoginBtn.addEventListener('click', () => {
        window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
          redirectUrl
        )}`;
      });

    function openModal() {
      if (authModal) {
        authModal.style.display = 'flex';
        showSignup();
        setTimeout(() => {
          const f = document.getElementById('name') as HTMLElement | null;
          if (f) f.focus();
        }, 80);
      }
    }
    function closeModal() {
      if (authModal) authModal.style.display = 'none';
    }

    if (openButtons.length) {
      openButtons.forEach((btn) => btn && btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
    }
    if (closeAuth) closeAuth.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });

    if (tabSignup) tabSignup.addEventListener('click', showSignup);
    if (tabLogin) tabLogin.addEventListener('click', showLogin);
    if (tabSignup) tabSignup.addEventListener('keydown', (e: KeyboardEvent) => { if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') showSignup(); });
    if (tabLogin) tabLogin.addEventListener('keydown', (e: KeyboardEvent) => { if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') showLogin(); });

    function showSignup() {
      if (signupForm) signupForm.style.display = 'flex';
      if (loginForm) loginForm.style.display = 'none';
      if (tabSignup) tabSignup.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
    }
    function showLogin() {
      if (signupForm) signupForm.style.display = 'none';
      if (loginForm) loginForm.style.display = 'flex';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabSignup) tabSignup.classList.remove('active');
    }

    function validateSignup() {
      const ok = (nameInput && nameInput.value.trim().length > 1) && (emailInput && emailInput.value.includes('@')) && (pwInput && pwInput.value.length >= 6);
      if (signupBtn) signupBtn.disabled = !ok;
    }
    function validateLogin() {
      const ok = (loginEmail && loginEmail.value.includes('@')) && (loginPw && loginPw.value.length >= 6);
      if (loginBtn) loginBtn.disabled = !ok;
    }

    [nameInput, emailInput, pwInput].forEach((el) => { if (el) el.addEventListener('input', validateSignup); });
    [loginEmail, loginPw].forEach((el) => { if (el) el.addEventListener('input', validateLogin); });

    function showLoading(button: HTMLButtonElement | null, labelEl: HTMLElement) {
      if (!button) return;
      button.disabled = true;
      const original = labelEl.textContent || '';
      labelEl.textContent = '';
      const s = document.createElement('span'); s.className = 'spinner';
      labelEl.parentNode?.insertBefore(s, labelEl);
      setTimeout(() => { s.remove(); labelEl.textContent = original; button.disabled = false; closeModal(); }, 900);
    }

    if (signupBtn) signupBtn.addEventListener('click', () => { const lbl = document.getElementById('signupLabel'); if (lbl) showLoading(signupBtn, lbl); });
    if (loginBtn) loginBtn.addEventListener('click', () => { const lbl = document.getElementById('loginLabel'); if (lbl) showLoading(loginBtn, lbl); });

    document.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape') closeModal();
      if ((e as KeyboardEvent).key === 'Enter') {
        const active = document.activeElement as HTMLElement | null;
        if (signupForm && active && signupForm.contains(active) && signupBtn && !signupBtn.disabled) signupBtn.click();
        if (loginForm && active && loginForm.contains(active) && loginBtn && !loginBtn.disabled) loginBtn.click();
      }
    });

    const monthlyBtn = document.getElementById('monthlyBtn') as HTMLButtonElement | null;
    const annualBtn = document.getElementById('annualBtn') as HTMLButtonElement | null;
    const plansGrid = document.getElementById('plansGrid') as HTMLElement | null;

    function updatePrices(type: 'monthly' | 'annual') {
      if (!plansGrid) return;
      const cards = plansGrid.querySelectorAll('.card');
      cards.forEach((card) => {
        const priceEl = card.querySelector('.price-amount') as HTMLElement | null;
        let billedSmall = card.querySelector('.price small') as HTMLElement | null;
        const perMoSpan = card.querySelector('.price span:nth-child(2)') as HTMLElement | null;

        if (!priceEl) return;

        if (type === 'monthly') {
          priceEl.textContent = `$${card.getAttribute('data-monthly')}`;
          if (perMoSpan) perMoSpan.textContent = '/mo';
          if (billedSmall) billedSmall.style.display = 'none';
        } else {
          priceEl.textContent = `$${card.getAttribute('data-annual-equivalent')}`;
          if (perMoSpan) perMoSpan.textContent = '/mo';
          if (!billedSmall) {
            billedSmall = document.createElement('small');
            billedSmall.style.display = 'block';
            billedSmall.style.fontSize = '13px';
            billedSmall.style.color = '#475569';
            billedSmall.style.fontWeight = '600';
            billedSmall.style.marginTop = '6px';
            card.querySelector('.price')?.appendChild(billedSmall);
          } else {
            billedSmall.style.display = 'block';
          }
          billedSmall.textContent = `$${card.getAttribute('data-annual-price')} billed yearly`;
        }
      });
    }

    if (monthlyBtn) {
      monthlyBtn.addEventListener('click', () => {
        monthlyBtn.classList.add('active');
        if (annualBtn) annualBtn.classList.remove('active');
        monthlyBtn.setAttribute('aria-pressed', 'true');
        if (annualBtn) annualBtn.setAttribute('aria-pressed', 'false');

        updatePrices('monthly');
      });
    }

    if (annualBtn) {
      annualBtn.addEventListener('click', () => {
        annualBtn.classList.add('active');
        if (monthlyBtn) monthlyBtn.classList.remove('active');
        annualBtn.setAttribute('aria-pressed', 'true');
        if (monthlyBtn) monthlyBtn.setAttribute('aria-pressed', 'false');

        updatePrices('annual');
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      if (annualBtn && annualBtn.classList.contains('active')) {
        updatePrices('annual');
      } else {
        updatePrices('monthly');
      }
    });

    // run initial price update in case DOMContentLoaded already fired
    updatePrices((annualBtn && annualBtn.classList.contains('active')) ? 'annual' : 'monthly');

    // cleanup
    return () => {
      // Note: removing every listener individually would be verbose; in this conversion we keep the simple behavior.
    };
  }, []);

  return (
    <div>
      <style>{`
:root{
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
.card .list li::before{ content:'\2713'; color:var(--accent-start); font-weight:700; margin-right:6px; font-size:13px; }
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
@media (max-width:640px){.popup-content{padding:36px 20px;border-radius:12px}.popup-icon svg{width:40px;height:40px}}
      `}</style>

      <nav className="navbar">
        <div className="logo" onClick={() => { window.location.href = '/'; }}>COMPLIE</div>
        <div className="nav-links">
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <button className="cta" id="openModal">Try Complie Now</button>
      </nav>

      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="toggle" role="tablist" aria-label="Billing toggle">
            <button id="monthlyBtn" className="active" aria-pressed="true">Monthly</button>
            <button id="annualBtn" aria-pressed="false">Yearly (save 20%)</button>
          </div>
        </div>

        <div className="plans-grid" id="plansGrid">
          <div className="card" data-plan="basic" data-monthly="9" data-annual-price="97" data-annual-equivalent="8">
            <div className="title">Basic</div>
            <div className="price"><span className="price-amount">$9</span><span style={{ fontSize: 16 }}>/mo</span></div>
            <ul className="list">
              <li>Full task tracking & reminders</li>
              <li>Up to 10 clients/projects</li>
              <li>Unlimited document uploads</li>
              <li>Up to 100 custom checklists in total</li>
              <li>Access to notes</li>
            </ul>
            <a href="#" className="cta">Choose Basic</a>
          </div>

          <div className="card popular" data-plan="pro" data-monthly="19" data-annual-price="182" data-annual-equivalent="15">
            <div className="ribbon">MOST POPULAR</div>
            <div className="title">Pro</div>
            <div className="includes">Everything in Basic</div>
            <div className="price"><span className="price-amount">$19</span><span style={{ fontSize: 16 }}>/mo</span></div>
            <ul className="list">
              <li>Full task tracking & reminders</li>
              <li>Unlimited clients/projects</li>
              <li>Unlimited document uploads</li>
              <li>Custom checklists per client/project</li>
              <li>Access to notes</li>
            </ul>
            <a href="#" className="cta">Choose Pro</a>
          </div>
        </div>

        <div className="wide-cta" role="region" aria-label="Early user offer">
          <div className="offer-text">Early users receive 2 months of free access, followed by 50% off any chosen plan for life.</div>
          <button className="cta trial-btn" id="openModalHero">Start free trial</button>
        </div>

        <div className="bottom-note">
          Early adopters will be grandfathered at current prices ($9/$19 per month). To keep grandfathered pricing, your subscription must remain active, but exceptions can be made.
        </div>
      </div>

      <footer>
        <a href="privacypolicy.html">Privacy Policy</a>
        <a href="/refundpolicy.html">Refund Policy</a>
        <a href="termsofservice.html">Terms of Service</a>
      </footer>

      <div className="popup" id="authModal">
        <div className="popup-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button className="close-btn" id="closeAuth" aria-label="Close">×</button>
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
            <div className="tab active" id="tabSignup" role="tab" tabIndex={0} aria-selected="true">Create account</div>
            <div className="tab" id="tabLogin" role="tab" tabIndex={0} aria-selected="false">Login</div>
          </div>

          <form id="signupForm" className="form" autoComplete="on" noValidate>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="8" r="3" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 20c1.8-3.2 5-5 7-5s5.2 1.8 7 5" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="name" name="name" type="text" placeholder="Full name" aria-label="Full name" required />
            </div>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.5 7.5l8.5 6 8.5-6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="email" name="email" type="email" placeholder="Email" aria-label="Email" required />
            </div>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="password" name="password" type="password" placeholder="Create password" aria-label="Create password" required />
            </div>
            <button type="button" id="signupBtn" className="submit" disabled>
              <span id="signupLabel">Create account</span>
            </button>
            <div className="divider"><span className="or-pill">OR</span></div>
            <div className="social-btn" id="googleSignup">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" /> Continue with Google
            </div>
            <div className="legal">By creating an account you agree to our <a href="termsofservice.html">Terms</a> and <a href="privacypolicy.html">Privacy Policy</a>.</div>
          </form>

          <form id="loginForm" className="form" style={{ display: 'none' }} autoComplete="on" noValidate>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.5 7.5l8.5 6 8.5-6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="loginEmail" name="loginEmail" type="email" placeholder="Email" aria-label="Email" required />
            </div>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3.5" y="11" width="17" height="8" rx="1.6" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11V9.2a4 4 0 0 1 8 0V11" stroke="#000" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="loginPassword" name="loginPassword" type="password" placeholder="Password" aria-label="Password" required />
            </div>
            <button type="button" id="loginBtn" className="submit" disabled>
              <span id="loginLabel">Log in</span>
            </button>
            <div className="divider"><span className="or-pill">OR</span></div>
            <div className="social-btn" id="googleLogin">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" /> Continue with Google
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
