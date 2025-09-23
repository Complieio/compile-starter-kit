import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex justify-between items-center p-4 md:px-10 bg-card shadow-sm">
        <Link to="/" className="text-2xl font-bold text-foreground">COMPLIE</Link>
        <div className="flex gap-8 items-center">
          <Link to="/pre-login/features" className="text-foreground hover:text-complie-accent">Features</Link>
          <Link to="/pricing" className="text-foreground hover:text-complie-accent font-semibold">Pricing</Link>
          <Link to="/faq" className="text-foreground hover:text-complie-accent">FAQ</Link>
          <Link to="/" className="bg-gradient-to-r from-complie-primary to-complie-accent text-primary-foreground px-6 py-2 rounded-full font-semibold hover:opacity-90">
            Try Complie Now
          </Link>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Simple Pricing
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
          Choose the plan that works best for your freelance business
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-4">Free</h3>
            <div className="text-4xl font-bold text-foreground mb-4">$0<span className="text-lg text-muted-foreground">/month</span></div>
            <ul className="text-left space-y-3 text-muted-foreground mb-8">
              <li>✓ Up to 3 projects</li>
              <li>✓ Basic task management</li>
              <li>✓ Client management</li>
              <li>✓ Simple reporting</li>
            </ul>
            <Link to="/" className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-semibold hover:opacity-90 block text-center">
              Get Started
            </Link>
          </div>

          <div className="bg-gradient-to-br from-complie-primary to-complie-accent text-primary-foreground rounded-lg p-8 shadow-lg transform scale-105">
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <div className="text-4xl font-bold mb-4">$19<span className="text-lg opacity-80">/month</span></div>
            <ul className="text-left space-y-3 opacity-90 mb-8">
              <li>✓ Unlimited projects</li>
              <li>✓ Advanced task management</li>
              <li>✓ Time tracking</li>
              <li>✓ Detailed analytics</li>
              <li>✓ Priority support</li>
            </ul>
            <Link to="/" className="w-full bg-white text-complie-primary py-3 rounded-lg font-semibold hover:opacity-90 block text-center">
              Start Free Trial
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-card text-center py-6 px-4 border-t border-border">
        <div className="flex justify-center gap-6 flex-wrap text-sm text-muted-foreground">
          <Link to="/privacypolicy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/refundpolicy" className="hover:text-foreground">Refund Policy</Link>
          <Link to="/termsofservice" className="hover:text-foreground">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;