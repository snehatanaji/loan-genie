import { useState } from 'react'
import { Menu, MenuItem, HoveredLink, NavButton } from './ui/navbar-menu'
import { ShootingStars } from './ui/shooting-stars'
import { StarsBackground } from './ui/stars-background'
import { supabase } from '../lib/supabase'

interface Tip {
  id: number
  title: string
  content: string
  category: string
}

const financialTips: Tip[] = [
  {
    id: 1,
    title: 'Understanding Credit Scores',
    content: 'Your credit score is a crucial factor in loan approval. Learn how to maintain a good score by paying bills on time, keeping credit utilization low, and maintaining a mix of credit types.',
    category: 'credit'
  },
  {
    id: 2,
    title: 'Budgeting Basics',
    content: 'Create a monthly budget to track income and expenses. This helps you understand your financial position and make informed decisions about borrowing.',
    category: 'budgeting'
  },
  {
    id: 3,
    title: 'Loan Types Explained',
    content: 'Different loans serve different purposes. Understand the differences between personal, home, auto, and business loans to choose the right one for your needs.',
    category: 'loans'
  },
  {
    id: 4,
    title: 'Interest Rates',
    content: 'Learn how interest rates work and how they affect your loan payments. Fixed vs. variable rates, APR vs. interest rate, and how to compare offers.',
    category: 'loans'
  },
  {
    id: 5,
    title: 'Emergency Fund',
    content: 'Build an emergency fund with 3-6 months of expenses before taking on debt. This provides a safety net for unexpected financial challenges.',
    category: 'savings'
  }
]

export default function FinancialLiteracy() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [active, setActive] = useState<string | null>(null)
  const categories = ['all', ...new Set(financialTips.map(tip => tip.category))]

  const filteredTips = selectedCategory === 'all'
    ? financialTips
    : financialTips.filter(tip => tip.category === selectedCategory)

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
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 mb-8">
          <h1 className="text-3xl font-bold text-white mb-8">Financial Literacy Center</h1>
          
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredTips.map(tip => (
              <div
                key={tip.id}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/20"
              >
                <h2 className="text-xl font-bold text-white mb-3">{tip.title}</h2>
                <p className="text-white/80">{tip.content}</p>
                <div className="mt-4">
                  <span className="text-sm text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                    {tip.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Additional Resources</h2>
            <ul className="space-y-3 text-white/80">
              <li>• Financial Planning Tools and Calculators</li>
              <li>• Debt Management Strategies</li>
              <li>• Investment Basics</li>
              <li>• Retirement Planning</li>
              <li>• Tax Planning</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
} 