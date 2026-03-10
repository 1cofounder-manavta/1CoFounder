export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50" data-testid="terms-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <a href="/" className="text-sm text-teal-700 hover:underline mb-6 inline-block">&larr; Back to 1CoFounder</a>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: March 2026</p>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">1. Acceptance of Terms</h2><p>By accessing or using 1CoFounder.com (&quot;the Platform&quot;), a Manavta Foundation initiative, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">2. Description of Service</h2><p>1CoFounder is a nonprofit platform that connects healthcare innovators — clinicians, engineers, researchers, and business operators — to find co-founders and collaborate on healthcare solutions.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">3. User Accounts</h2><p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. You must be at least 18 years old to use the Platform.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">4. Acceptable Use</h2><p>You agree not to: use the Platform for spam, harassment, or fraudulent purposes; impersonate others; share harmful or misleading content; attempt to gain unauthorized access to the Platform or other users' accounts.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">5. Content Ownership</h2><p>You retain ownership of the content you post. By posting content, you grant 1CoFounder a non-exclusive, royalty-free license to display and distribute your content within the Platform.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">6. Termination</h2><p>We reserve the right to suspend or terminate your account for violations of these Terms. You may delete your account at any time.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">7. Disclaimer</h2><p>The Platform is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy of user profiles or the success of any collaboration formed through the Platform.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">8. Contact</h2><p>For questions about these Terms, please contact us through the Platform.</p></section>
        </div>
      </div>
    </div>
  );
}
