'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Eye, Edit, Trash2, MapPin, Mail, Phone, X, Loader2, Check, Minus, Users, ChevronDown, ChevronRight, User, Award, AlertTriangle } from 'lucide-react';
import { CompanyForm } from '../components/forms/company-form';
import { apiService } from '../lib/api';

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
  created_at: string;
}

interface Student {
  id: string;
  voornaam: string;
  tussenvoegsel?: string;
  achternaam: string;
  emailadres?: string;
  telefoonnummer?: string;
  geboortedatum?: string;
  bsn_nummer?: string;
  nationaliteit?: string;
  geslacht?: string;
  personeelsnummer?: string;
  functie?: string;
  afdeling?: string;
  certificaat_naam?: string;
  certificaat_datum?: string;
  opmerkingen?: string;
  is_active: boolean;
  company?: {
    id: string;
    naam: string;
  };
  branch?: {
    id: string;
    naam_vestiging: string;
  };
  created_at: string;
}

// Static Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }: ModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200" />
      <div className={`relative w-full ${maxWidth} max-h-[85vh] bg-white dark:bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in-0 duration-200`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Inline Delete Confirmation Component
interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName: string;
}

function DeleteConfirmation({ isOpen, onClose, onConfirm, title, description, itemName }: DeleteConfirmationProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200" />
      
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl animate-in zoom-in-95 fade-in-0 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center shadow-lg ring-4 ring-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-500 dark:text-gray-400 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
              Are you sure you want to delete <strong className="font-semibold">"{itemName}"</strong>? 
              This action cannot be undone and all associated data will be permanently removed.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection states
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  
  // Expanded companies state
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Selected company for operations
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
    fetchStudents();
  }, []);

  // Update selection states when companies or selected companies change
  useEffect(() => {
    const filteredIds = new Set(filteredCompanies.map(c => c.id));
    const selectedInFiltered = Array.from(selectedCompanies).filter(id => filteredIds.has(id));
    
    if (selectedInFiltered.length === 0) {
      setIsAllSelected(false);
      setIsIndeterminate(false);
    } else if (selectedInFiltered.length === filteredCompanies.length) {
      setIsAllSelected(true);
      setIsIndeterminate(false);
    } else {
      setIsAllSelected(false);
      setIsIndeterminate(true);
    }
  }, [selectedCompanies, companies, searchQuery]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const data = await apiService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchCompanies();
  };

  const handleEditSuccess = () => {
    fetchCompanies();
    setSelectedCompany(null);
  };

  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setShowViewModal(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setShowEditForm(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCompany) return;

    try {
      await apiService.deleteCompany(selectedCompany.id);
      fetchCompanies();
      setSelectedCompany(null);
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all filtered companies
      const filteredIds = new Set(filteredCompanies.map(c => c.id));
      setSelectedCompanies(prev => new Set(Array.from(prev).filter(id => !filteredIds.has(id))));
    } else {
      // Select all filtered companies
      const filteredIds = filteredCompanies.map(c => c.id);
      setSelectedCompanies(prev => new Set([...Array.from(prev), ...filteredIds]));
    }
  };

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedCompanies).map(id => apiService.deleteCompany(id)));
      setSelectedCompanies(new Set());
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting companies:', error);
      throw error;
    }
  };

  const clearSelection = () => {
    setSelectedCompanies(new Set());
  };

  // Company expansion handlers
  const toggleCompanyExpansion = (companyId: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  // Get students for a specific company
  const getCompanyStudents = (companyId: string) => {
    return students.filter(student => student.company?.id === companyId);
  };

  // Get company student count
  const getCompanyStudentCount = (companyId: string) => {
    return getCompanyStudents(companyId).length;
  };

  // Get full name for student
  const getFullName = (student: Student) => {
    return [student.voornaam, student.tussenvoegsel, student.achternaam]
      .filter(Boolean)
      .join(' ');
  };

  const filteredCompanies = companies.filter(company =>
    company.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.plaats?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.kvk_nummer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = selectedCompanies.size;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Companies
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your partner companies and their students</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCount} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
              <button
                onClick={clearSelection}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Company
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Card */}
        <div className="lg:col-span-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search companies by name, location, or KvK number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-800/50 p-6 shadow-lg">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{companies.length}</div>
            <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Total Companies</div>
            <div className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">
              {companies.filter(c => c.status === 'actief').length} Active
            </div>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      {filteredCompanies.length > 0 && (
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  className="peer sr-only"
                />
                <div className={`
                  w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
                  ${isAllSelected || isIndeterminate
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 border-purple-500 shadow-lg shadow-purple-500/25 scale-105'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-purple-400 dark:group-hover:border-purple-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20'
                  }
                `}>
                  {isAllSelected && (
                    <Check className="w-4 h-4 text-white animate-in zoom-in-50 duration-200" />
                  )}
                  {isIndeterminate && (
                    <Minus className="w-4 h-4 text-white animate-in zoom-in-50 duration-200" />
                  )}
                </div>
              </div>
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                {isAllSelected ? 'Deselect All' : isIndeterminate ? 'Select All' : 'Select All'}
              </span>
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({selectedCount} of {filteredCompanies.length} companies selected)
            </span>
          </div>
        </div>
      )}

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-12 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-12 w-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchQuery ? 'No companies found' : 'No companies yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search criteria to find the companies you\'re looking for.' 
              : 'Get started by adding your first company to the system and begin managing your partnerships.'}
          </p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center gap-3 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Add Your First Company
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map((company) => {
            const companyStudents = getCompanyStudents(company.id);
            const studentCount = companyStudents.length;
            const isExpanded = expandedCompanies.has(company.id);
            
            return (
              <div
                key={company.id}
                className={`bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border transition-all duration-300 ${
                  selectedCompanies.has(company.id)
                    ? 'border-purple-300 dark:border-purple-500 bg-purple-50/20 dark:bg-purple-900/10'
                    : 'border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl hover:border-purple-300/50 dark:hover:border-purple-500/50'
                }`}
              >
                {/* Company Header */}
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <label className="cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.has(company.id)}
                        onChange={() => handleSelectCompany(company.id)}
                        className="peer sr-only"
                      />
                      <div className={`
                        w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
                        ${selectedCompanies.has(company.id)
                          ? 'bg-gradient-to-br from-purple-500 to-blue-500 border-purple-500 shadow-lg shadow-purple-500/25 scale-105'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-purple-400 dark:group-hover:border-purple-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20'
                        }
                      `}>
                        {selectedCompanies.has(company.id) && (
                          <Check className="w-4 h-4 text-white animate-in zoom-in-50 duration-200" />
                        )}
                      </div>
                    </label>

                    {/* Company Content */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-1">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                          <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                              {company.naam}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              company.status === 'actief' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                            }`}>
                              {company.status}
                            </span>
                            {studentCount > 0 && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {studentCount} student{studentCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            {(company.straat || company.plaats) && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4 flex-shrink-0 text-purple-500" />
                                <span className="truncate">
                                  {[company.straat, company.huisnummer].filter(Boolean).join(' ')}, {[company.postcode, company.plaats].filter(Boolean).join(' ')}
                                </span>
                              </div>
                            )}
                            {company.emailadres && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Mail className="h-4 w-4 flex-shrink-0 text-blue-500" />
                                <span className="truncate">{company.emailadres}</span>
                              </div>
                            )}
                            {company.telefoon && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Phone className="h-4 w-4 flex-shrink-0 text-green-500" />
                                <span className="truncate">{company.telefoon}</span>
                              </div>
                            )}
                            {company.kvk_nummer && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg font-medium border border-purple-200 dark:border-purple-800">KvK</span>
                                <span className="font-medium">{company.kvk_nummer}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Students Toggle Button */}
                        {studentCount > 0 && (
                          <button
                            onClick={() => toggleCompanyExpansion(company.id)}
                            className="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                            title={isExpanded ? 'Hide Students' : 'Show Students'}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        )}
                        <button 
                          onClick={() => handleView(company)}
                          className="p-3 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(company)}
                          className="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                          title="Edit Company"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(company)}
                          className="p-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                          title="Delete Company"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Students Section */}
                {isExpanded && companyStudents.length > 0 && (
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Students ({companyStudents.length})
                        </h4>
                        {studentsLoading && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {companyStudents.map((student) => (
                          <div
                            key={student.id}
                            className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200 group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {getFullName(student)}
                                  </h5>
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    student.is_active 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-400'
                                  }`} />
                                </div>
                                
                                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                  {student.functie && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Role:</span>
                                      <span className="truncate">{student.functie}</span>
                                    </div>
                                  )}
                                  {student.emailadres && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Email:</span>
                                      <span className="truncate">{student.emailadres}</span>
                                    </div>
                                  )}
                                  {student.certificaat_naam && (
                                    <div className="flex items-center gap-1">
                                      <Award className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                      <span className="truncate">{student.certificaat_naam}</span>
                                    </div>
                                  )}
                                  {student.personeelsnummer && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">ID:</span>
                                      <span>{student.personeelsnummer}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Static Form Modals */}
      {showAddForm && (
        <Modal 
          isOpen={showAddForm} 
          onClose={() => setShowAddForm(false)}
          title="Add New Company"
          maxWidth="max-w-md"
        >
          <CompanyForm 
            open={showAddForm} 
            onOpenChange={setShowAddForm}
            onSuccess={handleAddSuccess}
            mode="add"
          />
        </Modal>
      )}

      {showEditForm && (
        <Modal 
          isOpen={showEditForm} 
          onClose={() => setShowEditForm(false)}
          title="Edit Company"
          maxWidth="max-w-md"
        >
          <CompanyForm 
            open={showEditForm} 
            onOpenChange={setShowEditForm}
            onSuccess={handleEditSuccess}
            company={selectedCompany}
            mode="edit"
          />
        </Modal>
      )}

      {/* View Company Modal */}
      {showViewModal && selectedCompany && (
        <Modal 
          isOpen={showViewModal} 
          onClose={() => setShowViewModal(false)}
          title={selectedCompany.naam}
          maxWidth="max-w-3xl"
        >
          <div className="p-6 space-y-6">
            
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">Company Type</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCompany.soort_bedrijf || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">Status</span>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                      selectedCompany.status === 'actief' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {selectedCompany.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {(selectedCompany.straat || selectedCompany.plaats) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Address
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm">
                  <div className="space-y-1 text-gray-900 dark:text-gray-100">
                    <p>{[selectedCompany.straat, selectedCompany.huisnummer].filter(Boolean).join(' ')}</p>
                    <p>{[selectedCompany.postcode, selectedCompany.plaats].filter(Boolean).join(' ')}</p>
                    {selectedCompany.land && <p>{selectedCompany.land}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Contact
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {selectedCompany.emailadres && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedCompany.emailadres}</span>
                  </div>
                )}
                {selectedCompany.telefoon && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedCompany.telefoon}</span>
                  </div>
                )}
                {selectedCompany.website && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Website:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedCompany.website}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Business Details */}
            {(selectedCompany.kvk_nummer || selectedCompany.btw_nummer) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Business Details
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {selectedCompany.kvk_nummer && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg font-medium">KvK</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedCompany.kvk_nummer}</span>
                    </div>
                  )}
                  {selectedCompany.btw_nummer && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg font-medium">VAT</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedCompany.btw_nummer}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedCompany.algemene_omschrijving && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Description
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm">
                  <p className="text-gray-900 dark:text-gray-100">{selectedCompany.algemene_omschrijving}</p>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl transition-colors border border-gray-200 dark:border-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedCompany);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-colors"
              >
                Edit Company
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Inline Delete Confirmation Modals */}
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Company"
        description="This action cannot be undone. All associated data will be permanently removed."
        itemName={selectedCompany?.naam || ''}
      />

      <DeleteConfirmation
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Companies"
        description={`This action cannot be undone. All associated data for ${selectedCount} companies will be permanently removed.`}
        itemName={`${selectedCount} companies`}
      />
    </div>
  );
}