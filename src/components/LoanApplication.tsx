import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Menu, MenuItem, HoveredLink, NavButton } from './ui/navbar-menu'
import { ShootingStars } from './ui/shooting-stars'
import { StarsBackground } from './ui/stars-background'

interface ApplicationForm {
  loanAmount: number
  loanType: string
  purpose: string
  term: number
  documents: FileList | null
}

export default function LoanApplication() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ApplicationForm>({
    loanAmount: 0,
    loanType: '',
    purpose: '',
    term: 12,
    documents: null
  })
  const [submitted, setSubmitted] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen w-screen bg-neutral-900 relative overflow-hidden">
      <StarsBackground />
      <ShootingStars />
      
      {/* Navigation Bar */}
      <div className="fixed top-10 inset-x-0 z-50">
        <Menu setActive={setActive}>
          <div className="flex items-center space-x-6">
            <HoveredLink to="/" className="text-white font-medium">
              Home
            </HoveredLink>
            <MenuItem setActive={setActive} active={active} item="Services">
              <div className="flex flex-col space-y-3 text-sm">
                <HoveredLink to="/eligibility">Check Eligibility</HoveredLink>
                <HoveredLink to="/application">Apply for Loan</HoveredLink>
                <HoveredLink to="/literacy">Financial Education</HoveredLink>
              </div>
            </MenuItem>
          </div>
          <NavButton onClick={() => supabase.auth.signOut()}>
            Sign out
          </NavButton>
        </Menu>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8">Loan Application</h1>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white mb-2">Loan Amount ($)</label>
                <input
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Loan Type</label>
                <select
                  value={formData.loanType}
                  onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                >
                  <option value="">Select loan type</option>
                  <option value="personal">Personal Loan</option>
                  <option value="home">Home Loan</option>
                  <option value="auto">Auto Loan</option>
                  <option value="business">Business Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Purpose</label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Loan Term (months)</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: Number(e.target.value) })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                >
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="48">48 months</option>
                  <option value="60">60 months</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Required Documents</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFormData({ ...formData, documents: e.target.files })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Application
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="bg-green-500/20 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-green-400 mb-4">Application Submitted!</h2>
                <p className="text-white">
                  Thank you for your application. We will review it and get back to you soon.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-white hover:text-blue-400 transition-colors"
              >
                Submit Another Application
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 