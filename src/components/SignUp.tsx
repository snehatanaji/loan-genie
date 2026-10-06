import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ShootingStars } from './ui/shooting-stars'
import { StarsBackground } from './ui/stars-background'

export default function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        // Show the verification modal
        setShowModal(true)
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGotIt = () => {
    setShowModal(false)
    navigate('/')
  }

  const handleCloseTerms = () => {
    setShowTermsModal(false)
  }

  const handleClosePrivacy = () => {
    setShowPrivacyModal(false)
  }

  return (
    <div className="min-h-screen w-screen bg-neutral-900 relative overflow-hidden">
      <StarsBackground />
      <ShootingStars />
      <div className="w-full h-screen flex items-center justify-center relative z-10">
        <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/20">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Create Account</h1>
              <p className="text-sm sm:text-base text-gray-300 mt-2">Join us today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-3 sm:space-y-4">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-400"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-400"
                  placeholder="Create a password"
                  required
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-400"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-200">
                  I agree to the{' '}
                  <span
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Privacy Policy
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-sm sm:text-base text-gray-300">
              Already have an account?{' '}
              <a
                href="/"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/20">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                <p className="text-gray-300">
                  We've sent you a verification link. Please check your email to verify your account.
                </p>
              </div>
              <button
                onClick={handleGotIt}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-white/20 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
                <button
                  onClick={handleCloseTerms}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h3>
                  <p>By accessing and using Loan Genie, you agree to be bound by these Terms of Service.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-2">2. Use of Service</h3>
                  <p>You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-2">3. Loan Services</h3>
                  <p>Our loan services are subject to verification and approval. We reserve the right to deny any loan application at our discretion.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-2">4. User Responsibilities</h3>
                  <p>You agree to provide accurate information and maintain the security of your account.</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-white/20 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
                <button
                  onClick={handleClosePrivacy}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h3>
                  <p>We collect personal information including name, email, and financial information to provide our services.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-2">2. How We Use Your Information</h3>
                  <p>We use your information to process loan applications, verify your identity, and provide customer support.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-2">3. Data Security</h3>
                  <p>We implement security measures to protect your personal information from unauthorized access.</p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-2">4. Your Rights</h3>
                  <p>You have the right to access, correct, or delete your personal information at any time.</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 