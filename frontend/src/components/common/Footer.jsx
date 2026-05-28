import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [buttonText, setButtonText] = useState("Subscribe");
  const [buttonMode, setButtonMode] = useState("default");
  const [isError, setIsError] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const handleSubscribe = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setIsError(true);
      setButtonText("Subscribe");
      setButtonMode("default");
      return;
    }

    setIsError(false);
    setButtonText("Done!");
    setButtonMode("success");
    setEmail("");

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    resetTimer.current = setTimeout(() => {
      setButtonText("Subscribe");
      setButtonMode("default");
    }, 3000);
  };

  const footerLinks = {
    discover: [
      { name: "Explore Gems", path: "/explore" },
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "Contact Support", path: "mailto:support@nepalhiddengems.com" },
    ],
  };

  const socialLinks = [
    { icon: FaFacebookF, href: "https://www.facebook.com", label: "Facebook" },
    { icon: FaInstagram, href: "https://www.instagram.com", label: "Instagram" },
  ];

  return (
    <footer className="bg-[#0b1f3a] text-white border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 flex flex-col">
            <Link to="/" className="flex items-center gap-3 mb-6 self-start">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white font-black text-lg">N</span>
              </div>
              <span className="text-xl font-black text-white uppercase tracking-widest">Nepal Hidden Gems</span>
            </Link>
            
            <div className="flex gap-[12px] mb-6 self-start">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#f39c12] hover:text-white"
                >
                  <social.icon className="w-3 h-3" />
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div>
              <h5 className="text-sm font-semibold text-white mb-2">Stay Updated</h5>
              <p className="text-xs text-slate-400 mb-3">Get the latest travel tips and hidden gems delivered to your inbox.</p>
              <div className="flex gap-[10px]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isError) setIsError(false);
                  }}
                  placeholder="Enter your email"
                  className={`flex-1 h-10 px-3 bg-white/5 border rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none transition-colors ${isError ? "border-red-500 bg-red-500/10 focus:border-red-400" : "border-white/10 focus:border-amber-500"}`}
                />
                <button
                  className={`h-10 px-4 rounded-lg font-medium transition-colors text-[#0b1f3a] ${buttonMode === "success" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-amber-500 hover:bg-amber-400"}`}
                  onClick={handleSubscribe}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="self-start">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4">
              Discover
            </h4>
            <ul className="space-y-3">
              {footerLinks.discover.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="self-start">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.path.startsWith("mailto:") ? (
                    <a href={link.path} className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                      {link.name}
                    </a>
                  ) : (
                    <Link to={link.path} className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Nepal Hidden Gems. Made for explorers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
