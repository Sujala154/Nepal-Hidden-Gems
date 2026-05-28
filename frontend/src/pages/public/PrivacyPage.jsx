import React from "react";

const PrivacyPage = () => {
  const sections = [
    {
      title: "Data We Collect",
      body: "Account details, preferences, and activity needed to provide guide matching, trip planning, and secure bookings.",
    },
    {
      title: "How We Use It",
      body: "To power core features, improve recommendations, and keep your account secure. We do not sell your data.",
    },
    {
      title: "Your Controls",
      body: "You can request exports or deletion anytime. Reach us at support@nepalhiddengems.com.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
      <p className="text-slate-600 mb-10">
        We respect your privacy. This summary covers the essentials so you can travel confidently.
      </p>
      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-2">{section.title}</h2>
            <p className="text-slate-600 leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPage;

