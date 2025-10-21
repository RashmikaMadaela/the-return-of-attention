'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, FileText, AlertCircle, Scale, UserCheck } from 'lucide-react'

export default function TermsOfServicePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 border-b shadow-lg bg-white/95 backdrop-blur-sm border-blue-200">
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-600 sm:px-4 sm:py-2 rounded-xl hover:bg-blue-700 hover:scale-105 sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="w-6 h-6 text-blue-600 sm:w-8 sm:h-8" />
            <h1 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">Terms of Service</h1>
          </div>
          <div className="w-16 sm:w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-5xl sm:px-6 lg:px-8 sm:py-12">
        <div className="p-6 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl sm:p-8 md:p-12">
          {/* Introduction */}
          <div className="pb-6 mb-6 border-b-2 border-blue-200 sm:pb-8 sm:mb-8">
            <div className="flex items-start gap-3 mb-4 sm:gap-4">
              <div className="flex-shrink-0 p-2 rounded-full sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600">
                <Shield className="w-5 h-5 text-white sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">Welcome to The Return of Attention</h2>
                <p className="mt-2 text-xs text-gray-600 sm:text-sm md:text-base">Last Updated: January 1, 2025</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base md:text-lg">
              These Terms of Service ("Terms") govern your use of The Return of Attention platform and services. By creating an account or using our services, you agree to be bound by these Terms. Please read them carefully.
            </p>
          </div>

          {/* Section 1: Acceptance of Terms */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <UserCheck className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">1. Acceptance of Terms</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p>
                By accessing or using The Return of Attention platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p>
                If you do not agree to these Terms, you must not use our services. We reserve the right to modify these Terms at any time, and your continued use of the platform constitutes acceptance of any changes.
              </p>
            </div>
          </section>

          {/* Section 2: Eligibility */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Scale className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">2. Eligibility</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p>
                You must be at least 13 years old to use our services. By using The Return of Attention, you represent and warrant that:
              </p>
              <ul className="pl-5 space-y-2 list-disc">
                <li>You are at least 13 years of age</li>
                <li>You have the legal capacity to enter into these Terms</li>
                <li>All information you provide is accurate and current</li>
                <li>You will maintain the accuracy of such information</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Account Registration */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <UserCheck className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">3. Account Registration and Security</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p><strong>Account Creation:</strong> To access certain features, you must create an account by providing accurate and complete information.</p>
              <p><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
              <p><strong>Account Responsibility:</strong> You agree to:</p>
              <ul className="pl-5 space-y-2 list-disc">
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Use a strong, unique password</li>
                <li>Not share your account with others</li>
                <li>Log out after each session, especially on shared devices</li>
              </ul>
            </div>
          </section>

          {/* Section 4: User Conduct */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AlertCircle className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">4. User Conduct and Prohibited Activities</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p>You agree not to:</p>
              <ul className="pl-5 space-y-2 list-disc">
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the platform's operation</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Share false or misleading information</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Content and Intellectual Property */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">5. Content and Intellectual Property</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p><strong>Our Content:</strong> All content, features, and functionality on The Return of Attention, including text, graphics, logos, images, audio clips, and software, are owned by us or our licensors and protected by copyright, trademark, and other intellectual property laws.</p>
              <p><strong>Your Content:</strong> You retain ownership of any content you create on the platform (such as daily notes and reflections). By using our services, you grant us a limited license to use, store, and display your content solely for the purpose of providing our services to you.</p>
              <p><strong>License to Use:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the platform for personal, non-commercial purposes.</p>
            </div>
          </section>

          {/* Section 6: Service Availability */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Shield className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">6. Service Availability and Modifications</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p>
                We strive to provide uninterrupted access to our services, but we do not guarantee that the platform will be available at all times. We may modify, suspend, or discontinue any aspect of the service at any time without prior notice.
              </p>
              <p>
                We are not liable for any interruption, delay, or unavailability of the platform.
              </p>
            </div>
          </section>

          {/* Section 7: Disclaimer of Warranties */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AlertCircle className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">7. Disclaimer of Warranties</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p>
                <strong>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong>
              </p>
              <p>
                We do not warrant that:
              </p>
              <ul className="pl-5 space-y-2 list-disc">
                <li>The platform will meet your specific requirements</li>
                <li>The service will be uninterrupted, timely, secure, or error-free</li>
                <li>Any errors in the platform will be corrected</li>
                <li>The platform is free from viruses or harmful components</li>
              </ul>
              <p className="font-semibold text-orange-600">
                ⚠️ Important: The Return of Attention is a mindfulness practice platform and is not a substitute for professional medical or mental health treatment. If you are experiencing serious mental health issues, please consult a qualified healthcare professional.
              </p>
            </div>
          </section>

          {/* Section 8: Limitation of Liability */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Scale className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">8. Limitation of Liability</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, OR OTHER INTANGIBLE LOSSES.
              </p>
            </div>
          </section>

          {/* Section 9: Termination */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AlertCircle className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">9. Termination</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p>
                We may terminate or suspend your account and access to the platform immediately, without prior notice, if you breach these Terms or for any other reason we deem necessary.
              </p>
              <p>
                You may terminate your account at any time by contacting us or using the account deletion feature in your profile settings.
              </p>
              <p>
                Upon termination, your right to use the platform will cease immediately, and we may delete your account and data.
              </p>
            </div>
          </section>

          {/* Section 10: Governing Law */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Scale className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">10. Governing Law and Disputes</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the platform shall be resolved through good faith negotiations. If negotiations fail, disputes may be submitted to binding arbitration or the appropriate courts.
              </p>
            </div>
          </section>

          {/* Section 11: Changes to Terms */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">11. Changes to Terms</h3>
            </div>
            <div className="pl-4 space-y-3 text-sm leading-relaxed text-gray-700 border-l-4 border-blue-500 sm:pl-6 sm:text-base">
              <p>
                We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or through a prominent notice on the platform.
              </p>
              <p>
                Your continued use of the platform after changes are posted constitutes your acceptance of the revised Terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="p-4 mt-8 border-2 border-blue-200 sm:p-6 bg-blue-50 rounded-2xl">
            <h3 className="mb-3 text-lg font-bold text-gray-800 sm:text-xl">Contact Us</h3>
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2 text-sm font-semibold text-blue-600 sm:text-base">
              support@thereturnofatte ntion.com
            </p>
          </section>

          {/* Footer Note */}
          <div className="p-4 mt-6 text-center border-t-2 border-blue-200 sm:mt-8">
            <p className="text-xs italic text-gray-600 sm:text-sm">
              By using The Return of Attention, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
