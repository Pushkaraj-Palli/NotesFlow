"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Crown, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

interface FeatureGateProps {
  feature: string
  description: string
  onUpgrade: () => void
  children?: React.ReactNode
}

export function FeatureGate({ feature, description, onUpgrade, children }: FeatureGateProps) {
  const { tenant } = useAuthStore()

  const hasAccess = tenant?.plan === "pro" || tenant?.settings.features.includes(feature)

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Premium Feature</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{description}</p>
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
