"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, GraduationCap, ArrowRight, Info } from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@thofnaa.lk");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter administrator email and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Simulate successful admin authentication
      router.push("/admin");
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-thofnaa-navy text-thofnaa-gold flex items-center justify-center mx-auto shadow-academic gold-border-top">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-thofnaa-navy">
          THOFNAA Admin Portal
        </h1>
        <p className="text-xs text-thofnaa-charcoal-muted">
          Administrative Verification & Student Management
        </p>
      </div>

      <Card goldHeaderBorder className="shadow-md">
        <CardHeader className="bg-white">
          <CardTitle className="text-base text-center">Administrator Sign In</CardTitle>
          <CardDescription className="text-center">
            Sign in with your authorized THOFNAA credentials.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email Address"
              type="email"
              placeholder="admin@thofnaa.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <FormError message={error} />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full font-bold shadow-md"
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Demo Hint Box */}
          <div className="p-3.5 rounded-lg bg-thofnaa-navy-50 border border-thofnaa-navy-100 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-thofnaa-navy">
              <Info className="w-4 h-4 text-thofnaa-gold shrink-0" />
              <span>Development Demo Credentials</span>
            </div>
            <p className="text-[11px] text-thofnaa-charcoal leading-relaxed font-mono">
              Email: <strong>admin@thofnaa.lk</strong> <br />
              Password: <strong>admin123</strong>
            </p>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 text-center justify-center">
          <Link href="/" className="text-xs text-thofnaa-navy hover:underline font-medium">
            ← Return to Public Student Portal
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
