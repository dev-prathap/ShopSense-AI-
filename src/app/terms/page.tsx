import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen font-sans antialiased bg-white text-slate-900">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-lg prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Agreement to Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              By accessing or using Neryn's AI sales agent service ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Description of Service</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Neryn provides an AI-powered sales agent that integrates with Shopify stores to assist customers with product discovery,
              questions, and purchasing decisions through conversational interfaces.
            </p>
            <p className="text-slate-700 leading-relaxed">
              The Service includes but is not limited to: AI chat functionality, product recommendations, analytics dashboard,
              and integration tools for Shopify stores.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">User Accounts</h2>
            <h3 className="text-xl font-medium text-slate-900 mb-3">Account Creation</h3>
            <ul className="text-slate-700 leading-relaxed mb-4 space-y-2">
              <li>• You must provide accurate and complete information when creating an account</li>
              <li>• You are responsible for maintaining the security of your account credentials</li>
              <li>• You must notify us immediately of any unauthorized use of your account</li>
              <li>• One person or legal entity may not maintain more than one free account</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Account Termination</h3>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to suspend or terminate your account for violation of these Terms, non-payment,
              or any other reason at our sole discretion with appropriate notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Acceptable Use</h2>
            <h3 className="text-xl font-medium text-slate-900 mb-3">Permitted Uses</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              You may use our Service only for lawful purposes and in accordance with these Terms. You agree to use the Service
              solely for your legitimate business operations.
            </p>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Prohibited Uses</h3>
            <p className="text-slate-700 leading-relaxed mb-2">You may not use our Service:</p>
            <ul className="text-slate-700 leading-relaxed space-y-2">
              <li>• For any unlawful purpose or to solicit unlawful activity</li>
              <li>• To violate any international, federal, provincial, or state regulations or laws</li>
              <li>• To transmit malicious code, viruses, or harmful content</li>
              <li>• To spam, phish, or send unsolicited communications</li>
              <li>• To impersonate another person or entity</li>
              <li>• To interfere with or disrupt the Service or servers</li>
              <li>• To attempt to gain unauthorized access to our systems</li>
              <li>• To resell or redistribute the Service without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Billing and Payment</h2>
            <h3 className="text-xl font-medium text-slate-900 mb-3">Subscription Plans</h3>
            <ul className="text-slate-700 leading-relaxed mb-4 space-y-2">
              <li>• We offer various subscription plans with different features and usage limits</li>
              <li>• Subscription fees are billed in advance on a monthly or annual basis</li>
              <li>• All fees are non-refundable except as required by law</li>
              <li>• We may change our pricing with 30 days' notice</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Payment Processing</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Payments are processed through third-party payment providers. You agree to provide current, complete,
              and accurate payment information and authorize us to charge the provided payment method.
            </p>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Late Payment</h3>
            <p className="text-slate-700 leading-relaxed">
              If payment is not received when due, we may suspend or terminate your access to the Service.
              You remain responsible for all charges incurred through the end of the billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data and Privacy</h2>
            <ul className="text-slate-700 leading-relaxed space-y-3">
              <li>• Your use of the Service is subject to our Privacy Policy</li>
              <li>• You retain ownership of your business data and customer information</li>
              <li>• We may use aggregated, anonymized data for service improvements</li>
              <li>• You are responsible for complying with applicable data protection laws</li>
              <li>• We implement reasonable security measures to protect your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Intellectual Property</h2>
            <h3 className="text-xl font-medium text-slate-900 mb-3">Our Rights</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              The Service, including its software, algorithms, and related materials, are protected by copyright,
              trademark, and other intellectual property laws. We retain all rights not expressly granted to you.
            </p>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Your Rights</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              You retain all rights to your content, data, and materials. By using our Service, you grant us
              a limited license to process and display your content as necessary to provide the Service.
            </p>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Feedback</h3>
            <p className="text-slate-700 leading-relaxed">
              Any feedback, suggestions, or ideas you provide about our Service may be used by us without obligation
              or compensation to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Service Availability</h2>
            <ul className="text-slate-700 leading-relaxed space-y-2">
              <li>• We strive to maintain high service availability but do not guarantee 100% uptime</li>
              <li>• We may perform scheduled maintenance with advance notice when possible</li>
              <li>• We are not responsible for downtime due to circumstances beyond our control</li>
              <li>• Service levels may vary based on your subscription plan</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Limitation of Liability</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, NERYN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
              DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-slate-700 leading-relaxed">
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE SERVICE IN THE TWELVE MONTHS
              PRECEDING THE EVENT GIVING RISE TO LIABILITY.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Indemnification</h2>
            <p className="text-slate-700 leading-relaxed">
              You agree to indemnify and hold harmless Neryn and its affiliates, officers, directors, employees,
              and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of
              the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Termination</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Either party may terminate this agreement at any time. Upon termination:
            </p>
            <ul className="text-slate-700 leading-relaxed space-y-2">
              <li>• Your access to the Service will be discontinued</li>
              <li>• We will provide you with a reasonable opportunity to export your data</li>
              <li>• All unpaid fees become immediately due and payable</li>
              <li>• Provisions that should survive termination will remain in effect</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Governing Law</h2>
            <p className="text-slate-700 leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction],
              without regard to conflict of law principles. Any disputes will be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of material changes
              via email or through the Service. Your continued use after such notice constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-slate-50 p-6 rounded-lg">
              <p className="text-slate-700"><strong>Email:</strong> support@neryn.pro</p>
              <p className="text-slate-700"><strong>Address:</strong> [Your Business Address]</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}