/**
 * Clisonix User Account & Billing Dashboard
 * Manage subscriptions, billing, profile settings
 */

"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  company?: string
  phone?: string
  timezone: string
  language: string
  createdAt: string
}

interface Subscription {
  id: string
  plan: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  amount: number
  currency: string
  interval: 'month' | 'year'
}

interface Invoice {
  id: string
  date: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  pdfUrl?: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'bank'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '3 Data Sources',
      '1,000 Data Points/month',
      'Basic Analytics',
      'Community Support',
      '7-day Data Retention'
    ],
    color: 'gray'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: [
      '10 Data Sources',
      '50,000 Data Points/month',
      'Advanced Analytics',
      'Email Support',
      '30-day Data Retention',
      'API Access',
      'Excel Export'
    ],
    color: 'blue',
    popular: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited Data Sources',
      '500,000 Data Points/month',
      'Real-time Analytics',
      'Priority Support',
      '1-year Data Retention',
      'Full API Access',
      'All Export Formats',
      'Custom Dashboards',
      'Team Collaboration (5 users)'
    ],
    color: 'purple',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    features: [
      'Unlimited Everything',
      'Dedicated Infrastructure',
      '24/7 Phone Support',
      'Unlimited Data Retention',
      'SSO & SAML',
      'Custom Integrations',
      'SLA Guarantee',
      'Unlimited Team Members',
      'On-premise Option'
    ],
    color: 'orange'
  }
]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'subscription' | 'security' | 'settings'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  
  // Demo data
  const [user, setUser] = useState<User>({
    id: 'usr_001',
    name: 'Demo User',
    email: 'demo@clisonix.com',
    plan: 'starter',
    company: 'Clisonix Demo',
    phone: '+355 69 123 4567',
    timezone: 'Europe/Tirane',
    language: 'sq',
    createdAt: '2025-06-15T10:00:00Z'
  })

  const [subscription, setSubscription] = useState<Subscription>({
    id: 'sub_001',
    plan: 'Starter',
    status: 'active',
    currentPeriodStart: '2026-01-01T00:00:00Z',
    currentPeriodEnd: '2026-02-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    amount: 29,
    currency: 'EUR',
    interval: 'month'
  })

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'inv_003', date: '2026-01-01', amount: 29, currency: 'EUR', status: 'paid' },
    { id: 'inv_002', date: '2025-12-01', amount: 29, currency: 'EUR', status: 'paid' },
    { id: 'inv_001', date: '2025-11-01', amount: 29, currency: 'EUR', status: 'paid' }
  ])

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'pm_001', type: 'card', last4: '4242', brand: 'Visa', expiryMonth: 12, expiryYear: 2027, isDefault: true }
  ])

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500)
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'paid': return 'text-green-400 bg-green-400/10'
      case 'trialing': return 'text-blue-400 bg-blue-400/10'
      case 'canceled': return 'text-red-400 bg-red-400/10'
      case 'past_due': return 'text-yellow-400 bg-yellow-400/10'
      case 'pending': return 'text-yellow-400 bg-yellow-400/10'
      case 'failed': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'from-gray-500 to-gray-600'
      case 'starter': return 'from-blue-500 to-blue-600'
      case 'professional': return 'from-purple-500 to-purple-600'
      case 'enterprise': return 'from-orange-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Duke ngarkuar llogarinë...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/modules" className="text-gray-400 hover:text-white transition-colors">
                ← Kthehu
              </Link>
              <div className="w-px h-6 bg-white/20"></div>
              <h1 className="text-xl font-semibold">👤 Llogaria Ime</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getPlanColor(user.plan)}`}>
                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
              {user.company && <p className="text-gray-500 text-sm mt-1">🏢 {user.company}</p>}
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              ✏️ Modifiko Profilin
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: '📊 Përmbledhje', icon: '📊' },
            { id: 'subscription', label: '💳 Abonimi', icon: '💳' },
            { id: 'billing', label: '🧾 Faturimi', icon: '🧾' },
            { id: 'security', label: '🔒 Siguria', icon: '🔒' },
            { id: 'settings', label: '⚙️ Cilësimet', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Plan */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Plani Aktual</h3>
              <div className={`p-4 rounded-xl bg-gradient-to-r ${getPlanColor(user.plan)} mb-4`}>
                <div className="text-2xl font-bold">{subscription.plan}</div>
                <div className="text-white/80">€{subscription.amount}/{subscription.interval === 'month' ? 'muaj' : 'vit'}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Statusi:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(subscription.status)}`}>
                    {subscription.status === 'active' ? 'Aktiv' : subscription.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Përfundon:</span>
                  <span>{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
              >
                🚀 Upgrade Plan
              </button>
            </div>

            {/* Usage Stats */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Përdorimi i Muajit</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Data Sources</span>
                    <span>3 / 10</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Data Points</span>
                    <span>12,450 / 50,000</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">API Calls</span>
                    <span>8,234 / 100,000</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Storage</span>
                    <span>156 MB / 5 GB</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Veprime të Shpejta</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                  <span className="text-2xl">📥</span>
                  <div>
                    <div className="font-medium">Shkarko Faturat</div>
                    <div className="text-sm text-gray-400">PDF për të gjitha faturat</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                  <span className="text-2xl">🔑</span>
                  <div>
                    <div className="font-medium">API Keys</div>
                    <div className="text-sm text-gray-400">Menaxho çelësat API</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="font-medium">Team Members</div>
                    <div className="text-sm text-gray-400">Shto anëtarë të ekipit</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                  <span className="text-2xl">📞</span>
                  <div>
                    <div className="font-medium">Kontakto Support</div>
                    <div className="text-sm text-gray-400">Ndihë 24/7</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Current Subscription */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Abonimi Aktual</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Plani</div>
                  <div className="text-xl font-bold">{subscription.plan}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Çmimi</div>
                  <div className="text-xl font-bold">€{subscription.amount}<span className="text-sm font-normal text-gray-400">/{subscription.interval === 'month' ? 'muaj' : 'vit'}</span></div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Statusi</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(subscription.status)}`}>
                    {subscription.status === 'active' ? '✓ Aktiv' : subscription.status}
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Rinovohet</div>
                  <div className="text-xl font-bold">{formatDate(subscription.currentPeriodEnd)}</div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                >
                  🚀 Upgrade
                </button>
                <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors">
                  Ndrysho në Vjetor (2 muaj falas)
                </button>
                <button className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors">
                  Anulo Abonimin
                </button>
              </div>
            </div>

            {/* Available Plans */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Planet e Disponueshme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map(plan => (
                  <div 
                    key={plan.id}
                    className={`relative p-6 rounded-2xl border transition-all ${
                      user.plan === plan.id 
                        ? 'bg-blue-600/20 border-blue-500' 
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 rounded-full text-xs font-medium">
                        🔥 Më Popullor
                      </div>
                    )}
                    <div className="text-lg font-bold mb-2">{plan.name}</div>
                    <div className="text-3xl font-bold mb-4">
                      €{plan.price}
                      <span className="text-sm font-normal text-gray-400">/muaj</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-green-400">✓</span>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-sm text-gray-500">+{plan.features.length - 5} më shumë...</li>
                      )}
                    </ul>
                    {user.plan === plan.id ? (
                      <button disabled className="w-full py-2 bg-white/10 rounded-lg font-medium text-gray-400 cursor-not-allowed">
                        Plani Aktual
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedPlan(plan.id)
                          setShowUpgradeModal(true)
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                      >
                        {PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === user.plan) ? 'Upgrade' : 'Downgrade'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Metodat e Pagesës</h3>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                  + Shto Metodë
                </button>
              </div>
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {method.type === 'card' ? '💳' : method.type === 'paypal' ? '🅿️' : '🏦'}
                      </div>
                      <div>
                        <div className="font-medium">
                          {method.brand} •••• {method.last4}
                        </div>
                        <div className="text-sm text-gray-400">
                          Skadon {method.expiryMonth}/{method.expiryYear}
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                        Modifiko
                      </button>
                      <button className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors">
                        Fshi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Adresa e Faturimit</h3>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors">
                  ✏️ Modifiko
                </button>
              </div>
              <div className="text-gray-300">
                <p>{user.name}</p>
                <p>{user.company}</p>
                <p>Rruga Demo 123</p>
                <p>Tiranë, 1001</p>
                <p>Shqipëri</p>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Historia e Faturave</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                      <th className="pb-3 font-medium">Fatura</th>
                      <th className="pb-3 font-medium">Data</th>
                      <th className="pb-3 font-medium">Shuma</th>
                      <th className="pb-3 font-medium">Statusi</th>
                      <th className="pb-3 font-medium">Veprime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="border-b border-white/5">
                        <td className="py-4 font-mono text-sm">{invoice.id}</td>
                        <td className="py-4">{formatDate(invoice.date)}</td>
                        <td className="py-4 font-medium">€{invoice.amount}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                            {invoice.status === 'paid' ? 'Paguar' : invoice.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                            📥 Shkarko PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">🔐 Fjalëkalimi</h3>
              <p className="text-gray-400 mb-4">Ndryshuar së fundmi: 15 Dhjetor 2025</p>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                Ndrysho Fjalëkalimin
              </button>
            </div>

            {/* Two-Factor Auth */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">🛡️ Autentifikimi 2-Faktorësh</h3>
                  <p className="text-gray-400">Shto një shtresë ekstra sigurie për llogarinë tënde</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">Joaktiv</span>
                  <button className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors">
                    Aktivizo
                  </button>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">📱 Sesionet Aktive</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">💻</span>
                    <div>
                      <div className="font-medium">Windows • Chrome</div>
                      <div className="text-sm text-gray-400">Tiranë, Shqipëri • Tani</div>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Sesioni Aktual
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">📱</span>
                    <div>
                      <div className="font-medium">iPhone • Safari</div>
                      <div className="text-sm text-gray-400">Tiranë, Shqipëri • 2 orë më parë</div>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors">
                    Përfundo Sesionin
                  </button>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors">
                Përfundo të Gjitha Sesionet e Tjera
              </button>
            </div>

            {/* API Keys */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🔑 API Keys</h3>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                  + Gjenero Key të Ri
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-medium font-mono">sk_live_****************************1234</div>
                    <div className="text-sm text-gray-400">Krijuar: 10 Janar 2026 • Përdorur: 5 min më parë</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                      Kopjo
                    </button>
                    <button className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors">
                      Revoko
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">👤 Informacionet e Profilit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Emri i Plotë</label>
                  <input 
                    type="text" 
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Kompania</label>
                  <input 
                    type="text" 
                    value={user.company || ''}
                    onChange={(e) => setUser({...user, company: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telefoni</label>
                  <input 
                    type="tel" 
                    value={user.phone || ''}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                Ruaj Ndryshimet
              </button>
            </div>

            {/* Preferences */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">⚙️ Preferencat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gjuha</label>
                  <select 
                    value={user.language}
                    onChange={(e) => setUser({...user, language: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="sq">🇦🇱 Shqip</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="it">🇮🇹 Italiano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Zona Kohore</label>
                  <select 
                    value={user.timezone}
                    onChange={(e) => setUser({...user, timezone: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Europe/Tirane">Europe/Tirane (CET)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">🔔 Njoftimet</h3>
              <div className="space-y-4">
                {[
                  { id: 'email_alerts', label: 'Alerte me Email', desc: 'Merr njoftime për ngjarje të rëndësishme', default: true },
                  { id: 'billing', label: 'Njoftime Faturimi', desc: 'Faturat dhe rinovimet e abonimit', default: true },
                  { id: 'security', label: 'Alerte Sigurie', desc: 'Login nga pajisje të reja, etj.', default: true },
                  { id: 'marketing', label: 'Përditësime Produkti', desc: 'Veçori të reja dhe përmirësime', default: false },
                  { id: 'newsletter', label: 'Newsletter', desc: 'Lajme dhe artikuj javore', default: false }
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-400">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-900/20 rounded-2xl border border-red-500/30 p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-400">⚠️ Zona e Rrezikshme</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-medium">Eksporto të Dhënat</div>
                    <div className="text-sm text-gray-400">Shkarko të gjitha të dhënat e llogarisë</div>
                  </div>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors">
                    Eksporto
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-medium text-red-400">Fshi Llogarinë</div>
                    <div className="text-sm text-gray-400">Fshi përgjithmonë llogarinë dhe të gjitha të dhënat</div>
                  </div>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors">
                    Fshi Llogarinë
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">🚀 Upgrade Plan</h2>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-2">Integrim me Stripe</h3>
              <p className="text-gray-400 mb-6">
                Sistemi i pagesave do të integrohet me Stripe për pagesa të sigurta.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Planet fillojnë nga €29/muaj
              </p>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
              >
                OK, E Kuptova
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
