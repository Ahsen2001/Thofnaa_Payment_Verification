"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { adminLogoutAction } from "@/app/actions/adminAuthActions";
import { THOFNAA_CONFIG } from "@/lib/constants";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full shadow-xl border-2 border-red-200">
        <CardHeader className="bg-gradient-to-r from-red-900 to-red-800 text-white text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 border border-white/20">
            <ShieldAlert className="w-10 h-10 text-red-300" />
          </div>
          <CardTitle className="text-2xl font-serif text-white">
            Access Denied
          </CardTitle>
          <CardDescription className="text-red-100 text-xs">
            Unauthorized or Inactive Administrator Account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-6 text-center">
          <p className="text-sm text-thofnaa-charcoal leading-relaxed">
            Your login credentials are valid, but your account does not have active administrative privileges (<code className="font-mono text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">admin_profiles.active = true</code>).
          </p>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-1">
            <strong className="block text-amber-950 font-bold">Need Access?</strong>
            <p>
              Please contact the THOFNAA INSTITUTE Super Administrator or system manager to activate your staff profile.
            </p>
            <div className="pt-2 text-[11px] font-mono text-amber-800">
              WhatsApp: <a href={THOFNAA_CONFIG.contact.whatsappLink} target="_blank" rel="noreferrer" className="underline font-bold">{THOFNAA_CONFIG.contact.whatsappFormatted}</a>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 flex flex-col gap-3">
          <form action={adminLogoutAction} className="w-full">
            <Button
              type="submit"
              variant="danger"
              size="md"
              leftIcon={<LogOut className="w-4 h-4" />}
              className="w-full font-bold"
            >
              Sign Out & Return to Login
            </Button>
          </form>

          <Link href="/" className="w-full">
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="w-full text-xs font-semibold bg-white border-gray-300"
            >
              Back to Student Portal
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
