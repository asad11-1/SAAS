'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { UserCheck, X } from 'lucide-react'
import { apiService } from '../../lib/api' // ✅ Import apiService

interface Company {
  id: string
  naam: string
}

interface Branch {
  id: string
  company_id: string
  naam_vestiging: string
  straat?: string
  huisnummer?: string
  postcode?: string
  plaats?: string
  telefoonnummer?: string
  emailadres?: string
  contactpersoon?: string
  opleverdatum?: string
  opmerkingen?: string
  status: string
}

interface BranchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  branch?: Branch | null
  mode: 'add' | 'edit'
  companies: Company[] // ✅ Accept companies as prop to avoid duplicate fetching
}

export function BranchForm({ 
  open, 
  onOpenChange, 
  onSuccess, 
  branch, 
  mode, 
  companies 
}: BranchFormProps) {
  const [formData, setFormData] = useState({
    company_id: '',
    naam_vestiging: '',
    straat: '',
    huisnummer: '',
    postcode: '',
    plaats: '',
    telefoonnummer: '',
    emailadres: '',
    contactpersoon: '',
    opleverdatum: '',
    opmerkingen: '',
    status: 'actief'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && branch) {
      setFormData({
        company_id: branch.company_id || '',
        naam_vestiging: branch.naam_vestiging || '',
        straat: branch.straat || '',
        huisnummer: branch.huisnummer || '',
        postcode: branch.postcode || '',
        plaats: branch.plaats || '',
        telefoonnummer: branch.telefoonnummer || '',
        emailadres: branch.emailadres || '',
        contactpersoon: branch.contactpersoon || '',
        opleverdatum: branch.opleverdatum ? branch.opleverdatum.split('T')[0] : '',
        opmerkingen: branch.opmerkingen || '',
        status: branch.status || 'actief'
      })
    } else if (mode === 'add') {
      // Reset form for add mode
      setFormData({
        company_id: '',
        naam_vestiging: '',
        straat: '',
        huisnummer: '',
        postcode: '',
        plaats: '',
        telefoonnummer: '',
        emailadres: '',
        contactpersoon: '',
        opleverdatum: '',
        opmerkingen: '',
        status: 'actief'
      })
    }
  }, [mode, branch, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.company_id) newErrors.company_id = 'Bedrijf is verplicht'
    if (!formData.naam_vestiging.trim()) newErrors.naam_vestiging = 'Vestigingsnaam is verplicht'
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

      console.log(`🏪 ${mode === 'add' ? 'Creating' : 'Updating'} branch:`, submitData)

      // ✅ Use apiService instead of direct fetch
      if (mode === 'add') {
        await apiService.createBranch(submitData)
      } else if (mode === 'edit' && branch) {
        await apiService.updateBranch(branch.id, submitData)
      }

      // Reset form
      setFormData({
        company_id: '',
        naam_vestiging: '',
        straat: '',
        huisnummer: '',
        postcode: '',
        plaats: '',
        telefoonnummer: '',
        emailadres: '',
        contactpersoon: '',
        opleverdatum: '',
        opmerkingen: '',
        status: 'actief'
      })
      
      onOpenChange(false)
      onSuccess?.()
      
    } catch (error: any) {
      console.error(`❌ Error ${mode === 'add' ? 'creating' : 'updating'} branch:`, error)
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
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle>
                  {mode === 'add' ? 'Nieuwe Vestiging Toevoegen' : 'Vestiging Bewerken'}
                </DialogTitle>
                <DialogDescription>
                  {mode === 'add' 
                    ? 'Voeg een nieuwe vestiging toe aan een bedrijf'
                    : 'Bewerk de gegevens van deze vestiging'
                  }
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
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
            <h3 className="font-medium text-foreground">Basisinformatie</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Bedrijf *
              </label>
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.company_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecteer een bedrijf</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.naam}
                  </option>
                ))}
              </select>
              {errors.company_id && <p className="text-red-500 text-xs mt-1">{errors.company_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Vestigingsnaam *
              </label>
              <input
                type="text"
                name="naam_vestiging"
                value={formData.naam_vestiging}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.naam_vestiging ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Hoofdkantoor Amsterdam"
              />
              {errors.naam_vestiging && <p className="text-red-500 text-xs mt-1">{errors.naam_vestiging}</p>}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Adresgegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Straat</label>
                <input
                  type="text"
                  name="straat"
                  value={formData.straat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Amsterdam"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Contactgegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="emailadres"
                  value={formData.emailadres}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.emailadres ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="vestiging@bedrijf.nl"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="020-1234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contactpersoon</label>
              <input
                type="text"
                name="contactpersoon"
                value={formData.contactpersoon}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Jan Jansen"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Aanvullende informatie</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Opleverdatum</label>
                <input
                  type="date"
                  name="opleverdatum"
                  value={formData.opleverdatum}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="actief">Actief</option>
                  <option value="inactief">Inactief</option>
                  <option value="tijdelijk gesloten">Tijdelijk gesloten</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opmerkingen</label>
              <textarea
                name="opmerkingen"
                value={formData.opmerkingen}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Aanvullende informatie over deze vestiging..."
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
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading 
                ? (mode === 'add' ? 'Toevoegen...' : 'Bijwerken...') 
                : (mode === 'add' ? 'Vestiging Toevoegen' : 'Vestiging Bijwerken')
              }
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}