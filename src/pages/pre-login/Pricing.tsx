import React, { useState, useEffect } from 'react';

const PricingPage: React.FC = () => {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const plans = [
    {
      plan: 'Basic',
      monthly: 9,
      annualPrice: 97,
      annualEquivalent: 8,
      features: ['Full task tracking & reminders', 'Up to 10 clients/projects', 'Unlimited document uploads', 'Up to 100 custom checklists in total', 'Access to notes'],
      popular: false
    },
    {
      plan: 'Pro',
      monthly: 19,
      annualPrice: 182,
      annualEquivalent: 15,
      features: ['Full task tracking & reminders', 'Unlimited clients/projects', 'Unlimited document uploads', 'Custom checklists per client/project', 'Access to notes'],
      popular: true
    }
  ];

  const redirectUrl = window.location.origin + '/dashboard.html';
  const supabaseProjectUrl = 'https://gaogwkgdkdwitbfwmsmu.supabase.co';

  useEffect(() => {
    if (localStorage.getItem('complieModalShown') !== 'true') {
      setTimeout(() => { setAuthOpen(true); localStorage.setItem('complieModalShown', 'true'); }, 1000);
    }
  }, []);

  const handleBillingChange = (type: 'monthly' | 'annual') => {
    setBilling(type);
  };

  const handleGoogleAuth = () => {
    window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSignupChange = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const handleLoginChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const isSignupValid = signupData.name.trim().length > 1 && signupData.email.includes('@') && signupData.password.length >= 6;
  const isLoginValid = loginData.email.includes('@') && loginData.password.length >= 6;

  const showLoading = (callback: () => void) => {
    setTimeout(() => { callback(); setAuthOpen(false); }, 900);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo" onClick={() => window.location.href='/'}>COMPLIE</div>
        <div className="nav-links">
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </div>
        <button className="cta" onClick={() => setAuthOpen(true)}>Try Complie Now</button>
      </nav>

      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="toggle" role="tablist" aria-label="Billing toggle">
            <button className={billing === 'monthly' ? 'active' : ''} onClick={() => handleBillingChange('monthly')} aria-pressed={billing==='monthly'}>Monthly</button>
            <button className={billing === 'annual' ? 'active' : ''} onClick={() => handleBillingChange('annual')} aria-pressed={billing==='annual'}>Yearly (save 20%)</button>
          </div>
        </div>

        <div className="plans-grid">
          {plans.map(plan => (
            <div key={plan.plan} className={`card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="ribbon">MOST POPULAR</div>}
              <div className="title">{plan.plan}</div>
              {plan.popular && <div className="includes">Everything in Basic</div>}
              <div className="price">
                <span className="price-amount">
                  ${billing === 'monthly' ? plan.monthly : plan.annualEquivalent}
                </span>
                <span style={{ fontSize: 16 }}>/mo</span>
                {billing === 'annual' && <small>${plan.annualPrice} billed yearly</small>}
              </div>
              <ul className="list">
                {plan.features.map((feat, i) => <li key={i}>{feat}</li>)}
              </ul>
              <a href="#" className="cta">Choose {plan.plan}</a>
            </div>
          ))}
        </div>

        <div className="wide-cta" role="region" aria-label="Early user offer">
          <div className="offer-text">Early users receive 2 months of free access, followed by 50% off any chosen plan for life.</div>
          <button className="cta trial-btn" onClick={() => setAuthOpen(true)}>Start free trial</button>
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

      {authOpen && (
        <div className="popup" onClick={() => setAuthOpen(false)}>
          <div className="popup-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setAuthOpen(false)}>×</button>
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
              <div className={`tab ${activeTab==='signup'?'active':''}`} onClick={() => setActiveTab('signup')} tabIndex={0} role="tab" aria-selected={activeTab==='signup'}>Create account</div>
              <div className={`tab ${activeTab==='login'?'active':''}`} onClick={() => setActiveTab('login')} tabIndex={0} role="tab" aria-selected={activeTab==='login'}>Login</div>
            </div>

            {activeTab==='signup' && (
              <form className="form" autoComplete="on" noValidate>
                <div className="input-wrap">
                  <input type="text" placeholder="Full name" value={signupData.name} onChange={e => handleSignupChange('name', e.target.value)} required />
                </div>
                <div className="input-wrap">
                  <input type="email" placeholder="Email" value={signupData.email} onChange={e => handleSignupChange('email', e.target.value)} required />
                </div>
                <div className="input-wrap">
                  <input type="password" placeholder="Create password" value={signupData.password} onChange={e => handleSignupChange('password', e.target.value)} required />
                </div>
                <button type="button" className="submit" disabled={!isSignupValid} onClick={() => showLoading(() => {})}>Create account</button>
                <div className="divider"><span className="or-pill">OR</span></div>
                <div className="social-btn" onClick={handleGoogleAuth}>Continue with Google</div>
              </form>
            )}

            {activeTab==='login' && (
              <form className="form" autoComplete="on" noValidate>
                <div className="input-wrap">
                  <input type="email" placeholder="Email" value={loginData.email} onChange={e => handleLoginChange('email', e.target.value)} required />
                </div>
                <div className="input-wrap">
                  <input type="password" placeholder="Password" value={loginData.password} onChange={e => handleLoginChange('password', e.target.value)} required />
                </div>
                <button type="button" className="submit" disabled={!isLoginValid} onClick={() => showLoading(() => {})}>Log in</button>
                <div className="divider"><span className="or-pill">OR</span></div>
                <div className="social-btn" onClick={handleGoogleAuth}>Continue with Google</div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PricingPage;
