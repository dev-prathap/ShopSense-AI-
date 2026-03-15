import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen font-sans antialiased bg-white text-slate-900">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-lg prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Introduction</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Neryn ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our AI sales agent service for Shopify stores.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Account Information</h3>
            <ul className="text-slate-700 leading-relaxed mb-4 space-y-2">
              <li>• Email address and name when you create an account</li>
              <li>• Password (encrypted and never stored in plain text)</li>
              <li>• Shopify store information when you connect your store</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Store Data</h3>
            <ul className="text-slate-700 leading-relaxed mb-4 space-y-2">
              <li>• Product catalog and inventory information</li>
              <li>• Store settings and configuration</li>
              <li>• Order data for revenue attribution</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Chat Data</h3>
            <ul className="text-slate-700 leading-relaxed mb-4 space-y-2">
              <li>• Customer conversations with the AI agent</li>
              <li>• Chat analytics and performance metrics</li>
              <li>• Product recommendations and interactions</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-900 mb-3">Technical Information</h3>
            <ul className="text-slate-700 leading-relaxed mb-4 space-y-2">
              <li>• IP addresses and device information</li>
              <li>• Browser type and version</li>
              <li>• Usage patterns and feature interactions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Your Information</h2>
            <ul className="text-slate-700 leading-relaxed space-y-3">
              <li>• <strong>Service Delivery:</strong> Provide AI chat functionality for your Shopify store</li>
              <li>• <strong>Analytics:</strong> Generate insights on chat performance and revenue attribution</li>
              <li>• <strong>Improvements:</strong> Enhance AI responses and product recommendations</li>
              <li>• <strong>Support:</strong> Provide customer support and troubleshooting</li>
              <li>• <strong>Security:</strong> Protect against fraud, abuse, and security threats</li>
              <li>• <strong>Legal Compliance:</strong> Meet legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information Sharing</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:
            </p>
            <ul className="text-slate-700 leading-relaxed space-y-3">
              <li>• <strong>Service Providers:</strong> Trusted third parties who assist our operations (OpenAI for AI processing, hosting providers)</li>
              <li>• <strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
              <li>• <strong>Business Transfer:</strong> In case of merger, acquisition, or sale of assets</li>
              <li>• <strong>Consent:</strong> With your explicit consent for specific purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Security</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your information:
            </p>
            <ul className="text-slate-700 leading-relaxed space-y-2">
              <li>• Encryption in transit and at rest</li>
              <li>• Regular security assessments and updates</li>
              <li>• Access controls and authentication</li>
              <li>• Secure hosting with reputable cloud providers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Rights</h2>
            <p className="text-slate-700 leading-relaxed mb-4">Depending on your location, you may have these rights:</p>
            <ul className="text-slate-700 leading-relaxed space-y-2">
              <li>• <strong>Access:</strong> Request access to your personal information</li>
              <li>• <strong>Correction:</strong> Request correction of inaccurate information</li>
              <li>• <strong>Deletion:</strong> Request deletion of your personal information</li>
              <li>• <strong>Portability:</strong> Request export of your data in a portable format</li>
              <li>• <strong>Objection:</strong> Object to certain processing activities</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at support@neryn.pro
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Retention</h2>
            <p className="text-slate-700 leading-relaxed">
              We retain your information only as long as necessary to provide our services and meet legal obligations.
              Chat data is typically retained for 2 years for analytics purposes. Account information is retained until
              you close your account, after which it is deleted within 90 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">International Transfers</h2>
            <p className="text-slate-700 leading-relaxed">
              Your information may be processed in countries other than your own. We ensure appropriate safeguards
              are in place for such transfers, including standard contractual clauses and adequacy decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Children's Privacy</h2>
            <p className="text-slate-700 leading-relaxed">
              Our service is not intended for children under 13. We do not knowingly collect personal information
              from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by
              posting the new policy on this page and updating the "Last updated" date. Your continued use of our
              service after such changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
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