"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Crown, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Badge } from "@/components/ui/badge";

export default function ManageSubscriptionPage() {
  const { user, tenant, setTenant } = useAuthStore();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro">(tenant?.plan || "free");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (tenant?.plan) {
      setSelectedPlan(tenant.plan);
    }
  }, [tenant]);

  // Redirect if not admin (client-side check, server-side is also in API route)
  if (user?.role !== "admin") {
    router.push("/dashboard");
    return null;
  }

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (selectedPlan === tenant?.plan) {
      setMessage({ type: "error", text: `Already on ${selectedPlan} plan.` });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch("/api/tenant/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPlan: selectedPlan }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || `Subscription upgraded to ${selectedPlan} plan!` });
        if (data.tenant) {
          setTenant({ ...data.tenant, _id: data.tenant._id.toString() }); // Update Zustand store
        }
      } else {
        setMessage({ type: "error", text: data.error || "Failed to upgrade subscription." });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm ring-1 ring-primary/10">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Manage Subscription
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                View and change your tenant's subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tenant && (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-warning" />
                    <span className="font-medium">Current Plan: {tenant.plan.toUpperCase()}</span>
                  </div>
                  <Badge variant={tenant.plan === "pro" ? "default" : "secondary"}>
                    {tenant.plan === "pro" ? "Unlimited Notes" : `${tenant.settings.maxNotes} Notes`}
                  </Badge>
                </div>
              )}

              <form onSubmit={handleUpgrade} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Select New Plan</Label>
                  <Select value={selectedPlan} onValueChange={(value: "free" | "pro") => setSelectedPlan(value)}>
                    <SelectTrigger className="pl-3 focus:ring-primary/20 focus:border-primary">
                      <RefreshCcw className="mr-2 h-4 w-4 text-accent" />
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (3 Notes, 1 User)</SelectItem>
                      <SelectItem value="pro">Pro (Unlimited Notes, 1000 Users)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {message && (
                  <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading || selectedPlan === tenant?.plan}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upgrading...
                    </>
                  ) : (
                    `Upgrade to ${selectedPlan.toUpperCase()}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
