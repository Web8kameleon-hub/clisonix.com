import React, { useState } from 'react';

/**
 * 🔷 CLISONIX PRICING PAGE COMPONENT
 * ===================================
 * Clisonix Deterministic SaaS Protocol
 * 
 * Pricing:
 * - Starter: €29/month
 * - Pro: €0.10/endpoint/day (pay-as-consume)
 * - Enterprise: Custom
 */

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  priceSubtext: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
}

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans: PricingPlan[] = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? '€29' : '€290',
      priceSubtext: billingCycle === 'monthly' ? '/month' : '/year (save €58)',
      description: 'Perfect for small projects and startups getting started with API governance.',
      features: [
        { text: '5 API endpoints', included: true },
        { text: '10,000 requests/day', included: true },
        { text: 'Excel ∞ Dashboard', included: true },
        { text: 'Protocol Kitchen (7 layers)', included: true },
        { text: 'Basic ASI metrics', included: true },
        { text: 'Email support', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false },
        { text: 'Custom integrations', included: false },
        { text: 'SLA guarantee', included: false },
      ],
      cta: 'Start Free Trial',
      ctaLink: '/signup?plan=starter',
    },
    {
      name: 'Pro',
      price: '€0.10',
      priceSubtext: '/endpoint/day',
      description: 'Pay-as-you-consume pricing for growing teams with dynamic workloads.',
      features: [
        { text: 'Unlimited endpoints', included: true },
        { text: 'Unlimited requests', included: true },
        { text: 'Excel ∞ Dashboard', included: true },
        { text: 'Protocol Kitchen (7 layers)', included: true },
        { text: 'Full ASI Trinity metrics', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Webhook notifications', included: true },
        { text: 'Custom integrations', included: false },
        { text: 'SLA guarantee', included: false },
      ],
      cta: 'Start Pro Trial',
      ctaLink: '/signup?plan=pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      priceSubtext: 'Contact sales',
      description: 'For large organizations requiring dedicated infrastructure and custom SLAs.',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Dedicated infrastructure', included: true },
        { text: 'Custom SLA (up to 99.99%)', included: true },
        { text: 'On-premise deployment option', included: true },
        { text: '24/7 dedicated support', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Security audit reports', included: true },
        { text: 'Training & onboarding', included: true },
        { text: 'Volume discounts', included: true },
        { text: 'Dedicated account manager', included: true },
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact?inquiry=enterprise',
    },
  ];

  const faqs = [
    {
      question: 'What is pay-as-you-consume pricing?',
      answer: 'With our Pro plan, you only pay €0.10 per endpoint per day that you use. If you have 10 active endpoints for a month, that\'s €3/day or ~€90/month. Unused days are not charged.',
    },
    {
      question: 'Can I switch plans at any time?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, the new features are available immediately. When downgrading, the change takes effect at the end of your billing cycle.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, all plans come with a 14-day free trial. No credit card required for Starter. You can explore all features before committing.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) via Stripe, PayPal, and bank transfers for Enterprise customers.',
    },
    {
      question: 'What happens if I exceed my rate limits?',
      answer: 'On the Starter plan, requests beyond your limit will receive a 429 error. On Pro, there are no rate limits—you simply pay for what you use. We\'ll send usage alerts at 80% and 90% of your typical usage.',
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer: 'Yes! Annual billing on the Starter plan saves you 2 months (€58). Enterprise customers can negotiate custom annual agreements with additional discounts.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <span className="text-3xl">🔷</span>
            <span className="text-xl font-bold text-white">Clisonix</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="/pricing" className="text-white font-medium">Pricing</a>
            <a href="/docs" className="text-gray-300 hover:text-white transition">Docs</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-white hover:text-blue-300 transition">Log in</a>
            <a href="/signup" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Start free, scale as you grow. No hidden fees, no surprises.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 bg-white/10 rounded-full p-1 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full font-medium transition ${
              billingCycle === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-full font-medium transition ${
              billingCycle === 'annual'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Annual
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-b from-blue-500/20 to-blue-600/10 border-2 border-blue-500'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className={`text-lg font-semibold mb-2 ${plan.popular ? 'text-blue-400' : 'text-gray-400'}`}>
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.priceSubtext}</span>
              </div>

              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className={feature.included ? 'text-green-400' : 'text-gray-600'}>
                      {feature.included ? '✓' : '—'}
                    </span>
                    <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaLink}
                className={`block w-full text-center py-3 rounded-lg font-medium transition ${
                  plan.popular
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compare Plans
          </h2>

          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium p-4">Feature</th>
                  <th className="text-center text-gray-400 font-medium p-4">Starter</th>
                  <th className="text-center text-blue-400 font-medium p-4 bg-blue-500/10">Pro</th>
                  <th className="text-center text-gray-400 font-medium p-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'API Endpoints', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Requests/Day', starter: '10,000', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Excel ∞ Dashboard', starter: '✓', pro: '✓', enterprise: '✓' },
                  { feature: 'Protocol Kitchen', starter: '✓', pro: '✓', enterprise: '✓' },
                  { feature: 'ASI Trinity Metrics', starter: 'Basic', pro: 'Full', enterprise: 'Full + Custom' },
                  { feature: 'Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
                  { feature: 'Support', starter: 'Email', pro: 'Priority', enterprise: '24/7 Dedicated' },
                  { feature: 'SLA', starter: '—', pro: '99.9%', enterprise: 'Up to 99.99%' },
                  { feature: 'On-Premise Option', starter: '—', pro: '—', enterprise: '✓' },
                  { feature: 'Custom Integrations', starter: '—', pro: '—', enterprise: '✓' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="text-gray-300 p-4">{row.feature}</td>
                    <td className="text-center text-gray-400 p-4">{row.starter}</td>
                    <td className="text-center text-white p-4 bg-blue-500/5">{row.pro}</td>
                    <td className="text-center text-gray-400 p-4">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Usage Calculator */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            💡 Estimate Your Pro Cost
          </h2>
          <div className="space-y-6">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Active Endpoints</label>
              <input
                type="range"
                min="1"
                max="100"
                defaultValue="10"
                className="w-full"
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const monthly = val * 0.10 * 30;
                  const display = document.getElementById('cost-display');
                  const count = document.getElementById('endpoint-count');
                  if (display) display.textContent = `€${monthly.toFixed(0)}`;
                  if (count) count.textContent = val.toString();
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>1</span>
                <span id="endpoint-count" className="text-blue-400 font-medium">10</span>
                <span>100</span>
              </div>
            </div>
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm">Estimated Monthly Cost</p>
              <p id="cost-display" className="text-4xl font-bold text-white">€30</p>
              <p className="text-gray-500 text-xs mt-2">Based on €0.10/endpoint/day × 30 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer text-white font-medium hover:bg-white/5">
                  {faq.question}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-gray-400">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl border border-blue-500/20 p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Join 100+ teams using Clisonix to ship deterministic, validated APIs.
            Start your 14-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/signup"
              className="bg-white text-slate-900 text-lg px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="bg-transparent text-white text-lg px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/10 transition"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-2xl">🔷</span>
            <span className="text-lg font-bold text-white">Clisonix</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Clisonix GmbH. All rights reserved. Nuremberg, Germany.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
