"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, Crown } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

interface UsageStatsProps {
  notesCount: number
  onUpgrade: () => void
}

export function UsageStats({ notesCount, onUpgrade }: UsageStatsProps) {
  const { tenant } = useAuthStore()

  if (!tenant) return null

  const maxNotes = tenant.settings.maxNotes
  const maxUsers = tenant.settings.maxUsers
  const usagePercentage = (notesCount / maxNotes) * 100
  const isNearLimit = usagePercentage > 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="border-0 shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Usage Overview
            </CardTitle>
            <Badge variant={tenant.plan === "pro" ? "default" : "secondary"} className="flex items-center gap-1">
              {tenant.plan === "pro" && <Crown className="w-3 h-3" />}
              {tenant.plan.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Notes Used</span>
              <span className={isNearLimit ? "text-orange-500 font-medium" : ""}>
                {notesCount} / {maxNotes === 1000 ? "Unlimited" : maxNotes}
              </span>
            </div>
            {maxNotes !== 1000 && (
              <Progress value={usagePercentage} className={`h-2 ${isNearLimit ? "bg-orange-100" : ""}`} />
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Team Members</span>
            <span>1 / {maxUsers}</span>
          </div>

          {tenant.plan === "free" && isNearLimit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
            >
              <p className="text-sm text-orange-700 dark:text-orange-300">
                You're approaching your note limit. Upgrade to Pro for unlimited notes!
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
