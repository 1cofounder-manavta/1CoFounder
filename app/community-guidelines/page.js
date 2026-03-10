export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-slate-50" data-testid="community-guidelines-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <a href="/" className="text-sm text-teal-700 hover:underline mb-6 inline-block">&larr; Back to 1CoFounder</a>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Community Guidelines</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: March 2026</p>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">Our Mission</h2><p>1CoFounder exists to connect healthcare innovators and accelerate solutions that improve patient outcomes. These guidelines ensure our community remains safe, respectful, and productive.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">Be Authentic</h2><p>Use your real name and credentials. Accurately represent your skills, experience, and intentions. Misrepresentation undermines trust and may result in account suspension.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">Be Respectful</h2><p>Treat every member with dignity and respect, regardless of their background, role, or experience level. Harassment, discrimination, and personal attacks are not tolerated.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">Collaborate in Good Faith</h2><p>When you express interest in a co-founder or join a project, follow through with genuine intent. Do not use the platform solely for recruiting, sales, or self-promotion.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">Protect Privacy</h2><p>Do not share other users' personal information, messages, or profile details outside the Platform without their explicit consent.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">Report Concerns</h2><p>If you encounter behavior that violates these guidelines, please use the Report feature. Reports are reviewed by our team and handled confidentially.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">Consequences</h2><p>Violations of these guidelines may result in: content removal, temporary suspension, or permanent account termination. Repeated reports from multiple users will trigger automatic review.</p></section>
          <section><h2 className="text-lg font-bold text-slate-800 mb-2">Contact Us</h2><p>If you have questions about these guidelines, please reach out. We are committed to maintaining a community that fosters meaningful healthcare innovation.</p></section>
        </div>
      </div>
    </div>
  );
}
