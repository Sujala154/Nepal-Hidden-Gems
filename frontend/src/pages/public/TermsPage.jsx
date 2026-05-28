import React from "react";

const TermsPage = () => {
  const items = [
    "Use the platform responsibly and follow local regulations when traveling.",
    "Bookings, payments, and cancellations may be subject to partner-specific policies.",
    "User-generated content must be accurate, respectful, and free of infringement.",
    "We may update these terms as features evolve; we will notify you of material changes.",
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
      <p className="text-slate-600 mb-10">
        A concise overview of the rules that keep Nepal Hidden Gems safe and useful for everyone.
      </p>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <span className="text-amber-500 font-semibold">•</span>
            <p className="text-slate-700 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TermsPage;

