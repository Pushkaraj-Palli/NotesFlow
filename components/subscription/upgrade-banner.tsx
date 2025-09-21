"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, ArrowRight, Sparkles } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

interface UpgradeBannerProps {
  onUpgrade: () => void
}

export function UpgradeBanner({ onUpgrade }: UpgradeBannerProps) {
  const { tenant } = useAuthStore()

  if (tenant?.plan === "pro") return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Unlock Premium Features
                  <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get unlimited notes, advanced search, team collaboration, and more
                </p>
              </div>
            </div>
            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
