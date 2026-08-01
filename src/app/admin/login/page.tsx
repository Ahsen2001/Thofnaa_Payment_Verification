"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { adminLoginAction } from "@/app/actions/adminAuthActions";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setIsLoading(true);
    const result = await adminLoginAction({ email, password });
    setIsLoading(false);

    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      setErrorMessage(result.error || "Invalid administrator credentials.");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 py-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-thofnaa-navy text-thofnaa-gold shadow-md border-2 border-thofnaa-gold/40 mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-thofnaa-navy">
          THOFNAA Admin Portal
        </h1>
        <p className="text-xs text-thofnaa-charcoal-muted">
          Staff Authentication & Verification Access
        </p>
      </div>

      <Card goldHeaderBorder className="shadow-xl">
        <CardHeader className="bg-thofnaa-navy text-white text-center py-6">
          <CardTitle className="text-white text-lg">Administrator Sign In</CardTitle>
          <CardDescription className="text-thofnaa-gold/90 text-xs">
            Enter your authorized staff credentials below.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff Email Address *"
              type="email"
              placeholder="tthofnaa@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-thofnaa-charcoal">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-thofnaa-charcoal-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-thofnaa-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-thofnaa-navy focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-thofnaa-navy"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <FormError message={errorMessage} />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full font-bold shadow-md mt-2"
            >
              Sign In to Admin Dashboard
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-gray-50/80 justify-center">
          <Link href="/" className="text-xs text-thofnaa-navy hover:underline flex items-center gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Student Payment Portal
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
