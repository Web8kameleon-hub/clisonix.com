/**
 * Clisonix Internationalization (i18n) System
 * Supports: English (en), Albanian (sq), German (de)
 */

export type Language = "en" | "sq" | "de" | "it" | "fr" | "es";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Common
    "nav.back": "← Back",
    "nav.home": "Home",
    "nav.modules": "Modules",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.loading": "Loading...",
    "common.saving": "Saving...",
    "common.success": "Success!",
    "common.error": "Error",
    "common.confirm": "Confirm",
    "common.close": "Close",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.comingSoon": "Coming Soon",

    // Account Page
    "account.title": "My Account",
    "account.editProfile": "Edit Profile",

    // Tabs
    "tabs.overview": "Overview",
    "tabs.subscription": "Subscription",
    "tabs.billing": "Billing",
    "tabs.security": "Security",
    "tabs.settings": "Settings",

    // Overview
    "overview.currentPlan": "Current Plan",
    "overview.usage": "Usage",
    "overview.quickActions": "Quick Actions",
    "overview.noSubscription": "No active subscription",
    "overview.free": "Free",
    "overview.status": "Status",
    "overview.expires": "Expires",
    "overview.choosePlan": "Choose a Plan",
    "overview.upgradePlan": "Upgrade Plan",
    "overview.manageSubscription": "Manage Subscription",
    "overview.viewPlan": "View and change your plan",
    "overview.profileSettings": "Profile Settings",
    "overview.editInfo": "Edit your information",
    "overview.securitySettings": "Security",
    "overview.passwordAnd2FA": "Password and 2FA",
    "overview.contactSupport": "Contact Support",
    "overview.usageStats":
      "Usage statistics will appear after you start using the platform",

    // Subscription
    "subscription.current": "Current Subscription",
    "subscription.plan": "Plan",
    "subscription.price": "Price",
    "subscription.status": "Status",
    "subscription.renews": "Renews",
    "subscription.upgrade": "Upgrade",
    "subscription.switchToYearly": "Switch to Yearly (2 months free)",
    "subscription.cancel": "Cancel Subscription",
    "subscription.noActive": "You have no active subscription",
    "subscription.availablePlans": "Available Plans",
    "subscription.currentPlan": "Current Plan",
    "subscription.downgrade": "Downgrade",
    "subscription.mostPopular": "🔥 Most Popular",
    "subscription.perMonth": "/month",
    "subscription.perYear": "/year",
    "subscription.more": "more...",

    // Billing
    "billing.paymentMethods": "Payment Methods",
    "billing.addMethod": "+ Add Method",
    "billing.noMethods": "No payment methods registered",
    "billing.addCardToSubscribe": "Add a card to activate subscription",
    "billing.expires": "Expires",
    "billing.default": "Default",
    "billing.remove": "Remove",
    "billing.billingAddress": "Billing Address",
    "billing.addressOnFirstPayment":
      "Billing address will be filled during first payment",
    "billing.invoiceHistory": "Invoice History",
    "billing.noInvoices": "No invoices yet",
    "billing.invoicesAfterPayment":
      "Invoices will appear here after first payment",
    "billing.invoice": "Invoice",
    "billing.date": "Date",
    "billing.amount": "Amount",
    "billing.actions": "Actions",
    "billing.downloadPDF": "📥 Download PDF",
    "billing.paid": "Paid",
    "billing.pending": "Pending",
    "billing.failed": "Failed",
    "billing.editAddress": "Edit Billing Address",
    "billing.fullName": "Full Name",
    "billing.addressLine1": "Address Line 1",
    "billing.addressLine2": "Address Line 2",
    "billing.streetAddress": "Street, Number",
    "billing.aptSuite": "Apartment, Floor (optional)",
    "billing.city": "City",
    "billing.postalCode": "Postal Code",
    "billing.stateRegion": "State/Region",
    "billing.country": "Country",
    "billing.phone": "Phone",

    // Security
    "security.password": "Password",
    "security.changePassword": "Change Password",
    "security.lastChanged": "Last changed",
    "security.twoFactor": "Two-Factor Authentication",
    "security.twoFactorDesc": "Add an extra layer of security to your account",
    "security.enable": "Enable",
    "security.disable": "Disable",
    "security.enabled": "Enabled",
    "security.disabled": "Disabled",
    "security.activeSessions": "Active Sessions",
    "security.currentSession": "Current Session",
    "security.thisBrowser": "This browser • Now",
    "security.endSession": "End Session",
    "security.endAllSessions": "End All Other Sessions",
    "security.apiKeys": "API Keys",
    "security.generateKey": "+ Generate New Key",
    "security.noKeys": "No API keys",
    "security.generateToUse": "Generate a key to use the API",
    "security.copy": "Copy",
    "security.copied": "✓ Copied!",
    "security.revoke": "Revoke",
    "security.revokeConfirm":
      "Are you sure you want to revoke this API key? This action cannot be undone.",
    "security.created": "Created",

    // Settings
    "settings.profileInfo": "Profile Information",
    "settings.fullName": "Full Name",
    "settings.email": "Email",
    "settings.company": "Company",
    "settings.phone": "Phone",
    "settings.saveChanges": "💾 Save Changes",
    "settings.savingChanges": "Saving changes...",
    "settings.profileSaved": "✅ Profile saved successfully!",
    "settings.saveFailed": "❌ Failed to save",
    "settings.connectionError": "❌ Server connection error",

    // Preferences
    "preferences.title": "Preferences",
    "preferences.language": "Interface Language",
    "preferences.languageDesc": "Changes are saved automatically",
    "preferences.languageChanged": "✅ Language changed to",
    "preferences.timezone": "Time Zone",
    "preferences.timezoneDesc": "Changes are saved automatically",
    "preferences.timezoneChanged": "✅ Time zone set to",
    "preferences.autoDetect": "📍 Auto Detect",
    "preferences.detectedZone": "📍 Detected zone",
    "preferences.theme": "Theme",
    "preferences.themeDesc": "Dark Mode is active. Other themes coming soon.",
    "preferences.darkMode": "Dark Mode",
    "preferences.lightMode": "Light Mode",
    "preferences.auto": "Auto",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.emailAlerts": "Email Alerts",
    "notifications.emailAlertsDesc":
      "Receive notifications for important events",
    "notifications.billing": "Billing Notifications",
    "notifications.billingDesc": "Invoices and subscription renewals",
    "notifications.security": "Security Alerts",
    "notifications.securityDesc": "Login from new devices, etc.",
    "notifications.product": "Product Updates",
    "notifications.productDesc": "New features and improvements",
    "notifications.newsletter": "Newsletter",
    "notifications.newsletterDesc": "Weekly news and articles",

    // Danger Zone
    "danger.title": "⚠️ Danger Zone",
    "danger.exportData": "Export Data",
    "danger.exportDataDesc": "Download all your account data",
    "danger.download": "Download",
    "danger.deleteAccount": "Delete Account",
    "danger.deleteAccountDesc": "Permanently delete your account and all data",
    "danger.deleteButton": "Delete Account",

    // Upgrade Modal
    "upgrade.title": "🚀 Upgrade Your Plan",
    "upgrade.subtitle": "Choose the plan that fits your needs",
    "upgrade.upgradeNow": "💳 Upgrade Now",
    "upgrade.processing": "Processing...",
    "upgrade.contactSales": "📞 Contact Sales",
    "upgrade.stripeNotConfigured":
      "Stripe keys are not configured. Add STRIPE_SECRET_KEY to .env.local",
    "upgrade.paymentError": "Payment processing error. Please try again.",
    "upgrade.connectionError": "Server connection error.",
  },

  sq: {
    // Navigation & Common
    "nav.back": "← Kthehu",
    "nav.home": "Ballina",
    "nav.modules": "Modulet",
    "common.save": "Ruaj",
    "common.cancel": "Anulo",
    "common.delete": "Fshi",
    "common.edit": "Modifiko",
    "common.loading": "Duke ngarkuar...",
    "common.saving": "Duke ruajtur...",
    "common.success": "Sukses!",
    "common.error": "Gabim",
    "common.confirm": "Konfirmo",
    "common.close": "Mbyll",
    "common.active": "Aktiv",
    "common.inactive": "Joaktiv",
    "common.comingSoon": "Së Shpejti",

    // Account Page
    "account.title": "Llogaria Ime",
    "account.editProfile": "Modifiko Profilin",

    // Tabs
    "tabs.overview": "Përmbledhje",
    "tabs.subscription": "Abonimi",
    "tabs.billing": "Faturimi",
    "tabs.security": "Siguria",
    "tabs.settings": "Cilësimet",

    // Overview
    "overview.currentPlan": "Plani Aktual",
    "overview.usage": "Përdorimi",
    "overview.quickActions": "Veprime të Shpejta",
    "overview.noSubscription": "Nuk ka abonim aktiv",
    "overview.free": "Falas",
    "overview.status": "Statusi",
    "overview.expires": "Përfundon",
    "overview.choosePlan": "Zgjidhni një Plan",
    "overview.upgradePlan": "Upgrade Plan",
    "overview.manageSubscription": "Menaxho Abonimin",
    "overview.viewPlan": "Shiko dhe ndrysho planin",
    "overview.profileSettings": "Cilësimet e Profilit",
    "overview.editInfo": "Modifiko informacionet",
    "overview.securitySettings": "Siguria",
    "overview.passwordAnd2FA": "Fjalëkalimi dhe 2FA",
    "overview.contactSupport": "Kontakto Support",
    "overview.usageStats":
      "Statistikat do shfaqen pas përdorimit të platformës",

    // Subscription
    "subscription.current": "Abonimi Aktual",
    "subscription.plan": "Plani",
    "subscription.price": "Çmimi",
    "subscription.status": "Statusi",
    "subscription.renews": "Rinovohet",
    "subscription.upgrade": "Upgrade",
    "subscription.switchToYearly": "Ndrysho në Vjetor (2 muaj falas)",
    "subscription.cancel": "Anulo Abonimin",
    "subscription.noActive": "Nuk keni abonim aktiv",
    "subscription.availablePlans": "Planet e Disponueshme",
    "subscription.currentPlan": "Plani Aktual",
    "subscription.downgrade": "Downgrade",
    "subscription.mostPopular": "🔥 Më Popullor",
    "subscription.perMonth": "/muaj",
    "subscription.perYear": "/vit",
    "subscription.more": "më shumë...",

    // Billing
    "billing.paymentMethods": "Metodat e Pagesës",
    "billing.addMethod": "+ Shto Metodë",
    "billing.noMethods": "Nuk keni asnjë metodë pagese të regjistruar",
    "billing.addCardToSubscribe": "Shtoni një kartë për të aktivizuar abonimin",
    "billing.expires": "Skadon",
    "billing.default": "Default",
    "billing.remove": "Fshi",
    "billing.billingAddress": "Adresa e Faturimit",
    "billing.addressOnFirstPayment":
      "Adresa e faturimit do plotësohet gjatë pagesës së parë",
    "billing.invoiceHistory": "Historia e Faturave",
    "billing.noInvoices": "Nuk keni asnjë faturë ende",
    "billing.invoicesAfterPayment":
      "Faturat do shfaqen këtu pas pagesës së parë",
    "billing.invoice": "Fatura",
    "billing.date": "Data",
    "billing.amount": "Shuma",
    "billing.actions": "Veprime",
    "billing.downloadPDF": "📥 Shkarko PDF",
    "billing.paid": "Paguar",
    "billing.pending": "Në pritje",
    "billing.failed": "Dështoi",
    "billing.editAddress": "Modifiko Adresën e Faturimit",
    "billing.fullName": "Emri i Plotë",
    "billing.addressLine1": "Adresa Rreshti 1",
    "billing.addressLine2": "Adresa Rreshti 2",
    "billing.streetAddress": "Rruga, Numri",
    "billing.aptSuite": "Apartamenti, Kati (opsionale)",
    "billing.city": "Qyteti",
    "billing.postalCode": "Kodi Postar",
    "billing.stateRegion": "Rajoni/Shteti",
    "billing.country": "Shteti",
    "billing.phone": "Telefoni",

    // Security
    "security.password": "Fjalëkalimi",
    "security.changePassword": "Ndrysho Fjalëkalimin",
    "security.lastChanged": "Ndryshuar së fundmi",
    "security.twoFactor": "Autentifikimi 2-Faktorësh",
    "security.twoFactorDesc":
      "Shto një shtresë ekstra sigurie për llogarinë tënde",
    "security.enable": "Aktivizo",
    "security.disable": "Çaktivizo",
    "security.enabled": "Aktiv",
    "security.disabled": "Joaktiv",
    "security.activeSessions": "Sesionet Aktive",
    "security.currentSession": "Sesioni Aktual",
    "security.thisBrowser": "Ky browser • Tani",
    "security.endSession": "Përfundo Sesionin",
    "security.endAllSessions": "Përfundo të Gjitha Sesionet e Tjera",
    "security.apiKeys": "API Keys",
    "security.generateKey": "+ Gjenero Key të Ri",
    "security.noKeys": "Nuk keni asnjë API key",
    "security.generateToUse": "Gjeneroni një key për të përdorur API-në",
    "security.copy": "Kopjo",
    "security.copied": "✓ Kopjuar!",
    "security.revoke": "Revoko",
    "security.revokeConfirm":
      "Jeni të sigurt që doni të revokoni këtë API key? Kjo veprim nuk mund të zhbëhet.",
    "security.created": "Krijuar",

    // Settings
    "settings.profileInfo": "Informacionet e Profilit",
    "settings.fullName": "Emri i Plotë",
    "settings.email": "Email",
    "settings.company": "Kompania",
    "settings.phone": "Telefoni",
    "settings.saveChanges": "💾 Ruaj Ndryshimet",
    "settings.savingChanges": "Duke ruajtur ndryshimet...",
    "settings.profileSaved": "✅ Profili u ruajt me sukses!",
    "settings.saveFailed": "❌ Gabim gjatë ruajtjes",
    "settings.connectionError": "❌ Gabim lidhje me serverin",

    // Preferences
    "preferences.title": "Preferencat",
    "preferences.language": "Gjuha e Ndërfaqes",
    "preferences.languageDesc": "Ndryshimi ruhet automatikisht",
    "preferences.languageChanged": "✅ Gjuha u ndryshua në",
    "preferences.timezone": "Zona Kohore",
    "preferences.timezoneDesc": "Ndryshimi ruhet automatikisht",
    "preferences.timezoneChanged": "✅ Zona kohore u vendos:",
    "preferences.autoDetect": "📍 Detekto Automatik",
    "preferences.detectedZone": "📍 Zona e detektuar",
    "preferences.theme": "Pamja",
    "preferences.themeDesc":
      "Tema Dark Mode është aktive. Tema të tjera do vijnë së shpejti.",
    "preferences.darkMode": "Dark Mode",
    "preferences.lightMode": "Light Mode",
    "preferences.auto": "Auto",

    // Notifications
    "notifications.title": "Njoftimet",
    "notifications.emailAlerts": "Alerte me Email",
    "notifications.emailAlertsDesc": "Merr njoftime për ngjarje të rëndësishme",
    "notifications.billing": "Njoftime Faturimi",
    "notifications.billingDesc": "Faturat dhe rinovimet e abonimit",
    "notifications.security": "Alerte Sigurie",
    "notifications.securityDesc": "Login nga pajisje të reja, etj.",
    "notifications.product": "Përditësime Produkti",
    "notifications.productDesc": "Veçori të reja dhe përmirësime",
    "notifications.newsletter": "Newsletter",
    "notifications.newsletterDesc": "Lajme dhe artikuj javore",

    // Danger Zone
    "danger.title": "⚠️ Zona e Rrezikshme",
    "danger.exportData": "Eksporto të Dhënat",
    "danger.exportDataDesc": "Shkarko të gjitha të dhënat e llogarisë",
    "danger.download": "Shkarko",
    "danger.deleteAccount": "Fshi Llogarinë",
    "danger.deleteAccountDesc":
      "Fshi përgjithmonë llogarinë dhe të gjitha të dhënat",
    "danger.deleteButton": "Fshi Llogarinë",

    // Upgrade Modal
    "upgrade.title": "🚀 Upgrade Planin",
    "upgrade.subtitle": "Zgjidhni planin që i përshtatet nevojave tuaja",
    "upgrade.upgradeNow": "💳 Upgrade Tani",
    "upgrade.processing": "Duke procesuar...",
    "upgrade.contactSales": "📞 Kontakto Sales",
    "upgrade.stripeNotConfigured":
      "Stripe çelësat nuk janë konfiguruar. Shtoni STRIPE_SECRET_KEY në .env.local",
    "upgrade.paymentError":
      "Gabim gjatë procesit të pagesës. Ju lutem provoni përsëri.",
    "upgrade.connectionError": "Gabim gjatë lidhjes me serverin.",
  },

  de: {
    // Navigation & Common
    "nav.back": "← Zurück",
    "nav.home": "Startseite",
    "nav.modules": "Module",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.loading": "Laden...",
    "common.saving": "Speichern...",
    "common.success": "Erfolg!",
    "common.error": "Fehler",
    "common.confirm": "Bestätigen",
    "common.close": "Schließen",
    "common.active": "Aktiv",
    "common.inactive": "Inaktiv",
    "common.comingSoon": "Demnächst",

    // Account Page
    "account.title": "Mein Konto",
    "account.editProfile": "Profil bearbeiten",

    // Tabs
    "tabs.overview": "Übersicht",
    "tabs.subscription": "Abonnement",
    "tabs.billing": "Abrechnung",
    "tabs.security": "Sicherheit",
    "tabs.settings": "Einstellungen",

    // More German translations can be added...
    "overview.currentPlan": "Aktueller Plan",
    "overview.usage": "Nutzung",
    "overview.quickActions": "Schnellaktionen",
    "settings.saveChanges": "💾 Änderungen speichern",
    "preferences.title": "Einstellungen",
    "preferences.language": "Sprache",
    "preferences.timezone": "Zeitzone",
  },

  // Placeholder for other languages
  it: {
    "nav.back": "← Indietro",
    "account.title": "Il Mio Account",
    "tabs.overview": "Panoramica",
    "tabs.settings": "Impostazioni",
    "common.save": "Salva",
  },

  fr: {
    "nav.back": "← Retour",
    "account.title": "Mon Compte",
    "tabs.overview": "Aperçu",
    "tabs.settings": "Paramètres",
    "common.save": "Enregistrer",
  },

  es: {
    "nav.back": "← Volver",
    "account.title": "Mi Cuenta",
    "tabs.overview": "Resumen",
    "tabs.settings": "Configuración",
    "common.save": "Guardar",
  },
};

// Language type as const for runtime use
export const LANGUAGES = ["en", "sq", "de", "it", "fr", "es"] as const;

// Default language
export const defaultLanguage: Language = "en";

// Get translation with fallback
export function t(key: string, lang: Language = "en"): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

// Language names for display
export const languageNames: Record<Language, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇬🇧" },
  sq: { name: "Shqip", flag: "🇦🇱" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  it: { name: "Italiano", flag: "🇮🇹" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" },
};
