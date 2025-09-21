"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, UserRound } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("") // New state for name
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isRegistering, setIsRegistering] = useState(false) // State to toggle between login/register
  const { login, register, isLoading } = useAuthStore() // Get register function
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    let success = false
    if (isRegistering) {
      console.log("Attempting to register..."); // Add log for registration
      success = await register(email, password, name)
      if (success) {
        console.log("Registration successful! Redirecting to dashboard."); // Add log
        router.push("/dashboard")
      } else {
        console.error("Registration failed."); // Add log
        setError("Registration failed. Please try again.")
      }
    } else {
      console.log("Attempting to log in..."); // Add log for login
      success = await login(email, password)
      if (success) {
        console.log("Login successful! Redirecting to dashboard."); // Add log
        router.push("/dashboard")
      } else {
        console.error("Login failed."); // Add log
        setError("Invalid credentials. Try admin@acme.com / password")
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm ring-1 ring-primary/10">
        <CardHeader className="space-y-1 text-center">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {isRegistering ? "Create Account" : "Welcome Back"}
            </CardTitle>
          </motion.div>
          <CardDescription className="text-muted-foreground">
            {isRegistering ? "Sign up for a new NotesFlow account" : "Sign in to your NotesFlow account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-3 h-4 w-4 text-accent" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-accent" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-primary" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isRegistering ? "Registering..." : "Signing in..."}
                  </>
                ) : (
                  isRegistering ? "Register" : "Sign In"
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="text-center text-sm text-accent/80"
          >
            {isRegistering ? (
              <p>
                Already have an account?{" "}
                <Button variant="link" onClick={() => setIsRegistering(false)} className="p-0 h-auto align-baseline text-primary hover:underline">
                  Sign In
                </Button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <Button variant="link" onClick={() => setIsRegistering(true)} className="p-0 h-auto align-baseline text-primary hover:underline">
                  Sign Up
                </Button>
              </p>
            )}
            {!isRegistering && <p className="mt-2">Demo credentials: admin@acme.com / password</p>}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
