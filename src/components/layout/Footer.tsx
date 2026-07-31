import React from "react";
import Link from "next/link";
import { GraduationCap, Phone, Mail, CheckCircle, ShieldCheck } from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-thofnaa-navy text-white border-t-4 border-thofnaa-gold mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institute Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-thofnaa-gold flex items-center justify-center text-thofnaa-navy shadow-gold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-white tracking-tight">
                  {THOFNAA_CONFIG.name}
                </h3>
                <p className="text-xs text-thofnaa-gold font-mono uppercase tracking-wider">
                  Official Payment Verification Portal
                </p>
              </div>
            </div>
            <p className="text-xs text-thofnaa-ivory/80 leading-relaxed max-w-md">
              Providing premier Sinhala language tuition for school curriculum and practical conversation. 
              Submitting payment proof online ensures instant administrative verification and automatic parent receipts.
            </p>
            <div className="flex items-center gap-3 text-xs text-thofnaa-gold font-medium">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Instant Reference Generation</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verified Parent Email Receipts</span>
            </div>
          </div>

          {/* Col 2: Bank Transfer Reference */}
          <div className="space-y-3 bg-thofnaa-navy-900/60 p-4 rounded-xl border border-thofnaa-gold/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-thofnaa-gold font-mono flex items-center gap-1.5">
              🏦 Official Bank Details
            </h4>
            <div className="text-xs space-y-1 text-thofnaa-ivory/90">
              <p><span className="text-thofnaa-ivory/60">Bank:</span> <strong className="text-white">{THOFNAA_CONFIG.bankDetails.bankName}</strong></p>
              <p><span className="text-thofnaa-ivory/60">Acc No:</span> <strong className="text-thofnaa-gold font-mono">{THOFNAA_CONFIG.bankDetails.accountNumber}</strong></p>
              <p><span className="text-thofnaa-ivory/60">Holder:</span> <strong className="text-white">{THOFNAA_CONFIG.bankDetails.accountHolder}</strong></p>
            </div>
            <p className="text-[10px] text-thofnaa-ivory/60 italic">
              Monthly Tuition: LKR {THOFNAA_CONFIG.tuition.monthlyFeeLKR.toLocaleString()}.00
            </p>
          </div>

          {/* Col 3: Contact & Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-thofnaa-gold font-mono">
              Contact Support
            </h4>
            <ul className="space-y-2 text-xs text-thofnaa-ivory/80">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-thofnaa-emerald shrink-0" />
                <a href={THOFNAA_CONFIG.contact.whatsappLink} target="_blank" rel="noreferrer" className="hover:text-thofnaa-gold transition-colors font-mono">
                  WhatsApp: {THOFNAA_CONFIG.contact.whatsappFormatted}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-thofnaa-emerald shrink-0" />
                <a href={`mailto:${THOFNAA_CONFIG.contact.email}`} className="hover:text-thofnaa-gold transition-colors font-mono">
                  {THOFNAA_CONFIG.contact.email}
                </a>
              </li>
              <li className="pt-2 border-t border-thofnaa-navy-800">
                <Link href="/admin/login" className="inline-flex items-center gap-1 text-[11px] text-thofnaa-gold/80 hover:text-thofnaa-gold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Verification Login</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-thofnaa-navy-800 flex flex-col sm:flex-row justify-between items-center text-xs text-thofnaa-ivory/60 gap-3">
          <p>© {new Date().getFullYear()} THOFNAA INSTITUTE. All rights reserved.</p>
          <p className="font-serif italic text-thofnaa-gold/80">
            {THOFNAA_CONFIG.secondaryTagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
