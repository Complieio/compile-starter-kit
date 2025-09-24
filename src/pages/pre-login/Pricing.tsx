import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

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
  }

  function redirectToGoogle() {
    window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
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
          onClick={() => openAuthModal('signup')}
        >
          Try Complie Now
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex justify-end mb-6">
          <div className="inline-flex bg-muted rounded-full p-1.5 gap-1.5 shadow-sm">
            <button 
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                billing === 'monthly' 
                  ? 'bg-gradient-to-r from-complie-primary to-complie-accent text-white shadow-md' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                billing === 'annual' 
                  ? 'bg-gradient-to-r from-complie-primary to-complie-accent text-white shadow-md' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setBilling('annual')}
            >
              Yearly (save 20%)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {plansData.map(p => (
            <div key={p.id} className={`bg-card rounded-2xl p-8 shadow-lg border transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl flex flex-col h-full ${
              p.popular ? 'border-complie-primary/20 shadow-complie-primary/10 relative' : 'border-border'
            }`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-complie-primary to-complie-accent text-white px-4 py-2 rounded-full text-xs font-bold tracking-wider shadow-lg">
                  MOST POPULAR
                </div>
              )}
              <div className="text-lg font-bold text-foreground mb-1">{p.title}</div>
              {p.includes && <div className="text-sm text-muted-foreground mb-3">{p.includes}</div>}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold text-foreground">${billing === 'monthly' ? p.monthly : p.annualEquivalent}</span>
                <span className="text-base text-muted-foreground">/mo</span>
                {billing === 'annual' && (
                  <div className="text-xs text-muted-foreground font-semibold mt-1.5">
                    ${p.annualPrice} billed yearly
                  </div>
                )}
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-complie-primary font-bold text-xs mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-gradient-to-r from-complie-primary to-complie-accent text-white py-3 px-4 rounded-lg font-bold hover:opacity-90 transition-opacity shadow-md">
                Choose {p.title}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border max-w-4xl mx-auto p-8 flex flex-col items-center text-center transition-all hover:-translate-y-1.5 hover:shadow-xl mb-8">
          <div className="text-lg text-foreground mb-4 max-w-2xl">
            Early users receive 2 months of free access, followed by 50% off any chosen plan for life.
          </div>
          <button 
            className="bg-gradient-to-r from-complie-primary to-complie-accent text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            onClick={() => openAuthModal('signup')}
          >
            Start free trial
          </button>
        </div>

        <div className="text-center text-muted-foreground text-sm">
          Early adopters will be grandfathered at current prices ($9/$19 per month). To keep grandfathered pricing, your subscription must remain active, but exceptions can be made.
        </div>
      </div>

      <footer className="bg-background text-center py-6 text-sm opacity-80 flex justify-center gap-6 flex-wrap">
        <Link to="/privacypolicy" className="text-foreground font-medium hover:text-primary transition-colors">Privacy Policy</Link>
        <Link to="/refundpolicy" className="text-foreground font-medium hover:text-primary transition-colors">Refund Policy</Link>
        <Link to="/termsofservice" className="text-foreground font-medium hover:text-primary transition-colors">Terms of Service</Link>
      </footer>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-5">
          <div className="bg-background rounded-2xl shadow-2xl max-w-lg w-full p-14 relative">
            <button 
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground font-bold text-lg transition-colors"
              onClick={() => setModalOpen(false)}
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
                  activeTab === 'signup' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('signup')}
              >
                Create account
                {activeTab === 'signup' && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-complie-primary to-complie-accent rounded-full" />
                )}
              </button>
              <button 
                className={`font-extrabold text-sm py-2 px-1 relative transition-colors ${
                  activeTab === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('login')}
              >
                Login
                {activeTab === 'login' && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-complie-primary to-complie-accent rounded-full" />
                )}
              </button>
            </div>

            {activeTab === 'signup' && (
              <form className="space-y-3 mt-2" onSubmit={(e) => { e.preventDefault(); if (!isSignupDisabled()) handleSignup(); }}>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 20c1.8-3.2 5-5 7-5s5.2 1.8 7 5" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input 
                    className="w-full pl-10 pr-3 py-3 border border-border rounded-lg text-sm focus:border-foreground focus:outline-none transition-colors bg-background"
                    type="text" 
                    placeholder="Full name" 
                    value={signupName} 
                    onChange={(e) => setSignupName(e.target.value)} 
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
                    value={signupEmail} 
                    onChange={(e) => setSignupEmail(e.target.value)} 
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
                    value={signupPw} 
                    onChange={(e) => setSignupPw(e.target.value)} 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-complie-primary to-complie-accent text-white py-3 px-4 rounded-lg font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSignupDisabled()}
                >
                  {signupLoading ? (
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
                  onClick={redirectToGoogle}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google logo" />
                  Continue with Google
                </button>
              </form>
            )}

            {activeTab === 'login' && (
              <form className="space-y-3 mt-2" onSubmit={(e) => { e.preventDefault(); if (!isLoginDisabled()) handleLogin(); }}>
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
                    value={loginPw} 
                    onChange={(e) => setLoginPw(e.target.value)} 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-complie-primary to-complie-accent text-white py-3 px-4 rounded-lg font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoginDisabled()}
                >
                  {loginLoading ? (
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
                  onClick={redirectToGoogle}
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