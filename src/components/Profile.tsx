import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Menu, MenuItem, HoveredLink, NavButton } from './ui/navbar-menu'
import { ShootingStars } from './ui/shooting-stars'
import { StarsBackground } from './ui/stars-background'
import { FileUpload } from "./ui/file-upload";

interface User {
  id: string
  full_name: string
  email: string
  created_at: string
  phone?: string
  date_of_birth?: string
  age?: number
  gender?: string
  marital_status?: string
  education_level?: string
  years_of_experience?: number
  current_occupation?: string
  annual_income?: number
  employer_name?: string
  monthly_expenses?: number
  existing_loans?: boolean
  credit_score?: number
  bank_name?: string
  account_type?: string
  pan_number?: string
  aadhar_number?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
  pan_card_file?: string
  aadhar_card_file?: string
  address_proof_file?: string
  profile_photo?: string
}

interface StoredFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface StoredFiles {
  pan_card_file: StoredFile | null;
  aadhar_card_file: StoredFile | null;
  other_documents: StoredFile[];
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen w-screen bg-neutral-900 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-blue-500 border-t-transparent"></div>
      </div>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [storedFiles, setStoredFiles] = useState<StoredFiles>({
    pan_card_file: null,
    aadhar_card_file: null,
    other_documents: []
  });

  const getGreeting = () => {
    return 'Hello'
  }

  const fetchStoredFiles = async () => {
    try {
      // List all files in the user's directory
      const { data: files, error: listError } = await supabase.storage
        .from('identity_documents')
        .list(`${user?.id}`);

      if (listError) throw listError;

      const storedFilesData: StoredFiles = {
        pan_card_file: null,
        aadhar_card_file: null,
        other_documents: []
      };

      for (const file of files || []) {
        const { data: urlData } = await supabase.storage
          .from('identity_documents')
          .createSignedUrl(`${user?.id}/${file.name}`, 3600); // URL expires in 1 hour

        if (!urlData?.signedUrl) {
          console.error('Failed to generate signed URL for file:', file.name);
          continue;
        }

        if (file.name.startsWith('pan_card_file/')) {
          storedFilesData.pan_card_file = {
            name: file.name.replace('pan_card_file/', ''),
            url: urlData.signedUrl,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'application/octet-stream'
          } as StoredFile;
        } else if (file.name.startsWith('aadhar_card_file/')) {
          storedFilesData.aadhar_card_file = {
            name: file.name.replace('aadhar_card_file/', ''),
            url: urlData.signedUrl,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'application/octet-stream'
          } as StoredFile;
        } else if (file.name.startsWith('other_documents/')) {
          storedFilesData.other_documents.push({
            name: file.name.replace('other_documents/', ''),
            url: urlData.signedUrl,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'application/octet-stream'
          } as StoredFile);
        }
      }

      setStoredFiles(storedFilesData);
    } catch (error) {
      console.error('Error fetching stored files:', error);
    }
  };

  useEffect(() => {
    async function loadUserData() {
      try {
        setError(null)
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        
        if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
            
          if (profileError) throw profileError
          setUser(profile)
          setFormData(profile)

          // Fetch stored files
          await fetchStoredFiles();
        }
      } catch (error: any) {
        setError(error.message)
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      }
    }

    loadUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert string values to appropriate types
      const processedFormData = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        years_of_experience: formData.years_of_experience ? Number(formData.years_of_experience) : undefined,
        annual_income: formData.annual_income ? Number(formData.annual_income) : undefined,
        monthly_expenses: formData.monthly_expenses ? Number(formData.monthly_expenses) : undefined,
        credit_score: formData.credit_score ? Number(formData.credit_score) : undefined,
        existing_loans: typeof formData.existing_loans === 'string' 
          ? formData.existing_loans === 'true'
          : formData.existing_loans
      }

      const { error } = await supabase
        .from('profiles')
        .update(processedFormData)
        .eq('id', user?.id)

      if (error) throw error
      
      // Update local state with processed data
      setUser(prev => prev ? { ...prev, ...processedFormData } : null)
      setIsEditing(false)

