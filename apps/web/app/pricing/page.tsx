'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * PRICING PAGE - Stripe Checkout Integration
 * 
 * Plans:
 * - Free: 10 articles, basic access
 * - Pro: €9.99/month - All 63+ articles, Curiosity Ocean, priority support
 * - Team: €29.99/month - Everything + team features
 */

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (planKey: string) => {
    if (planKey === 'starter') {
      // Free plan - redirect to sign up
      router.push('/sign-up');
      return;
    }
    
    if (planKey === 'enterprise') {
      // Enterprise - contact sales
      window.location.href = 'mailto:investors@clisonix.com?subject=Enterprise Plan Inquiry';
      return;
    }

    setLoading(planKey);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          interval: billing === 'monthly' ? 'monthly' : 'yearly',
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.error === 'Unauthorized') {
        // Not logged in - redirect to sign in
        router.push('/sign-in?redirect_url=/pricing');
      } else {
        console.error('Checkout error:', data.error);
        alert('Unable to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unable to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      key: 'starter',
      name: 'Free',
      description: 'Perfect for exploring Clisonix',
      price: { monthly: 0, annual: 0 },
      features: [
        '10 Research Articles',
        'Basic Curiosity Ocean access',
        '1,000 API calls/month',
        'Community support',
        'Standard latency'
      ],
      cta: 'Start Free',
      highlighted: false,
      badge: null
    },
    {
      key: 'professional',
      name: 'Pro',
      description: 'Full access to all features',
      price: { monthly: 9.99, annual: 99 },
      features: [
        '✨ All 63+ Research Articles',
        '🧠 Full Curiosity Ocean AI',
        '🔧 All 15+ Modules',
        '50,000 API calls/month',
        'Priority email support',
        '99.9% uptime SLA',
        'Camera & Mic tools',
        'Document analysis'
      ],
      cta: 'Subscribe Now',
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      key: 'enterprise',
      name: 'Team',
      description: 'For teams and organizations',
      price: { monthly: 29.99, annual: 299 },
      features: [
        'Everything in Pro',
        'Unlimited API calls',
        '5 team members',
        '24/7 priority support',
        'Custom integrations',
        'SSO & advanced security',
        'Dedicated account manager',
        'SLA guarantees'
      ],
      cta: 'Contact Sales',
      highlighted: false,
      badge: 'Teams'
    }
  ];

  const faqs = [
    {
      q: 'Can I try Clisonix before paying?',
      a: 'Absolutely! The Free plan gives you access to 10 research articles and basic Curiosity Ocean features forever - no credit card required.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, Mastercard, American Express), SEPA bank transfers, and PayPal through our secure Stripe payment system.'
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes! No contracts, no commitments. Cancel your subscription anytime and you\'ll keep access until the end of your billing period.'
    },
    {
      q: 'What\'s included in the 63+ articles?',
      a: 'Our research articles cover EEG analysis, industrial AI, FDA compliance, neural networks, and more. New articles are added monthly.'
    },
    {
      q: 'What is Curiosity Ocean?',
      a: 'Curiosity Ocean is our AI assistant powered by advanced language models. It can analyze documents, answer questions, and help with research using camera and microphone tools.'
    },
    {
      q: 'Do you offer refunds?',
      a: 'Yes, we offer a 14-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold">Clisonix</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/why-clisonix" className="text-gray-400 hover:text-white transition-colors">Why Clisonix</Link>
            <Link href="/platform" className="text-gray-400 hover:text-white transition-colors">Platform</Link>
            <Link href="/modules" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors">
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Start free, scale as you grow. No hidden fees, no surprises.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 p-1 rounded-xl bg-slate-800">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              billing === 'monthly' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              billing === 'annual' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Annual <span className="text-green-400 text-sm ml-1">Save 17%</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-violet-500/20 to-slate-800 border-2 border-violet-500'
                  : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-violet-500 text-sm font-medium">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold">
                  €{billing === 'monthly' ? plan.price.monthly : Math.round(plan.price.annual / 12)}
                </span>
                <span className="text-gray-400">/month</span>
                {billing === 'annual' && plan.price.annual > 0 && (
                  <div className="text-sm text-green-400 mt-1">
                    Save €{(plan.price.monthly * 12 - plan.price.annual).toFixed(0)}/year
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading === plan.key}
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-colors mb-8 disabled:opacity-50 ${
                  plan.highlighted
                    ? 'bg-violet-600 hover:bg-violet-500'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {loading === plan.key ? 'Loading...' : plan.cta}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-violet-400 mt-0.5">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold">99.97%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">&lt;100ms</div>
              <div className="text-sm text-gray-400">Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">SOC2</div>
              <div className="text-sm text-gray-400">Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">GDPR</div>
              <div className="text-sm text-gray-400">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
        <p className="text-gray-400 mb-8">Our team is here to help you find the perfect plan.</p>
        <Link
          href="mailto:support@clisonix.com"
          className="inline-flex px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors"
        >
          Contact Support
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          © 2026 Clisonix. All rights reserved. | 
          <Link href="/security" className="hover:text-violet-400 ml-2">Security</Link> | 
          <Link href="/status" className="hover:text-violet-400 ml-2">Status</Link> | 
          <Link href="/company" className="hover:text-violet-400 ml-2">Company</Link>
        </div>
      </footer>
    </div>
  );
}







