export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50" data-testid="privacy-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <a href="/" className="text-sm text-teal-700 hover:underline mb-6 inline-block">&larr; Back to 1CoFounder</a>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: March 2026</p>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">1. Information We Collect</h2><p>We collect information you provide when creating your account: name, email, professional role, location, skills, interests, and bio. We also collect usage data such as swipe actions and messages to provide our matching service.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">2. How We Use Your Information</h2><p>We use your information to: provide and improve our matching service; display your profile to potential co-founders; send notifications about matches, messages, and platform updates; maintain platform safety and prevent abuse.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">3. Information Sharing</h2><p>We do not sell your personal information. Your profile information is visible to other authenticated users. We may share anonymized, aggregated data for research purposes in healthcare innovation.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">4. Data Security</h2><p>We implement industry-standard security measures including encrypted passwords and secure data transmission. However, no method of electronic storage is 100% secure.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">5. Your Rights</h2><p>You have the right to: access and update your personal information; delete your account and associated data; opt out of email notifications; request a copy of your data.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">6. Cookies & Analytics</h2><p>We use essential cookies to maintain your session. We may use analytics to understand platform usage and improve our service.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">7. Changes to This Policy</h2><p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">8. Contact</h2><p>For privacy-related questions, please contact us through the Platform. 1CoFounder.com is a Manavta Foundation initiative.</p></section>
        </div>
      </div>
    </div>
  );
}
