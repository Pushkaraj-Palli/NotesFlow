"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Users, Search, Download, Zap, Star } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["Up to 50 notes", "Basic search", "Up to 5 team members", "Email support"],
    limitations: ["Limited storage", "Basic features only"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "Everything you need to scale",
    features: [
      "Unlimited notes",
      "Advanced search & filters",
      "Up to 50 team members",
      "Priority support",
      "Export capabilities",
      "API access",
      "Team collaboration",
      "Advanced analytics",
    ],
    limitations: [],
    popular: true,
  },
]

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { tenant } = useAuthStore()

  const handleUpgrade = (planName: string) => {
    // In a real app, this would integrate with Stripe or another payment processor
    alert(`Upgrading to ${planName} plan! This would integrate with your payment processor.`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Choose Your Plan</DialogTitle>
          <p className="text-center text-muted-foreground">
            Unlock the full potential of NotesFlow with our premium features
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {plan.name === "Pro" ? (
                      <Crown className="w-8 h-8 text-primary" />
                    ) : (
                      <Users className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={tenant?.plan === plan.name.toLowerCase()}
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {tenant?.plan === plan.name.toLowerCase() ? (
                      "Current Plan"
                    ) : plan.name === "Free" ? (
                      "Downgrade"
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        {plan.popular && <Zap className="w-4 h-4 ml-2" />}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-primary" />
            <span className="font-medium">Pro Plan Benefits</span>
          </div>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Search className="w-3 h-3" />
              Advanced search & filtering
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-3 h-3" />
              Export to PDF, Word, Markdown
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              Team collaboration tools
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Priority customer support
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
