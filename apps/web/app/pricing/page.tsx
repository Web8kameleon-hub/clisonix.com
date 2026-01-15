'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * PRICING PAGE - Clear, Transparent Pricing
 * SEO-optimized with trust signals
 */

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individuals and small projects',
      price: { monthly: 0, annual: 0 },
      features: [
        '10,000 API calls/month',
        'Basic ASI Trinity access',
        '3 modules included',
        'Community support',
        '99.5% uptime SLA',
        'Standard latency'
      ],
      cta: 'Start Free',
      highlighted: false,
      badge: null
    },
    {
      name: 'Professional',
      description: 'For growing teams and production workloads',
      price: { monthly: 19, annual: 180 },
      features: [
        '🎁 6 MONTHS FREE for early adopters',
        '100,000 API calls/month',
        'Full ASI Trinity access',
        'All 15+ modules',
        'Priority email support',
        '99.9% uptime SLA',
        'Sub-100ms latency',
        'Custom dashboards'
      ],
      cta: 'Start Free 6 Months',
      highlighted: true,
      badge: '6 Months Free'
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      price: { monthly: 49, annual: 490 },
      features: [
        'Unlimited API calls',
        'Dedicated ASI Trinity cluster',
        'All modules + custom',
        '24/7 phone & Slack support',
        '99.99% uptime SLA',
        'Private edge locations',
        'SSO & advanced security',
        'Custom SLA terms',
        'Dedicated account manager',
        'On-premise option'
      ],
      cta: 'Contact Sales',
      highlighted: false,
      badge: 'Custom'
    }
  ];

  const faqs = [
    {
      q: 'Can I try Clisonix before committing?',
      a: 'Yes! Our Starter plan is completely free forever. Professional plan includes 6 MONTHS FREE for early adopters - no credit card required.'
    },
    {
      q: 'What happens if I exceed my API limits?',
      a: 'We\'ll notify you at 80% usage. You can upgrade anytime, or we\'ll throttle requests gracefully - never hard cuts that break your application.'
    },
    {
      q: 'Is there a contract or commitment?',
      a: 'No contracts for Starter or Professional. Month-to-month, cancel anytime. Enterprise plans have flexible terms based on your needs.'
    },
    {
      q: 'Do you offer discounts for startups or academia?',
      a: 'Yes! Startups get 50% off Professional for the first year. Academic institutions receive special pricing - contact us for details.'
    },
    {
      q: 'What\'s included in the ASI Trinity?',
      a: 'ASI Trinity includes ALBA (Network Intelligence), ALBI (Neural Processing), and JONA (Data Coordination) - three synchronized AI systems working together.'
    },
    {
      q: 'How do I get support?',
      a: 'Starter: Community forums. Professional: Priority email with <4 hour response. Enterprise: 24/7 phone, Slack, and dedicated account manager.'
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
            <Link href="/modules" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors">
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
              billing === 'monthly' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              billing === 'annual' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
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
                  ? 'bg-gradient-to-b from-cyan-500/20 to-slate-800 border-2 border-cyan-500'
                  : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-sm font-medium">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold">
                  ${billing === 'monthly' ? plan.price.monthly : Math.round(plan.price.annual / 12)}
                </span>
                <span className="text-gray-400">/month</span>
                {billing === 'annual' && plan.price.annual > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    Billed ${plan.price.annual}/year
                  </div>
                )}
              </div>

              <Link
                href={plan.name === 'Enterprise' ? 'mailto:investors@clisonix.com' : '/modules'}
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-colors mb-8 ${
                  plan.highlighted
                    ? 'bg-cyan-600 hover:bg-cyan-500'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">✓</span>
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
          <Link href="/security" className="hover:text-cyan-400 ml-2">Security</Link> | 
          <Link href="/status" className="hover:text-cyan-400 ml-2">Status</Link> | 
          <Link href="/company" className="hover:text-cyan-400 ml-2">Company</Link>
        </div>
      </footer>
    </div>
  );
}
