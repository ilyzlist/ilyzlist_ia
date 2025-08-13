'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaHome,
  FaUpload,
  FaUser,
  FaArrowLeft,
  FaSearch,
  FaBell,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  const sections = [
    {
      id: 'intro',
      title: '1) Who We Are & Scope',
      body: (
        <>
          <p className="mb-3">
            Ilyzlist (“we”, “our”, “us”) operates the <strong>ilyzlist-ia</strong> mobile/web app that analyzes
            children’s drawings to help parents and educators observe emotional and developmental signals. This
            Privacy Policy explains how we handle personal data of adult users (parents/guardians/teachers) and
            data about children that those adults choose to upload.
          </p>
          <p className="text-sm">
            <strong>Controller:</strong> Ilyzlist. Contact: <a href="mailto:privacy@ilyzlist.io" className="underline">privacy@ilyzlist.io</a>.
            We are based in France and follow the EU GDPR and French CNIL guidance. When used in the U.S., we also
            apply COPPA. For California residents, we provide CCPA/CPRA disclosures and rights.
          </p>
        </>
      ),
    },
    {
      id: 'key-terms',
      title: '2) Key Terms',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Adult User:</strong> Parent/guardian/teacher who creates an account and controls a child’s data in the app.</li>
          <li><strong>Child:</strong> A minor whose drawing(s) or related information is uploaded by an Adult User.</li>
          <li><strong>Processing:</strong> Any operation performed on personal data (e.g., storage, analysis).</li>
          <li><strong>Service:</strong> The ilyzlist-ia app, API, and related websites.</li>
        </ul>
      ),
    },
    {
      id: 'data-we-collect',
      title: '3) Data We Collect',
      body: (
        <>
          <p className="mb-2 text-sm">We collect only what is needed to provide the Service:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Account Data (Adult User):</strong> email, name (optional), password (hashed), subscription status/plan, analysis quota/usage, support messages.</li>
            <li><strong>Child Profile Data:</strong> first name or nickname, date of birth or age range, optional notes you add.</li>
            <li><strong>Drawings & Media:</strong> images you upload (and their metadata).</li>
            <li><strong>AI Analysis Results:</strong> model-generated labels/scores, explanations, and any derived features for trends and reports (e.g., PDFs).</li>
            <li><strong>Usage & Device Data:</strong> app navigation, feature interactions, crash logs, and basic device information (browser, OS, language, IP truncated/anonymized where feasible).</li>
            <li><strong>Payment Data:</strong> handled by Stripe. We receive limited billing metadata (e.g., last 4 digits tokenized by Stripe, subscription product/price, status, invoices) — we do not store complete card numbers.</li>
            <li><strong>Cookies/Local Storage:</strong> session tokens (e.g., Supabase auth), preferences, and anti-fraud signals.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'sources',
      title: '4) Sources of Data',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Data you provide directly in the app.</li>
          <li>Automatically via the app (usage/device logs, session management).</li>
          <li>From integrated services you opt into (e.g., Stripe for payments, classroom/teacher accounts you invite).</li>
        </ul>
      ),
    },
    {
      id: 'purposes-legal-bases',
      title: '5) Purposes & Legal Bases (GDPR)',
      body: (
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Provide the Service</strong> (create accounts, upload drawings, run analyses, generate reports, manage quotas): <em>Contract performance</em> (Art. 6(1)(b)).</li>
          <li><strong>Improve and secure the Service</strong> (quality, debugging, security, fraud prevention): <em>Legitimate interests</em> (Art. 6(1)(f)), balanced against your rights.</li>
          <li><strong>Use of drawings/metadata to improve AI</strong> (model training/evaluation): <em>Consent</em> (Art. 6(1)(a)). You can opt out anytime (see Section 14).</li>
          <li><strong>Communications</strong> (service notices, receipts, product updates): <em>Contract</em> / <em>Legitimate interests</em>. Marketing emails require your <em>Consent</em> (opt-in).</li>
          <li><strong>Payments & compliance</strong> (invoicing, accounting, tax, legal requests): <em>Legal obligation</em> (Art. 6(1)(c)).</li>
          <li><strong>Children’s data</strong>: We rely on the <em>verifiable consent</em> of a parent/guardian or school/teacher acting with parental authorization (Art. 8). In France, digital consent from children generally requires parental consent under age 15.</li>
        </ul>
      ),
    },
    {
      id: 'ai',
      title: '6) AI Processing & Human Oversight',
      body: (
        <>
          <p className="text-sm mb-2">
            Our AI analyzes visual patterns in drawings (e.g., color usage, composition). Results are probabilistic and are
            intended for <strong>informational purposes only</strong> and not a diagnosis. You can add your own notes and share
            results with a professional if you wish.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>No solely automated decisions with legal effects.</strong></li>
            <li><strong>Training data:</strong> We may use <em>anonymized</em> and <em>pseudonymized</em> content to improve models only with your consent (off by default if required by law). You may opt out at any time.</li>
            <li><strong>Explanation:</strong> We describe which features influenced a given result when available (e.g., colors or shapes), but models can be complex and not fully interpretable.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'sharing',
      title: '7) Sharing & Disclosures',
      body: (
        <>
          <p className="text-sm mb-2"><strong>We do not sell personal data.</strong> We share data only as needed to provide the Service:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Supabase</strong> (auth, database, storage with Row-Level Security and signed URLs).</li>
            <li><strong>Stripe</strong> (payments, subscriptions, invoices).</li>
            <li><strong>Vercel</strong> (hosting/deployment, error logs, CDN).</li>
            <li><strong>Email/SMS providers</strong> (transactional communications you request).</li>
            <li><strong>Optional classroom/teacher sharing</strong>: You can invite a teacher or school account; they will only see data you explicitly share.</li>
            <li><strong>ilyzlist.io (fundraising app)</strong>: By default, analyses remain private. You may choose to share a drawing or selected excerpts in a fundraising campaign; we will only share what you select, with clear, granular consent.</li>
            <li><strong>Legal</strong>: to comply with law, court orders, or defend our rights.</li>
            <li><strong>Business transfers</strong>: if we undergo a merger, acquisition, or asset sale, we will notify you and honor this Policy.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'transfers',
      title: '8) International Data Transfers',
      body: (
        <p className="text-sm">
          We strive to store EEA/UK data in the EEA when possible. Some processors (e.g., hosting/CDN or email) may process
          data outside your country. When we transfer personal data internationally, we use appropriate safeguards, such as
          the EU Commission’s Standard Contractual Clauses (SCCs) and additional technical measures (encryption in transit and
          at rest).
        </p>
      ),
    },
    {
      id: 'security',
      title: '9) Security',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>TLS encryption in transit; encrypted storage for drawings and analysis results where supported.</li>
          <li>Role-based access, Row-Level Security rules, and signed URL access for media files.</li>
          <li>Least-privilege service keys and periodic key rotation.</li>
          <li>Monitoring, audit logs, and incident response procedures. We will notify you and regulators where legally required.</li>
        </ul>
      ),
    },
    {
      id: 'retention',
      title: '10) Data Retention',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Account & child profiles: retained while your account is active.</li>
          <li>Drawings & analysis: retained until you delete them or delete your account.</li>
          <li>Logs & analytics: typically ≤ 13 months (shorter where feasible).</li>
          <li>Billing & invoices: retained as required by law (e.g., up to 10 years for accounting/tax in France).</li>
          <li>Backups: automatically cycled; deletions propagate on the next cycle.</li>
        </ul>
      ),
    },
    {
      id: 'rights',
      title: '11) Your Rights (EEA/UK)',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Access, rectification, erasure.</li>
          <li>Restriction and objection to processing.</li>
          <li>Portability of data you provided to us.</li>
          <li>Withdraw consent at any time (for example, model-training consent).</li>
          <li>Lodge a complaint with your authority (e.g., CNIL in France).</li>
        </ul>
      ),
    },
    {
      id: 'child-rights',
      title: '12) Children’s Privacy, Parental Consent & Schools',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Only an Adult User may create an account and upload a child’s drawings.</li>
          <li>In the EU/France: we require parental/guardian consent for children under applicable age (generally 15 in France for digital services).</li>
          <li>In the United States: for children under 13, we follow COPPA and obtain verifiable parental consent.</li>
          <li>Teachers/schools using the Service represent that they obtained necessary parental authorizations.</li>
          <li>You may delete a child’s profile/drawings at any time and revoke sharing.</li>
        </ul>
      ),
    },
    {
      id: 'ccpa',
      title: '13) California Privacy (CCPA/CPRA)',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>We do not “sell” personal information or share for cross-context behavioral advertising.</li>
          <li>Rights include: know/access, correct, delete, and limit use of sensitive PI.</li>
          <li>Submit requests via <a href="mailto:privacy@ilyzlist.io" className="underline">privacy@ilyzlist.io</a>. We will verify and respond as required by law.</li>
        </ul>
      ),
    },
    {
      id: 'cookies',
      title: '14) Cookies & Local Storage',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Authentication/session (e.g., Supabase auth tokens).</li>
          <li>Feature preferences (UI theme, language).</li>
          <li>Essential security/anti-fraud signals.</li>
          <li>You can configure your browser to block cookies, but essential cookies are necessary for login and uploads.</li>
        </ul>
      ),
    },
    {
      id: 'choices',
      title: '15) Your Choices & Controls',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Delete content:</strong> delete any drawing or child profile from the app.</li>
          <li><strong>Account deletion:</strong> request in settings or via <a href="mailto:privacy@ilyzlist.io" className="underline">privacy@ilyzlist.io</a>.</li>
          <li><strong>AI training opt-out:</strong> toggle off in settings or email us. We will exclude future uploads from training and, where feasible, remove past items from future training sets.</li>
          <li><strong>Marketing opt-out:</strong> unsubscribe links in emails.</li>
        </ul>
      ),
    },
    {
      id: 'payments',
      title: '16) Payments & Subscriptions',
      body: (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Stripe processes your payment data; we never store full card numbers.</li>
          <li>We store subscription status/plan (Freemium/Basic/Premium), analysis limits, and quota usage to enforce features.</li>
          <li>When your quota is exhausted, you may upgrade; after cancellation, we retain invoices as required by law.</li>
        </ul>
      ),
    },
    {
      id: 'changes',
      title: '17) Changes to This Policy',
      body: (
        <p className="text-sm">
          We may update this Policy to reflect changes in our Service or the law. We will post updates here and, if changes
          are material, provide prominent notice (e.g., in-app banner or email). Your continued use of the Service after the
          effective date means you agree to the updated Policy.
        </p>
      ),
    },
    {
      id: 'contact',
      title: '18) Contact & DPO',
      body: (
        <p className="text-sm">
          Email: <a href="mailto:privacy@ilyzlist.io" className="underline">privacy@ilyzlist.io</a>
          <br />
          If you are in the EEA/UK, you may also contact your local supervisory authority (e.g., CNIL in France).
          <br />
          <span className="opacity-70">Last Updated: {new Date().toLocaleDateString()}</span>
        </p>
      ),
    },
  ];

  const [expanded, setExpanded] = useState(null);
  const toggle = (i) => setExpanded(expanded === i ? null : i);

  return (
    <>
      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-1" aria-label="Back">
              <FaArrowLeft className="text-[#3742D1] text-xl" />
            </button>
            <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
              Privacy Policy
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSearch((v) => !v)}
              className="p-2"
              aria-label="Search"
            >
              <FaSearch className="text-[#3742D1]" />
            </button>
            <button className="p-2" aria-label="Notifications">
              <FaBell className="text-[#3742D1]" />
            </button>
          </div>
        </header>

        {/* Search Bar */}
        {showSearch && (
          <div className="mb-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-[#3742D1]" />
              </div>
              <input
                type="text"
                placeholder="Search privacy policy..."
                className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl font-league-spartan text-gray-800 placeholder-[#809CFF] focus:outline-none border-none focus:ring-2 focus:ring-[#3742D1]"
              />
            </div>
          </div>
        )}

        {/* Policy Sections */}
        <div className="font-league-spartan text-black">
          {sections.map((sec, i) => {
            const open = expanded === i;
            return (
              <section key={sec.id} id={sec.id} className="mb-4 bg-[#ECF1FF] rounded-xl">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-base font-semibold text-[#3742D1]">{sec.title}</span>
                  {open ? (
                    <FaChevronUp className="text-[#3742D1]" />
                  ) : (
                    <FaChevronDown className="text-[#3742D1]" />
                  )}
                </button>
                {open && <div className="px-4 pb-4 text-sm">{sec.body}</div>}
              </section>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-3 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-white" aria-label="Home">
          <FaHome className="text-xl" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={() => router.push('/drawings/upload')} className="flex flex-col items-center text-white" aria-label="Upload">
          <FaUpload className="text-xl" />
          <span className="text-xs mt-1">Upload</span>
        </button>
        <button onClick={() => router.push('/account')} className="flex flex-col items-center text-white" aria-label="Account">
          <FaUser className="text-xl" />
          <span className="text-xs mt-1">Account</span>
        </button>
      </nav>

      <style jsx global>{`
        @font-face {
          font-family: "League Spartan";
          src:
            url("/fonts/league-spartan.woff2") format("woff2"),
            url("/fonts/league-spartan.woff") format("woff");
          font-weight: 400;
          font-style: normal;
        }
        .font-league-spartan {
          font-family: "League Spartan", sans-serif;
        }
      `}</style>
    </>
  );
}