      // Show success message
      alert('Profile updated successfully!')
    } catch (error: any) {
      setError(error.message)
      alert('Failed to update profile: ' + error.message)
    }
  }

  const handleFileUpload = async (fieldName: string, file: File) => {
    if (!file) return;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("identity_documents")
        .upload(`${user?.id}/${fieldName}/${file.name}`, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        setUploadError('Failed to upload file. Please try again.');
        setTimeout(() => setUploadError(null), 3000);
        return;
      }

      const { data: urlData } = await supabase.storage
        .from("identity_documents")
        .createSignedUrl(uploadData.path, 3600); // URL expires in 1 hour

      if (!urlData?.signedUrl) {
        console.error("Failed to generate signed URL for uploaded file");
        setUploadError('Failed to generate file URL. Please try again.');
        setTimeout(() => setUploadError(null), 3000);
        return;
      }

      // Create the new file object
      const newFile = {
        name: file.name,
        url: urlData.signedUrl,
        size: file.size,
        type: file.type
      };

      // Update both formData and storedFiles state in a single batch
      setFormData(prev => ({
        ...prev,
        [fieldName]: urlData.signedUrl,
      }));

      setStoredFiles(prev => {
        if (fieldName === 'pan_card_file') {
          return { ...prev, pan_card_file: newFile };
        } else if (fieldName === 'aadhar_card_file') {
          return { ...prev, aadhar_card_file: newFile };
        } else if (fieldName.startsWith('other_documents/')) {
          return {
            ...prev,
            other_documents: [...prev.other_documents, newFile]
          };
        }
        return prev;
      });

      // Show success message
      setUploadSuccess('File uploaded successfully!');
      setTimeout(() => setUploadSuccess(null), 3000);

    } catch (error) {
      console.error("Error handling file upload:", error);
      setUploadError('Failed to upload file. Please try again.');
      setTimeout(() => setUploadError(null), 3000);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('identity_documents')
        .remove([`${user?.id}/${filePath}`]);

      if (error) throw error;

      // Update the stored files state after deletion
      if (filePath.startsWith('pan_card_file/')) {
        setStoredFiles(prev => ({ ...prev, pan_card_file: null }));
      } else if (filePath.startsWith('aadhar_card_file/')) {
        setStoredFiles(prev => ({ ...prev, aadhar_card_file: null }));
      } else if (filePath.startsWith('other_documents/')) {
        setStoredFiles(prev => ({
          ...prev,
          other_documents: prev.other_documents.filter(doc => 
            !filePath.endsWith(doc.name)
          )
        }));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen w-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    )
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
            <MenuItem setActive={setActive} active={active} item="Profile">
              <div className="flex flex-col space-y-2 text-sm">
                <div className="text-neutral-300">
                  <p className="font-medium text-white">{user?.full_name}</p>
                  <p className="text-xs">{user?.email}</p>
                </div>
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
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 relative">
          <div className="absolute top-8 right-8 flex items-center space-x-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(user || {})
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Save Changes</span>
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col space-y-4 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text leading-tight py-1">
              {getGreeting()}, {user?.full_name}
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your profile information and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information Section */}
              <div className="space-y-6 md:col-span-2">
                <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <p className="text-lg text-white">{user?.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">
                        {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="age"
                        min="18"
                        max="100"
                        value={formData.age || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.age || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:bg-neutral-900 [&>option]:text-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-lg text-white">{user?.gender || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Marital Status</label>
                    {isEditing ? (
                      <select
                        name="marital_status"
                        value={formData.marital_status || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:bg-neutral-900 [&>option]:text-white"
                      >
                        <option value="">Select Marital Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    ) : (
                      <p className="text-lg text-white">{user?.marital_status || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-6 md:col-span-2">
                <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Education Level</label>
                    {isEditing ? (
                      <select
                        name="education_level"
                        value={formData.education_level || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:bg-neutral-900 [&>option]:text-white"
                      >
                        <option value="">Select Education Level</option>
                        <option value="high_school">High School</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">Ph.D.</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-lg text-white">{user?.education_level || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Years of Experience</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="years_of_experience"
                        min="0"
                        max="60"
                        value={formData.years_of_experience || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.years_of_experience || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Current Occupation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="current_occupation"
                        value={formData.current_occupation || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.current_occupation || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Annual Income (in ₹)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="annual_income"
                        min="0"
                        step="10000"
                        value={formData.annual_income || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">
                        {user?.annual_income ? `₹${user.annual_income.toLocaleString()}` : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Employer Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="employer_name"
                        value={formData.employer_name || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.employer_name || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information Section */}
              <div className="space-y-6 md:col-span-2">
                <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Financial Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Expenses (in ₹)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="monthly_expenses"
                        min="0"
                        step="1000"
                        value={formData.monthly_expenses || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">
                        {user?.monthly_expenses ? `₹${user.monthly_expenses.toLocaleString()}` : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Existing Loans</label>
                    {isEditing ? (
                      <select
                        name="existing_loans"
                        value={formData.existing_loans?.toString() || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:bg-neutral-900 [&>option]:text-white"
                      >
                        <option value="">Select Option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <p className="text-lg text-white">{user?.existing_loans ? 'Yes' : 'No'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Credit Score</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="credit_score"
                        min="300"
                        max="900"
                        value={formData.credit_score || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.credit_score || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Bank Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="bank_name"
                        value={formData.bank_name || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.bank_name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Account Type</label>
                    {isEditing ? (
                      <select
                        name="account_type"
                        value={formData.account_type || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:bg-neutral-900 [&>option]:text-white"
                      >
                        <option value="">Select Account Type</option>
                        <option value="savings">Savings</option>
                        <option value="current">Current</option>
                        <option value="salary">Salary</option>
                      </select>
                    ) : (
                      <p className="text-lg text-white">{user?.account_type || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-6 md:col-span-2">
                <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Address Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.city || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.state || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.state || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Pincode</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode || ''}
                        onChange={handleInputChange}
                        pattern="[0-9]{6}"
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.pincode || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="country"
                        value={formData.country || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.country || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Identity Documents Section */}
              <div className="space-y-6 md:col-span-2">
                <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Identity Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">PAN Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pan_number"
                        value={formData.pan_number || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.pan_number || 'Not provided'}</p>
                    )}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Upload PAN Card
                      </label>
                      {storedFiles.pan_card_file ? (
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white">{storedFiles.pan_card_file.name}</p>
                              <p className="text-xs text-gray-400">
                                {(storedFiles.pan_card_file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={storedFiles.pan_card_file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </a>
                              <button
                                onClick={() => handleDeleteFile(`pan_card_file/${storedFiles.pan_card_file?.name}`)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <FileUpload
                          label="Upload PAN Card"
                          accept="image/*,.pdf"
                          onChange={(files) => {
                            setFormData(prev => ({
                              ...prev,
                              temp_pan_card_file: files[0]
                            }));
                          }}
                          onUpload={(files) => handleFileUpload("pan_card_file", files[0])}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Aadhar Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="aadhar_number"
                        value={formData.aadhar_number || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg text-white">{user?.aadhar_number || 'Not provided'}</p>
                    )}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Upload Aadhar Card
                      </label>
                      {storedFiles.aadhar_card_file ? (
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white">{storedFiles.aadhar_card_file.name}</p>
                              <p className="text-xs text-gray-400">
                                {(storedFiles.aadhar_card_file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={storedFiles.aadhar_card_file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </a>
                              <button
                                onClick={() => handleDeleteFile(`aadhar_card_file/${storedFiles.aadhar_card_file?.name}`)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <FileUpload
                          label="Upload Aadhar Card"
                          accept="image/*,.pdf"
                          onChange={(files) => {
                            setFormData(prev => ({
                              ...prev,
                              temp_aadhar_card_file: files[0]
                            }));
                          }}
                          onUpload={(files) => handleFileUpload("aadhar_card_file", files[0])}
                        />
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Upload Other Documents
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Upload any additional documents like salary slips, bank statements, or other relevant documents. You can upload multiple files at once.
                    </p>
                    {storedFiles.other_documents.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-lg mb-4">
                        <div className="space-y-4">
                          {storedFiles.other_documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-white">{doc.name}</p>
                                <p className="text-xs text-gray-400">
                                  {(doc.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                </a>
                                <button
                                  onClick={() => handleDeleteFile(`other_documents/${doc.name}`)}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <FileUpload
                      label="Upload Other Documents"
                      accept="image/*,.pdf"
                      multiple={true}
                      onChange={(files) => {
                        files.forEach(file => {
                          handleFileUpload(`other_documents/${file.name}`, file);
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 