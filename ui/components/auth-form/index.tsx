"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      if (isForgotPassword) {
        await resetPassword(email)
        setSuccessMessage("Password reset email sent! Check your inbox.")
        setEmail("")
      } else if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred during Google Sign In")
      }
    }
  }

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword)
    setError("")
    setSuccessMessage("")
    setPassword("")
  }

  return (
    <Card className="w-full max-w-md border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Sign Up"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isForgotPassword
            ? "Enter your email to receive a password reset link"
            : isLogin
              ? "Welcome back to Birthday Tracker"
              : "Create your Birthday Tracker account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          {!isForgotPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background"
              />
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">{successMessage}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : isForgotPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Sign Up"}
          </Button>

          {!isForgotPassword && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="icon" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
              </Button>
            </>
          )}

          {isLogin && !isForgotPassword && (
            <Button type="button" variant="link" className="w-full text-sm" onClick={toggleForgotPassword}>
              Forgot Password?
            </Button>
          )}

          {!isForgotPassword && (
            <Button type="button" variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          )}

          {isForgotPassword && (
            <Button type="button" variant="ghost" className="w-full" onClick={toggleForgotPassword}>
              Back to Sign In
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
