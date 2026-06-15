import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Dollar Shop",
  description: "How Dollar Shop collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p className="text-gray-700 leading-relaxed">
          Dollar Shop (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website at invgest.com. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your information when you visit
          our website or make a purchase. Please read this policy carefully.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Account information:</strong> name, email address, and password when you register.</li>
          <li><strong>Order information:</strong> delivery address, phone number, and payment details when you place an order.</li>
          <li><strong>Usage data:</strong> pages visited, products viewed, and search queries on our site.</li>
          <li><strong>Communications:</strong> messages you send us via WhatsApp or email.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Process and fulfil your orders.</li>
          <li>Send order confirmations and delivery updates via email or WhatsApp.</li>
          <li>Respond to customer service requests.</li>
          <li>Improve our website and product offerings.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. WhatsApp Messaging</h2>
        <p className="text-gray-700 leading-relaxed">
          If you contact us or place an order through WhatsApp, we may use your phone number to send
          order status updates and respond to your queries. We do not use your WhatsApp number for
          unsolicited marketing. You can opt out at any time by replying <strong>STOP</strong>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Sharing Your Information</h2>
        <p className="text-gray-700 leading-relaxed">
          We do not sell your personal information. We may share it with trusted third-party service
          providers who assist us in operating our website and fulfilling orders (e.g., payment
          processors, delivery partners), subject to confidentiality agreements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
        <p className="text-gray-700 leading-relaxed">
          We retain your personal data for as long as necessary to fulfil the purposes outlined in
          this policy, or as required by law. You may request deletion of your account and associated
          data by contacting us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
        <p className="text-gray-700 leading-relaxed">
          You have the right to access, correct, or delete your personal data. To exercise any of
          these rights, please contact us at the email address below.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Security</h2>
        <p className="text-gray-700 leading-relaxed">
          We implement appropriate technical and organisational measures to protect your information
          against unauthorised access, loss, or disclosure. However, no method of transmission over
          the internet is 100% secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
        <p className="text-gray-700 leading-relaxed">
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated date. Continued use of our website after changes constitutes acceptance of
          the updated policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
        <p className="text-gray-700 leading-relaxed">
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:support@dollarshop.co.zw" className="text-blue-600 underline">
            support@dollarshop.co.zw
          </a>
          .
        </p>
      </section>
    </div>
  );
}
