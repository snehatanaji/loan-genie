import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Menu, MenuItem, HoveredLink, NavButton } from './ui/navbar-menu'
import { ShootingStars } from './ui/shooting-stars'
import { StarsBackground } from './ui/stars-background'

interface EligibilityForm {
  age: number
  experience: number
  income: number
  familySize: number
  creditCardSpending: number
  education: number
  mortgageValue: number
  hasSecurities: number
  hasCD: number
  usesOnlineBanking: number
  hasCreditCard: number
}

interface MLPredictionResult {
  probability: number
  eligible: boolean
  confidence: string
}

interface AnalysisResult {
  eligible: boolean
  message: string
  recommendations: string[]
  loanTypes: string[]
  tips: string[]
  financialContext: {
    incomeAnalysis: string
    spendingPatterns: string
    financialHealth: string
    riskAssessment: string
    creditProfile: string
  }
}

export default function LoanEligibility() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<EligibilityForm>({
    age: 18,
    experience: 0,
    income: 10,
    familySize: 1,
    creditCardSpending: 0,
    education: 1,
    mortgageValue: 0,
    hasSecurities: 0,
    hasCD: 0,
    usesOnlineBanking: 0,
    hasCreditCard: 0
  })
  const [mlResult, setMlResult] = useState<MLPredictionResult | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<string | null>(null)

  const checkMLEligibility = async (data: EligibilityForm) => {
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: data.age,
          experience: data.experience,
          income: data.income,
          family_size: data.familySize,
          ccavg: data.creditCardSpending,
          education: data.education,
          mortgage: data.mortgageValue,
          securities_account: data.hasSecurities,
          cd_account: data.hasCD,
          online: data.usesOnlineBanking,
          credit_card: data.hasCreditCard
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get ML prediction');
      }

      const prediction = await response.json();
      setMlResult(prediction);
      return prediction.eligible;
    } catch (err) {
      console.error('ML Prediction error:', err);
      throw err;
    }
  }

  const analyzeEligibility = async (data: EligibilityForm, mlEligible: boolean) => {
    const prompt = `Analyze the following loan eligibility criteria for an Indian loan applicant and provide a detailed assessment. Note that our model has predicted the applicant is ${mlEligible ? 'eligible' : 'not eligible'} for a loan.

Age: ${data.age}
Years of Experience: ${data.experience}
Annual Income: ₹${(data.income * 100000).toLocaleString('en-IN')} (${data.income} lakhs)
Family Size: ${data.familySize}
Monthly Credit Card Spending: ₹${(data.creditCardSpending).toLocaleString('en-IN')}
Education Level: ${data.education === 1 ? 'Undergraduate' : data.education === 2 ? 'Graduate' : 'Advanced/Professional'}
Mortgage Value: ₹${(data.mortgageValue * 100000).toLocaleString('en-IN')} (${data.mortgageValue} lakhs)
Has Securities Account: ${data.hasSecurities === 1 ? 'Yes' : 'No'}
Has Fixed Deposit Account: ${data.hasCD === 1 ? 'Yes' : 'No'}
Uses Online Banking: ${data.usesOnlineBanking === 1 ? 'Yes' : 'No'}
Has Credit Card: ${data.hasCreditCard === 1 ? 'Yes' : 'No'}

Please provide an India-specific financial analysis including:
1. Overall eligibility assessment considering the model's prediction and Indian banking norms
2. Available loan types based on the profile (e.g., Home Loan, Personal Loan, etc.) with typical Indian bank offerings
3. Specific recommendations for improvement if not eligible, considering Indian financial context
4. Financial tips relevant to Indian banking and credit system
5. Detailed financial context analysis including:
   - Income analysis (considering Indian salary standards and cost of living)
   - Spending patterns and financial behavior (in Indian context)
   - Overall financial health evaluation (compared to Indian averages)
   - Risk assessment (based on Indian banking standards)
   - Credit profile analysis (considering Indian credit scoring system)

Format the response as a JSON object with the following structure:
{
  "eligible": ${mlEligible},
  "message": string (with India-specific context),
  "recommendations": string[] (with India-specific recommendations),
  "loanTypes": string[] (with Indian bank loan products),
  "tips": string[] (relevant to Indian financial system),
  "financialContext": {
    "incomeAnalysis": string (analysis in Indian context),
    "spendingPatterns": string (analysis relative to Indian standards),
    "financialHealth": string (compared to Indian averages),
    "riskAssessment": string (based on Indian banking norms),
    "creditProfile": string (in context of Indian credit system)
  }
}`

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze eligibility')
      }

      const data = await response.json()
      const analysis = JSON.parse(data.choices[0].message.content)
      setResult(analysis)
    } catch (err) {
      setError('Failed to analyze eligibility. Please try again.')
      console.error('Analysis error:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const mlEligible = await checkMLEligibility(formData)
      await analyzeEligibility(formData, mlEligible)
    } catch (err) {
      setError('Failed to process your request. Please try again.')
    }
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }))
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
          <h1 className="text-3xl font-bold text-white mb-8">Loan Eligibility Check</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div>
                <label className="block text-white mb-2">Age (18-100)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="100"
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-white mb-2">Years of Experience (0-60)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  max="60"
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              {/* Annual Income */}
              <div>
                <label className="block text-white mb-2">Annual Income (in Lakhs: 10L-1000L)</label>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  min="10"
                  max="1000"
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              {/* Family Size */}
              <div>
                <label className="block text-white mb-2">Family Size (1-10)</label>
                <input
                  type="number"
                  name="familySize"
                  value={formData.familySize}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              {/* Credit Card Spending */}
              <div>
                <label className="block text-white mb-2">Monthly Credit Card Spending (₹0-₹10,00,000)</label>
                <input
                  type="number"
                  name="creditCardSpending"
                  value={formData.creditCardSpending}
                  onChange={handleChange}
                  min="0"
                  max="1000000"
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-white mb-2">Education Level</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white [&>option]:bg-neutral-900 [&>option]:text-white"
                  required
                >
                  <option value="1">1: Undergraduate</option>
                  <option value="2">2: Graduate</option>
                  <option value="3">3: Advanced/Professional</option>
                </select>
              </div>

              {/* Mortgage Value */}
              <div>
                <label className="block text-white mb-2">Mortgage Value (in Lakhs: 0L-1000L)</label>
                <input
                  type="number"
                  name="mortgageValue"
                  value={formData.mortgageValue}
                  onChange={handleChange}
                  min="0"
                  max="1000"
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              {/* Securities Account */}
              <div>
                <label className="block text-white mb-2">Has Securities Account?</label>
                <select
                  name="hasSecurities"
                  value={formData.hasSecurities}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white [&>option]:bg-neutral-900 [&>option]:text-white"
                  required
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              {/* CD Account */}
              <div>
                <label className="block text-white mb-2">Has Fixed Deposit Account?</label>
                <select
                  name="hasCD"
                  value={formData.hasCD}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white [&>option]:bg-neutral-900 [&>option]:text-white"
                  required
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              {/* Online Banking */}
              <div>
                <label className="block text-white mb-2">Uses Online Banking?</label>
                <select
                  name="usesOnlineBanking"
                  value={formData.usesOnlineBanking}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white [&>option]:bg-neutral-900 [&>option]:text-white"
                  required
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              {/* Credit Card */}
              <div>
                <label className="block text-white mb-2">Has Credit Card?</label>
                <select
                  name="hasCreditCard"
                  value={formData.hasCreditCard}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white [&>option]:bg-neutral-900 [&>option]:text-white"
                  required
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Check Eligibility
            </button>
          </form>

          {loading && (
            <div className="mt-6 p-4 rounded-lg bg-blue-500/20">
              <p className="text-lg text-blue-400">Analyzing your eligibility...</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/20">
              <p className="text-lg text-red-400">{error}</p>
            </div>
          )}

          {result && mlResult && (
            <div className="mt-6 space-y-6">
              {/* ML Model Prediction */}
              <div className={`p-4 rounded-lg ${mlResult.eligible ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <h3 className="text-xl font-semibold text-white mb-2">Model Prediction</h3>
                <p className={`text-lg ${mlResult.eligible ? 'text-green-400' : 'text-red-400'}`}>
                  Loan Approval Probability: {(mlResult.probability * 100).toFixed(1)}%
                </p>
              </div>

              {/* Eligibility Status */}
              <div className={`p-4 rounded-lg ${result.eligible ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <p className={`text-lg ${result.eligible ? 'text-green-400' : 'text-red-400'}`}>
                  {result.message}
                </p>
              </div>

              {/* Financial Context Analysis */}
              <div className="p-4 rounded-lg bg-indigo-500/20">
                <h3 className="text-xl font-semibold text-indigo-400 mb-4">Financial Context Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-indigo-300 mb-2">Income Analysis</h4>
                    <p className="text-white">{result.financialContext.incomeAnalysis}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-indigo-300 mb-2">Spending Patterns</h4>
                    <p className="text-white">{result.financialContext.spendingPatterns}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-indigo-300 mb-2">Financial Health</h4>
                    <p className="text-white">{result.financialContext.financialHealth}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-indigo-300 mb-2">Risk Assessment</h4>
                    <p className="text-white">{result.financialContext.riskAssessment}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-indigo-300 mb-2">Credit Profile</h4>
                    <p className="text-white">{result.financialContext.creditProfile}</p>
                  </div>
                </div>
              </div>

              {/* Available Loan Types */}
              {result.loanTypes.length > 0 && (
                <div className="p-4 rounded-lg bg-blue-500/20">
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">Available Loan Types</h3>
                  <ul className="list-disc list-inside space-y-2 text-white">
                    {result.loanTypes.map((type, index) => (
                      <li key={index}>{type}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="p-4 rounded-lg bg-yellow-500/20">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-2 text-white">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Financial Tips */}
              {result.tips.length > 0 && (
                <div className="p-4 rounded-lg bg-purple-500/20">
                  <h3 className="text-xl font-semibold text-purple-400 mb-3">Financial Tips</h3>
                  <ul className="list-disc list-inside space-y-2 text-white">
                    {result.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 