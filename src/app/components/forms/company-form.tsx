'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Building2, X } from 'lucide-react'
import { apiService } from '../../lib/api' // ✅ Import apiService

interface Company {
  id: string;
  naam: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  plaats?: string;
  land?: string;
  emailadres?: string;
  website?: string;
  telefoon?: string;
  kvk_nummer?: string;
  btw_nummer?: string;
  algemene_omschrijving?: string;
  soort_bedrijf?: string;
  status: string;
}

interface CompanyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  company?: Company | null // For edit mode
  mode?: 'add' | 'edit'
}

export function CompanyForm({ open, onOpenChange, onSuccess, company, mode = 'add' }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    naam: '',
    straat: '',
    huisnummer: '',
    postcode: '',
    plaats: '',
    land: 'Nederland',
    emailadres: '',
    website: '',
    telefoon: '',
    kvk_nummer: '',
    btw_nummer: '',
    algemene_omschrijving: '',
    soort_bedrijf: '',
    status: 'actief'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load company data when editing
  useEffect(() => {
    if (open && mode === 'edit' && company) {
      console.log('🏢 Loading company data for editing:', company.naam)
      setFormData({
        naam: company.naam || '',
        straat: company.straat || '',
        huisnummer: company.huisnummer || '',
        postcode: company.postcode || '',
        plaats: company.plaats || '',
        land: company.land || 'Nederland',
        emailadres: company.emailadres || '',
        website: company.website || '',
        telefoon: company.telefoon || '',
        kvk_nummer: company.kvk_nummer || '',
        btw_nummer: company.btw_nummer || '',
        algemene_omschrijving: company.algemene_omschrijving || '',
        soort_bedrijf: company.soort_bedrijf || '',
        status: company.status || 'actief'
      })
    } else if (open && mode === 'add') {
      console.log('🏢 Resetting form for new company')
      // Reset form for add mode
      setFormData({
        naam: '',
        straat: '',
        huisnummer: '',
        postcode: '',
        plaats: '',
        land: 'Nederland',
        emailadres: '',
        website: '',
        telefoon: '',
        kvk_nummer: '',
        btw_nummer: '',
        algemene_omschrijving: '',
        soort_bedrijf: '',
        status: 'actief'
      })
    }
    setErrors({})
  }, [open, mode, company])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.naam.trim()) newErrors.naam = 'Bedrijfsnaam is verplicht'
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

      console.log(`🏢 ${mode === 'add' ? 'Creating' : 'Updating'} company:`, submitData.naam)

      // ✅ Use apiService instead of direct fetch
      if (mode === 'edit' && company) {
        await apiService.updateCompany(company.id, submitData)
        console.log('✅ Company updated successfully')
      } else {
        await apiService.createCompany(submitData)
        console.log('✅ Company created successfully')
      }

      // Reset form
      setFormData({
        naam: '',
        straat: '',
        huisnummer: '',
        postcode: '',
        plaats: '',
        land: 'Nederland',
        emailadres: '',
        website: '',
        telefoon: '',
        kvk_nummer: '',
        btw_nummer: '',
        algemene_omschrijving: '',
        soort_bedrijf: '',
        status: 'actief'
      })

      onOpenChange(false)
      onSuccess?.()

    } catch (error: any) {
      console.error(`❌ Error ${mode === 'add' ? 'creating' : 'updating'} company:`, error)
      setErrors({ submit: error.message || 'Er is een fout opgetreden' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle>
                  {mode === 'edit' ? 'Bedrijf Bewerken' : 'Nieuw Bedrijf Toevoegen'}
                </DialogTitle>
                <DialogDescription>
                  {mode === 'edit' ? 'Bewerk de bedrijfsgegevens' : 'Voeg een nieuw bedrijf toe aan het systeem'}
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Basisinformatie</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bedrijfsnaam *
                </label>
                <input
                  type="text"
                  name="naam"
                  value={formData.naam}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.naam ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Bedrijfsnaam"
                />
                {errors.naam && <p className="text-red-500 text-xs mt-1">{errors.naam}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Soort Bedrijf
                </label>
                <select
                  name="soort_bedrijf"
                  value={formData.soort_bedrijf}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecteer type</option>
                  <option value="Training">Training</option>
                  <option value="Ziekenhuis">Ziekenhuis</option>
                  <option value="Kliniek">Kliniek</option>
                  <option value="Verzorgingstehuis">Verzorgingstehuis</option>
                  <option value="Ambulancedienst">Ambulancedienst</option>
                  <option value="Andere">Andere</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Adresgegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Straat</label>
                <input
                  type="text"
                  name="straat"
                  value={formData.straat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Postcode</label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Amsterdam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Land</label>
                <input
                  type="text"
                  name="land"
                  value={formData.land}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.emailadres ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="info@bedrijf.nl"
                />
                {errors.emailadres && <p className="text-red-500 text-xs mt-1">{errors.emailadres}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefoon</label>
                <input
                  type="tel"
                  name="telefoon"
                  value={formData.telefoon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="020-1234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://www.bedrijf.nl"
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Bedrijfsgegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">KvK Nummer</label>
                <input
                  type="text"
                  name="kvk_nummer"
                  value={formData.kvk_nummer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">BTW Nummer</label>
                <input
                  type="text"
                  name="btw_nummer"
                  value={formData.btw_nummer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="NL123456789B01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="actief">Actief</option>
                <option value="inactief">Inactief</option>
                <option value="opgeschort">Opgeschort</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Algemene Omschrijving</label>
              <textarea
                name="algemene_omschrijving"
                value={formData.algemene_omschrijving}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Beschrijving van de activiteiten van het bedrijf..."
              />
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
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading 
                ? (mode === 'add' ? 'Toevoegen...' : 'Bijwerken...') 
                : (mode === 'edit' ? 'Wijzigingen Opslaan' : 'Bedrijf Toevoegen')
              }
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}