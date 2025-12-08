'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Eye, Shield, Database, UserX, Mail } from 'lucide-react'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function PrivacyPolicyPage() {
  const { bgGradientTop, bgGradientBottom, topicColor, buttonColor, containerColor, textColor1, textColor2 } = useThemeColors()
  const router = useRouter()

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      router.push(previousPage)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${bgGradientTop}, ${bgGradientBottom})` }}>
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 border-b shadow-lg bg-white/95 backdrop-blur-sm border-purple-200">
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 sm:py-2 rounded-xl hover:scale-105 hover:opacity-90 sm:text-base"
            style={{ background: `linear-gradient(to right, ${buttonColor}, ${buttonColor}dd)`, color: textColor2 }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <Lock className="w-6 h-6 text-[#6465e0] sm:w-8 sm:h-8" />
            <h1 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">Privacy Policy</h1>
          </div>
          <div className="w-16 sm:w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-5xl sm:px-6 lg:px-8 sm:py-12">
        <div className="p-6 shadow-2xl backdrop-blur-sm rounded-3xl sm:p-8 md:p-12" style={{ backgroundColor: containerColor }}>
          {/* Introduction */}
          <div className="pb-6 mb-6 border-b-2 border-purple-200 sm:pb-8 sm:mb-8">
            <div className="flex items-start gap-3 mb-4 sm:gap-4">
              <div className="flex-shrink-0 p-2 rounded-full sm:p-3 bg-gradient-to-r from-[#6465e0] to-[#7c7de8]">
                <Shield className="w-5 h-5 text-white sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">Your Privacy Matters to Us</h2>
                <p className="mt-2 text-xs text-gray-600 sm:text-sm md:text-base">Last Updated: January 1, 2025</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base md:text-lg">
              At The Return of Attention, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our platform and services.
            </p>
          </div>

          {/* Section 1: Information We Collect */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Database className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">1. Information We Collect</h3>
            </div>
            <div className="pl-4 space-y-4 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <div>
                <h4 className="mb-2 font-semibold text-gray-800">1.1 Information You Provide</h4>
                <p className="mb-2">When you create an account and use our services, we collect:</p>
                <ul className="pl-5 space-y-2 list-disc">
                  <li><strong>Account Information:</strong> Name, email address, password (encrypted), age, gender, nationality, and country</li>
                  <li><strong>Profile Information:</strong> User level, happiness score, session statistics</li>
                  <li><strong>Practice Data:</strong> Meditation session details (duration, stage, completion status), daily notes, reflections, and PAHM matrix entries</li>
                  <li><strong>Assessment Data:</strong> Questionnaire responses and self-assessment results</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-gray-800">1.2 Automatically Collected Information</h4>
                <p className="mb-2">We automatically collect certain information when you use our platform:</p>
                <ul className="pl-5 space-y-2 list-disc">
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform, session frequency</li>
                  <li><strong>Device Information:</strong> Browser type, device type, operating system, IP address</li>
                  <li><strong>Cookies and Similar Technologies:</strong> Session cookies for authentication and functionality</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Eye className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">2. How We Use Your Information</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <p>We use your information for the following purposes:</p>
              <ul className="pl-5 space-y-2 list-disc">
                <li><strong>Provide Services:</strong> To create and manage your account, track your practice progress, and personalize your experience</li>
                <li><strong>Communication:</strong> To send you important updates, notifications about your practice, and respond to your inquiries</li>
                <li><strong>Improve Platform:</strong> To analyze usage patterns, improve features, and enhance user experience</li>
                <li><strong>Security:</strong> To protect against fraud, unauthorized access, and ensure platform security</li>
                <li><strong>Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                <li><strong>Analytics:</strong> To understand how users interact with our platform and identify areas for improvement</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Data Storage and Security */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Shield className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">3. Data Storage and Security</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <p><strong>How We Protect Your Data:</strong></p>
              <ul className="pl-5 space-y-2 list-disc">
                <li><strong>Encryption:</strong> All passwords are encrypted using industry-standard bcrypt hashing</li>
                <li><strong>Secure Transmission:</strong> Data transmitted between your device and our servers is encrypted using HTTPS/SSL</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can view or modify your data</li>
                <li><strong>Database Security:</strong> Your data is stored in secure, professionally managed databases with regular backups</li>
                <li><strong>Session Management:</strong> Secure session tokens with configurable expiry times (1 hour or 30 days based on "Remember Me" preference)</li>
              </ul>
              <p className="mt-3 font-semibold text-orange-600">
                ⚠️ Important: While we implement robust security measures, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.
              </p>
            </div>
          </section>

          {/* Section 4: Data Sharing and Disclosure */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <UserX className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">4. Data Sharing and Disclosure</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <p className="font-semibold text-green-700">
                ✓ We DO NOT sell, rent, or trade your personal information to third parties.
              </p>
              <p>We may share your information only in the following limited circumstances:</p>
              <ul className="pl-5 space-y-2 list-disc">
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                <li><strong>Service Providers:</strong> With trusted third-party service providers who help us operate the platform (e.g., hosting, analytics) under strict confidentiality agreements</li>
                <li><strong>Legal Requirements:</strong> When required by law, legal process, or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (you will be notified beforehand)</li>
              </ul>
              <p className="mt-3">
                <strong>Anonymized Data:</strong> We may use and share aggregated, anonymized data that cannot identify you personally for research, analytics, and improvement purposes.
              </p>
            </div>
          </section>

          {/* Section 5: Your Rights and Choices */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Lock className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">5. Your Rights and Choices</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="pl-5 space-y-2 list-disc">
                <li><strong>Access:</strong> You can access and review your personal information through your profile settings</li>
                <li><strong>Correction:</strong> You can update or correct your information at any time in your profile</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and associated data by contacting us</li>
                <li><strong>Data Portability:</strong> You can request a copy of your data in a structured, machine-readable format</li>
                <li><strong>Opt-Out:</strong> You can opt out of non-essential communications (we'll still send important account-related messages)</li>
                <li><strong>Session Control:</strong> You can choose session duration with the "Remember Me" option during sign-in</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please contact us at the email address provided below.
              </p>
            </div>
          </section>

          {/* Section 6: Cookies and Tracking */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Database className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">6. Cookies and Tracking Technologies</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <p>We use cookies and similar technologies to:</p>
              <ul className="pl-5 space-y-2 list-disc">
                <li><strong>Authentication:</strong> Keep you logged in and maintain your session</li>
                <li><strong>Preferences:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics:</strong> Understand how you use our platform</li>
                <li><strong>Security:</strong> Protect against fraud and unauthorized access</li>
              </ul>
              <p className="mt-3">
                You can control cookie preferences through your browser settings, but note that disabling cookies may limit some platform functionality.
              </p>
            </div>
          </section>

          {/* Section 7: Data Retention */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Shield className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">7. Data Retention</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <p>
                We retain your personal information for as long as your account is active or as needed to provide you with services.
              </p>
              <p>
                If you request account deletion, we will delete or anonymize your personal information within 30 days, except where we are required to retain certain data for legal or regulatory compliance.
              </p>
              <p>
                Aggregated, anonymized data may be retained indefinitely for analytics and research purposes.
              </p>
            </div>
          </section>

          {/* Section 8: Children's Privacy */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Lock className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">8. Children's Privacy</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <p>
                Our services are available to users aged 13 and above. We do not knowingly collect personal information from children under 13.
              </p>
              <p>
                If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
              </p>
              <p>
                Parents or guardians who believe their child has provided us with personal information should contact us immediately.
              </p>
            </div>
          </section>

          {/* Section 9: International Data Transfers */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Database className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">9. International Data Transfers</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.
              </p>
              <p>
                By using our services, you consent to the transfer of your information to our facilities and service providers wherever located.
              </p>
              <p>
                We take appropriate measures to ensure your data receives adequate protection in accordance with this Privacy Policy.
              </p>
            </div>
          </section>

          {/* Section 10: Changes to Privacy Policy */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Mail className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">10. Changes to This Privacy Policy</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-purple-500 sm:pl-6 sm:text-base">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.
              </p>
              <p>
                If we make material changes, we will notify you by:
              </p>
              <ul className="pl-5 space-y-2 list-disc">
                <li>Sending an email to the address associated with your account</li>
                <li>Posting a prominent notice on our platform</li>
                <li>Updating the "Last Updated" date at the top of this policy</li>
              </ul>
              <p className="mt-3">
                Your continued use of the platform after changes are posted constitutes your acceptance of the updated Privacy Policy.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="p-4 mt-8 border-2 border-purple-200 sm:p-6 bg-purple-50 rounded-2xl">
            <h3 className="mb-3 text-lg font-bold text-gray-800 sm:text-xl">Contact Us</h3>
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact us at:
            </p>
            <p className="mt-2 text-sm font-semibold text-purple-600 sm:text-base">
              privacy@thereturnofattention.com
            </p>
            <p className="mt-3 text-xs text-gray-600 sm:text-sm">
              We will respond to your inquiry within 30 days.
            </p>
          </section>

          {/* Footer Note */}
          <div className="p-4 mt-6 text-center border-t-2 border-purple-200 sm:mt-8">
            <p className="text-xs italic text-gray-600 sm:text-sm">
              By using The Return of Attention, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.
            </p>
            <p className="mt-3 text-xs font-semibold text-purple-600 sm:text-sm">
              Your privacy and trust are important to us. Thank you for choosing The Return of Attention for your mindfulness journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
