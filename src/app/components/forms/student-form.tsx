'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Users, X } from 'lucide-react'
import { apiService } from '../../lib/api' // ✅ Import apiService

interface Company {
  id: string
  naam: string
}

interface Branch {
  id: string
  naam_vestiging: string
  company_id: string
}

interface Student {
  id: string;
  voornaam: string;
  tussenvoegsel?: string;
  achternaam: string;
  geboortedatum?: string;
  bsn_nummer?: string;
  telefoonnummer?: string;
  emailadres?: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  plaats?: string;
  nationaliteit?: string;
  geslacht?: string;
  personeelsnummer?: string;
  functie?: string;
  afdeling?: string;
  certificaat_naam?: string;
  certificaat_datum?: string;
  opmerkingen?: string;
  company_id?: string;
  branch_id?: string;
  is_active: boolean;
}

interface StudentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  student?: Student | null
  mode?: 'add' | 'edit'
}

export function StudentForm({ open, onOpenChange, onSuccess, student, mode = 'add' }: StudentFormProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([])
  const [formData, setFormData] = useState({
    voornaam: '',
    tussenvoegsel: '',
    achternaam: '',
    geboortedatum: '',
    bsn_nummer: '',
    telefoonnummer: '',
    emailadres: '',
    straat: '',
    huisnummer: '',
    postcode: '',
    plaats: '',
    nationaliteit: 'Nederlandse',
    geslacht: '',
    personeelsnummer: '',
    functie: '',
    afdeling: '',
    certificaat_naam: '',
    certificaat_datum: '',
    opmerkingen: '',
    company_id: '',
    branch_id: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch companies and branches when dialog opens
  useEffect(() => {
    if (open) {
      fetchCompaniesAndBranches()
    }
  }, [open])

  const fetchCompaniesAndBranches = async () => {
    try {
      setDataLoading(true)
      console.log('👥 Fetching companies and branches for student form...')
      
      // ✅ Use apiService instead of direct fetch
      const [companiesData, branchesData] = await Promise.all([
        apiService.getCompanies().catch(err => {
          console.error('❌ Error fetching companies:', err);
          return [];
        }),
        apiService.getBranches().catch(err => {
          console.error('❌ Error fetching branches:', err);
          return [];
        })
      ])

      console.log('✅ Student form data loaded:', {
        companies: companiesData.length,
        branches: branchesData.length
      })

      setCompanies(companiesData)
      setBranches(branchesData)
      
    } catch (error) {
      console.error('💥 Error fetching companies and branches:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Load student data when editing
  useEffect(() => {
    if (open && mode === 'edit' && student) {
      console.log('👥 Loading student data for editing:', student.voornaam, student.achternaam)
      setFormData({
        voornaam: student.voornaam || '',
        tussenvoegsel: student.tussenvoegsel || '',
        achternaam: student.achternaam || '',
        geboortedatum: student.geboortedatum ? student.geboortedatum.split('T')[0] : '',
        bsn_nummer: student.bsn_nummer || '',
        telefoonnummer: student.telefoonnummer || '',
        emailadres: student.emailadres || '',
        straat: student.straat || '',
        huisnummer: student.huisnummer || '',
        postcode: student.postcode || '',
        plaats: student.plaats || '',
        nationaliteit: student.nationaliteit || 'Nederlandse',
        geslacht: student.geslacht || '',
        personeelsnummer: student.personeelsnummer || '',
        functie: student.functie || '',
        afdeling: student.afdeling || '',
        certificaat_naam: student.certificaat_naam || '',
        certificaat_datum: student.certificaat_datum ? student.certificaat_datum.split('T')[0] : '',
        opmerkingen: student.opmerkingen || '',
        company_id: student.company_id || '',
        branch_id: student.branch_id || '',
        is_active: student.is_active !== undefined ? student.is_active : true
      })
    } else if (open && mode === 'add') {
      console.log('👥 Resetting form for new student')
      // Reset form for add mode
      setFormData({
        voornaam: '',
        tussenvoegsel: '',
        achternaam: '',
        geboortedatum: '',
        bsn_nummer: '',
        telefoonnummer: '',
        emailadres: '',
        straat: '',
        huisnummer: '',
        postcode: '',
        plaats: '',
        nationaliteit: 'Nederlandse',
        geslacht: '',
        personeelsnummer: '',
        functie: '',
        afdeling: '',
        certificaat_naam: '',
        certificaat_datum: '',
        opmerkingen: '',
        company_id: '',
        branch_id: '',
        is_active: true
      })
    }
    setErrors({})
  }, [open, mode, student])

  // Filter branches when company changes
  useEffect(() => {
    if (formData.company_id) {
      const filtered = branches.filter(branch => branch.company_id === formData.company_id)
      setFilteredBranches(filtered)
      // Reset branch selection if current branch doesn't belong to selected company
      if (formData.branch_id && !filtered.find(b => b.id === formData.branch_id)) {
        setFormData(prev => ({ ...prev, branch_id: '' }))
      }
    } else {
      setFilteredBranches([])
      setFormData(prev => ({ ...prev, branch_id: '' }))
    }
  }, [formData.company_id, branches])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.voornaam.trim()) newErrors.voornaam = 'Voornaam is verplicht'
    if (!formData.achternaam.trim()) newErrors.achternaam = 'Achternaam is verplicht'
    if (formData.emailadres && !formData.emailadres.includes('@')) {
      newErrors.emailadres = 'Ongeldig emailadres'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const submitData = { ...formData }
      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key as keyof typeof submitData] === '') {
          delete submitData[key as keyof typeof submitData]
        }
      })

      console.log(`👥 ${mode === 'add' ? 'Creating' : 'Updating'} student:`, submitData.voornaam, submitData.achternaam)

      // ✅ Use apiService instead of direct fetch
      if (mode === 'edit' && student) {
        await apiService.updateStudent(student.id, submitData)
        console.log('✅ Student updated successfully')
      } else {
        await apiService.createStudent(submitData)
        console.log('✅ Student created successfully')
      }

      // Reset form
      setFormData({
        voornaam: '',
        tussenvoegsel: '',
        achternaam: '',
        geboortedatum: '',
        bsn_nummer: '',
        telefoonnummer: '',
        emailadres: '',
        straat: '',
        huisnummer: '',
        postcode: '',
        plaats: '',
        nationaliteit: 'Nederlandse',
        geslacht: '',
        personeelsnummer: '',
        functie: '',
        afdeling: '',
        certificaat_naam: '',
        certificaat_datum: '',
        opmerkingen: '',
        company_id: '',
        branch_id: '',
        is_active: true
      })

      onOpenChange(false)
      onSuccess?.()

    } catch (error: any) {
      console.error(`❌ Error ${mode === 'add' ? 'creating' : 'updating'} student:`, error)
      setErrors({ submit: error.message || 'Er is een fout opgetreden' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle>
                  {mode === 'edit' ? 'Student Bewerken' : 'Nieuwe Student Toevoegen'}
                </DialogTitle>
                <DialogDescription>
                  {mode === 'edit' ? 'Bewerk de studentgegevens' : 'Voeg een nieuwe student toe aan het systeem'}
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          {dataLoading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              Loading companies and branches...
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Persoonlijke gegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Voornaam *
                </label>
                <input
                  type="text"
                  name="voornaam"
                  value={formData.voornaam}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.voornaam ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Jan"
                />
                {errors.voornaam && <p className="text-red-500 text-xs mt-1">{errors.voornaam}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tussenvoegsel</label>
                <input
                  type="text"
                  name="tussenvoegsel"
                  value={formData.tussenvoegsel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="van"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Achternaam *
                </label>
                <input
                  type="text"
                  name="achternaam"
                  value={formData.achternaam}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.achternaam ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Dijk"
                />
                {errors.achternaam && <p className="text-red-500 text-xs mt-1">{errors.achternaam}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Geslacht</label>
                <select
                  name="geslacht"
                  value={formData.geslacht}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecteer</option>
                  <option value="M">Man</option>
                  <option value="V">Vrouw</option>
                  <option value="O">Anders</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Geboortedatum</label>
                <input
                  type="date"
                  name="geboortedatum"
                  value={formData.geboortedatum}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">BSN Nummer</label>
                <input
                  type="text"
                  name="bsn_nummer"
                  value={formData.bsn_nummer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nationaliteit</label>
                <input
                  type="text"
                  name="nationaliteit"
                  value={formData.nationaliteit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Contactgegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="emailadres"
                  value={formData.emailadres}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.emailadres ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="student@email.com"
                />
                {errors.emailadres && <p className="text-red-500 text-xs mt-1">{errors.emailadres}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefoon</label>
                <input
                  type="tel"
                  name="telefoonnummer"
                  value={formData.telefoonnummer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="06-12345678"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Straat</label>
                <input
                  type="text"
                  name="straat"
                  value={formData.straat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Straatnaam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Huisnummer</label>
                <input
                  type="text"
                  name="huisnummer"
                  value={formData.huisnummer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Postcode</label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="1234AB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plaats</label>
                <input
                  type="text"
                  name="plaats"
                  value={formData.plaats}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Amsterdam"
                />
              </div>
            </div>
          </div>

          {/* Company & Work Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Werk & Bedrijfsgegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bedrijf</label>
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={dataLoading}
                >
                  <option value="">Selecteer bedrijf (optioneel)</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.naam}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vestiging</label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={!formData.company_id || dataLoading}
                >
                  <option value="">Selecteer vestiging (optioneel)</option>
                  {filteredBranches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.naam_vestiging}
                    </option>
                  ))}
                </select>
                {formData.company_id && filteredBranches.length === 0 && !dataLoading && (
                  <p className="text-xs text-gray-500 mt-1">Geen vestigingen gevonden voor dit bedrijf</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Personeelsnummer</label>
                <input
                  type="text"
                  name="personeelsnummer"
                  value={formData.personeelsnummer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="EMP001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Functie</label>
                <input
                  type="text"
                  name="functie"
                  value={formData.functie}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Verpleegkundige"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Afdeling</label>
                <input
                  type="text"
                  name="afdeling"
                  value={formData.afdeling}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Spoedeisende Hulp"
                />
              </div>
            </div>
          </div>

          {/* Certification Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Certificering</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Certificaat/Diploma</label>
                <input
                  type="text"
                  name="certificaat_naam"
                  value={formData.certificaat_naam}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="EHBO Diploma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Certificaat Datum</label>
                <input
                  type="date"
                  name="certificaat_datum"
                  value={formData.certificaat_datum}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Opmerkingen</label>
                <textarea
                  name="opmerkingen"
                  value={formData.opmerkingen}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Aanvullende informatie over de student..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">Student is actief</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading || dataLoading}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading 
                ? (mode === 'add' ? 'Toevoegen...' : 'Bijwerken...') 
                : (mode === 'edit' ? 'Wijzigingen Opslaan' : 'Student Toevoegen')
              }
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}