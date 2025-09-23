import { Link } from "react-router-dom";
import { useState } from "react";

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Complie?",
      answer: "Complie is a comprehensive project management tool designed specifically for freelancers to track clients, projects, deadlines, and generate reports."
    },
    {
      question: "Is there a free plan?",
      answer: "Yes! We offer a free plan that includes up to 3 projects and basic features to get you started."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
    },
    {
      question: "How does the time tracking work?",
      answer: "Our time tracking feature allows you to track time spent on different tasks and projects, with detailed reporting and analytics."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take security seriously. All data is encrypted and stored securely with regular backups."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex justify-between items-center p-4 md:px-10 bg-card shadow-sm">
        <Link to="/" className="text-2xl font-bold text-foreground">COMPLIE</Link>
        <div className="flex gap-8 items-center">
          <Link to="/pre-login/features" className="text-foreground hover:text-complie-accent">Features</Link>
          <Link to="/pricing" className="text-foreground hover:text-complie-accent">Pricing</Link>
          <Link to="/faq" className="text-foreground hover:text-complie-accent font-semibold">FAQ</Link>
          <Link to="/" className="bg-gradient-to-r from-complie-primary to-complie-accent text-primary-foreground px-6 py-2 rounded-full font-semibold hover:opacity-90">
            Try Complie Now
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about Complie
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-6 hover:bg-muted transition-colors duration-200 flex justify-between items-center"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <span className="text-lg font-semibold text-foreground">{faq.question}</span>
                <span className="text-2xl text-muted-foreground">
                  {openFAQ === index ? "−" : "+"}
                </span>
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-6 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
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

export default FAQ;