import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

export default function TermsOfService(): JSX.Element {
  useEffect(() => {
    const authModal = document.getElementById("authModal");
    const openBtns = Array.from(document.querySelectorAll(".cta"));
    const closeAuth = document.getElementById("closeAuth");
    const tabSignup = document.getElementById("tabSignup");
    const tabLogin = document.getElementById("tabLogin");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const signupBtn = document.getElementById("signupBtn") as HTMLButtonElement | null;
    const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement | null;
    const nameInput = document.getElementById("name") as HTMLInputElement | null;
    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const pwInput = document.getElementById("password") as HTMLInputElement | null;
    const loginEmail = document.getElementById("loginEmail") as HTMLInputElement | null;
    const loginPw = document.getElementById("loginPassword") as HTMLInputElement | null;
    const supabaseProjectUrl = "https://gaogwkgdkdwitbfwmsmu.supabase.co";
    const redirectUrl = window.location.origin + "/dashboard.html";
    const googleSignupBtn = document.getElementById("googleSignup");
    const googleLoginBtn = document.getElementById("googleLogin");

    if (googleSignupBtn)
      googleSignupBtn.addEventListener("click", () => {
        window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
          redirectUrl
        )}`;
      });
    if (googleLoginBtn)
      googleLoginBtn.addEventListener("click", () => {
        window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
          redirectUrl
        )}`;
      });

    function showSignup() {
      if (signupForm && loginForm) {
        signupForm.style.display = "flex";
        loginForm.style.display = "none";
        if (tabSignup) tabSignup.classList.add("active");
        if (tabLogin) tabLogin.classList.remove("active");
      }
    }
    function showLogin() {
      if (signupForm && loginForm) {
        signupForm.style.display = "none";
        loginForm.style.display = "flex";
        if (tabLogin) tabLogin.classList.add("active");
        if (tabSignup) tabSignup.classList.remove("active");
      }
    }

    function openModal() {
      if (authModal) authModal.style.display = "flex";
      showSignup();
      setTimeout(() => {
        const f = document.getElementById("name") as HTMLInputElement | null;
        if (f) f.focus();
      }, 80);
    }
    function closeModal() {
      if (authModal) authModal.style.display = "none";
    }

    function validateSignup() {
      const ok =
        nameInput &&
        emailInput &&
        pwInput &&
        nameInput.value.trim().length > 1 &&
        emailInput.value.includes("@") &&
        pwInput.value.length >= 6;
      if (signupBtn) signupBtn.disabled = !ok;
    }
    function validateLogin() {
      const ok =
        loginEmail && loginPw && loginEmail.value.includes("@") && loginPw.value.length >= 6;
      if (loginBtn) loginBtn.disabled = !ok;
    }

    if (nameInput) nameInput.addEventListener("input", validateSignup);
    if (emailInput) emailInput.addEventListener("input", validateSignup);
    if (pwInput) pwInput.addEventListener("input", validateSignup);
    if (loginEmail) loginEmail.addEventListener("input", validateLogin);
    if (loginPw) loginPw.addEventListener("input", validateLogin);

    function showLoading(button: HTMLButtonElement | null, labelEl: HTMLElement | null) {
      if (!button || !labelEl) return;
      button.disabled = true;
      const original = labelEl.textContent || "";
      labelEl.textContent = "";
      const s = document.createElement("span");
      s.className = "spinner";
      labelEl.parentNode?.insertBefore(s, labelEl);
      setTimeout(() => {
        s.remove();
        labelEl.textContent = original;
        button.disabled = false;
        closeModal();
      }, 900);
    }

    if (signupBtn)
      signupBtn.addEventListener("click", () => {
        showLoading(signupBtn, document.getElementById("signupLabel"));
      });
    if (loginBtn)
      loginBtn.addEventListener("click", () => {
        showLoading(loginBtn, document.getElementById("loginLabel"));
      });

    openBtns.forEach((btn) =>
      btn &&
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
      })
    );
    if (closeAuth) closeAuth.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
      if (e.target === authModal) closeModal();
    });
    if (tabSignup) tabSignup.addEventListener("click", showSignup);
    if (tabLogin) tabLogin.addEventListener("click", showLogin);
    if (tabSignup)
      tabSignup.addEventListener("keydown", (e) => {
        if ((e as KeyboardEvent).key === "Enter" || (e as KeyboardEvent).key === " ") showSignup();
      });
    if (tabLogin)
      tabLogin.addEventListener("keydown", (e) => {
        if ((e as KeyboardEvent).key === "Enter" || (e as KeyboardEvent).key === " ") showLogin();
      });

    document.addEventListener("keydown", (e) => {
      if ((e as KeyboardEvent).key === "Escape") closeModal();
      if ((e as KeyboardEvent).key === "Enter") {
        const active = document.activeElement;
        if (signupForm && signupForm.contains(active) && !signupBtn?.disabled) signupBtn?.click();
        if (loginForm && loginForm.contains(active) && !loginBtn?.disabled) loginBtn?.click();
      }
    });

    if (authModal) authModal.addEventListener("pointerdown", (e) => {});

    // clean up on unmount
    return () => {
      // remove listeners we added where possible
      try {
        if (googleSignupBtn)
          googleSignupBtn.removeEventListener("click", () => {
            window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
              redirectUrl
            )}`;
          });
        if (googleLoginBtn)
          googleLoginBtn.removeEventListener("click", () => {
            window.location.href = `${supabaseProjectUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
              redirectUrl
            )}`;
          });
      } catch (err) {}
    };
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{` 
:root{
  --accent-start:#1F73FF;
  --accent-end:#000000;
  --accent-grad:linear-gradient(90deg,var(--accent-start),var(--accent-end));
  --bg:#ffffff;
  --muted:#ffffff;
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
  background:var(--muted);
  color:var(--text);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
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
.wrap{max-width:var(--maxw);margin:28px auto;padding:20px}
h1{font-size:64px;color:#1a1a1a;text-align:center;margin-bottom:8px}
h1 span{font-weight:700}
h2{font-size:24px;margin-top:30px;margin-bottom:10px;background:var(--accent-grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
p, li{font-size:16px;margin-bottom:10px}
p.opacity{opacity:0.75;text-align:center;margin-bottom:40px}
ul{padding-left:20px;margin-bottom:20px}
a.contact-link{background:none;color:var(--accent-start);background:var(--accent-grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none}
footer{background:var(--surface);text-align:center;padding:24px;font-size:14px;opacity:0.8;display:flex;justify-content:center;gap:24px;flex-wrap:wrap}
footer a{text-decoration:none;color:#000;font-weight:500}

.popup{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.28);backdrop-filter:blur(1.5px);justify-content:center;align-items:center;z-index:1200;padding:20px}
.popup-content{background:#fff;border-radius:16px;box-shadow:0 28px 80px rgba(8,20,12,0.18);max-width:560px;width:100%;padding:56px 40px;display:flex;flex-direction:column;gap:12px;position:relative;min-width:320px}
.popup-icon{display:flex;justify-content:center;align-items:center;width:48px;height:48px;margin-bottom:2px;align-self:center;opacity:0.55;background:transparent;box-shadow:none}
.popup-icon svg{width:48px;height:48px}
.popup-content h3{margin:0;font-size:26px;font-weight:800;color:#000;text-align:center}
.tabs{display:flex;gap:36px;justify-content:center;margin-top:10px;border-bottom:1px solid #e6e6e6;padding-bottom:8px}
.tab{font-weight:800;font-size:15px;cursor:pointer;color:#6b6b6b;padding:8px 4px;position:relative}
.tab.active{color:#000}
.tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-12px;height:3px;border-radius:3px;background:var(--accent-grad)}
.form{display:flex;flex-direction:column;gap:12px;margin-top:8px}
.input-wrap{position:relative}
.input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:18px;height:18px;opacity:0.9}
.form input{width:100%;padding:12px 14px 12px 42px;border-radius:10px;border:1px solid #e6e6e6;font-size:15px;outline:none;transition:border-color .12s ease,box-shadow .08s ease}
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
        <div className="logo" onClick={() => (window.location.href = "/")}>
          COMPLIE
        </div>
        <div className="nav-links">
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <button className="cta" id="openModal">
          Try Complie Now
        </button>
      </nav>

      <div className="wrap">
        <h1>
          <span>Terms of Service</span>
        </h1>
        <p className="opacity">Last updated: August 25, 2025</p>

        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using the services provided by Complie, you agree to be bound by these Terms of Service ("TOS"). If you do not agree to these terms, please do not use our services.
        </p>

        <h2>Description of Service</h2>
        <p>
          Complie is a platform designed to help freelancers track and manage compliance requirements efficiently. Our services allow users to automate tracking, manage client data, receive reminders, and maintain organized records to simplify freelance work.
        </p>

        <h2>Use of Service</h2>
        <p>
          You agree to use Complie’s services only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else’s use and enjoyment of the service. Complie grants you a non-exclusive, non-transferable, limited right to access and use the services for your personal freelance work, subject to these TOS.
        </p>

        <h2>User Conduct</h2>
        <p>You are solely responsible for any data you input or manage while using Complie and for the consequences of your actions.</p>
        <ul>
          <li>You agree not to upload, transmit, or share any unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or objectionable content.</li>
          <li>Interfere with the operation of Complie or introduce any malicious software.</li>
          <li>Share your login credentials or allow unauthorized access to your account.</li>
        </ul>

        <h2>Intellectual Property</h2>
        <ul>
          <li>You retain all ownership rights to your data and content within Complie.</li>
          <li>Complie owns all rights to the platform, software, applications, and associated intellectual property.</li>
          <li>By using Complie, you grant us a worldwide, non-exclusive, royalty-free license to use any feedback or suggestions you provide in connection with improving the service.</li>
        </ul>

        <h2>Termination</h2>
        <p>Complie reserves the right to terminate your access to the services without notice for any breach of these TOS.</p>

        <h2>Disclaimer of Warranties</h2>
        <p>The services are provided "as is" and "as available" without warranty of any kind, either express or implied. Complie does not guarantee uninterrupted, error-free, or secure access to the platform.</p>

        <h2>Age Restriction</h2>
        <p>
          Complie is intended for use by individuals 16 years of age or older. By using our services, you represent that you meet this minimum age requirement. If we become aware that a user is under 18, we reserve the right to terminate their account and access to our services immediately.
        </p>

        <h2>Limitation of Liability</h2>
        <p>Complie shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from your use of the service.</p>

        <h2>Changes to Terms</h2>
        <p>Complie reserves the right to modify these TOS at any time. Your continued use of the service after such changes constitutes your acceptance of the new TOS.</p>

        <h2>Governing Law</h2>
        <p>
          These TOS and your use of the services are governed by the laws of the jurisdiction where Crayo AI is established, without regard to its conflict of law provisions.
        </p>

        <h2>Contact Information</h2>
        <p>
          Email: <a className="contact-link" href="mailto:Liana.digital18@gmail.com">Liana.digital18@gmail.com</a>
        </p>
        <p>
          Discord:{" "}
          <a className="contact-link" href="https://discord.gg/9HdmMjbQXW" target="_blank" rel="noreferrer">
            Complie Discord Server
          </a>
        </p>
      </div>

      <footer>
        <Link to="/privacypolicy">Privacy Policy</Link>
        <Link to="/refundpolicy">Refund Policy</Link>
        <Link to="/termsofservice">Terms of Service</Link>
      </footer>

      <div className="popup" id="authModal">
        <div className="popup-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button className="close-btn" id="closeAuth" aria-label="Close">
            ×
          </button>
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
            <div className="tab active" id="tabSignup" role="tab" tabIndex={0} aria-selected="true">
              Create account
            </div>
            <div className="tab" id="tabLogin" role="tab" tabIndex={0} aria-selected="false">
              Login
            </div>
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
            <div className="divider">
              <span className="or-pill">OR</span>
            </div>
            <div className="social-btn" id="googleSignup">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" />
              Continue with Google
            </div>
            <div className="legal">
              By creating an account you agree to our <a href="termsofservice.html">Terms</a> and <a href="privacypolicy.html">Privacy Policy</a>.
            </div>
          </form>

          <form id="loginForm" className="form" style={{ display: "none" }} autoComplete="on" noValidate>
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
            <div className="divider">
              <span className="or-pill">OR</span>
            </div>
            <div className="social-btn" id="googleLogin">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo" alt="Google logo" />
              Continue with Google
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
