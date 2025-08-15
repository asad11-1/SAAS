'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Eye, Edit, Trash2, Building2, MapPin, Mail, Phone, X, Loader2, AlertTriangle } from 'lucide-react';
import { BranchForm } from '../components/forms/branch-form';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/auth-context';

interface Branch {
  id: string;
  company_id: string;
  naam_vestiging: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  plaats?: string;
  telefoonnummer?: string;
  emailadres?: string;
  contactpersoon?: string;
  opleverdatum?: string;
  opmerkingen?: string;
  status: string;
  company?: {
    id: string;
    naam: string;
  };
  created_at: string;
}

interface Company {
  id: string;
  naam: string;
  status: string;
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
      <div className={`relative w-full ${maxWidth} max-h-[90vh] bg-white dark:bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in-0 duration-200`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <UserCheck className="h-5 w-5 text-white" />
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

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected branch for operations
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (authLoading) {
      console.log('🔄 Waiting for auth to load...');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting...');
      return;
    }
    
    console.log('✅ Auth ready, fetching data...');
    fetchBranches();
    fetchCompanies();
  }, [isAuthenticated, authLoading]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      console.log('🏪 Fetching branches...');
      const data = await apiService.getBranches();
      setBranches(data);
      console.log('🏪 Branches loaded:', data.length);
    } catch (error) {
      console.error('❌ Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      console.log('🏢 Fetching companies for branch selection...');
      const data = await apiService.getCompanies();
      setCompanies(data);
      console.log('🏢 Companies loaded:', data.length);
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || companiesLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading {loading && companiesLoading ? 'branches and companies' : loading ? 'branches' : 'companies'}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddSuccess = () => {
    fetchBranches();
  };

  const handleEditSuccess = () => {
    fetchBranches();
    setSelectedBranch(null);
  };

  const handleView = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowViewModal(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowEditForm(true);
  };

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedBranch) return;

    try {
      await apiService.deleteBranch(selectedBranch.id);
      fetchBranches();
      setSelectedBranch(null);
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.naam_vestiging.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.company?.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.plaats?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Branches
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage company locations and branch offices</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          disabled={companies.length === 0}
          className={`px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2 ${
            companies.length === 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-green-500/25'
          }`}
        >
          <Plus className="h-5 w-5" />
          Add Branch
        </button>
      </div>

      {/* No Companies Warning */}
      {companies.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">No Companies Available</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You need to create companies first before adding branches. 
                <a href="/companies" className="underline hover:no-underline ml-1">Go to Companies</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Card */}
        <div className="lg:col-span-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search branches by name, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 backdrop-blur-xl rounded-2xl border border-green-200/50 dark:border-green-800/50 p-6 shadow-lg">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{branches.length}</div>
            <div className="text-sm text-green-700 dark:text-green-300 font-medium">Total Branches</div>
            <div className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
              {branches.filter(b => b.status === 'actief').length} Active
            </div>
          </div>
        </div>
      </div>

      {/* Branches List */}
      {filteredBranches.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-12 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <UserCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchQuery ? 'No branches found' : 'No branches yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search criteria to find the branches you\'re looking for.' 
              : companies.length === 0
                ? 'Create some companies first, then you can add branch locations to organize company offices.'
                : 'Get started by adding your first branch location to organize company offices.'}
          </p>
          {companies.length > 0 && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-green-500/25 flex items-center gap-3 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Add Your First Branch
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-6 hover:shadow-xl hover:border-green-300/50 dark:hover:border-green-500/50 transition-all duration-300 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-green-500/20 group-hover:scale-110 transition-transform duration-300">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                        {branch.naam_vestiging}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        branch.status === 'actief' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                      }`}>
                        {branch.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      {branch.company && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Building2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="truncate font-medium">{branch.company.naam}</span>
                        </div>
                      )}
                      {(branch.straat || branch.plaats) && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          <span className="truncate">
                            {[branch.straat, branch.huisnummer].filter(Boolean).join(' ')}, {[branch.postcode, branch.plaats].filter(Boolean).join(' ')}
                          </span>
                        </div>
                      )}
                      {branch.emailadres && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4 flex-shrink-0 text-purple-500" />
                          <span className="truncate">{branch.emailadres}</span>
                        </div>
                      )}
                      {branch.telefoonnummer && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4 flex-shrink-0 text-orange-500" />
                          <span className="truncate">{branch.telefoonnummer}</span>
                        </div>
                      )}
                      {branch.contactpersoon && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-lg font-medium border border-green-200 dark:border-green-800">Contact</span>
                          <span className="truncate">{branch.contactpersoon}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={() => handleView(branch)}
                    className="p-3 text-gray-400 hover:text-green-600 dark:hover:text-green-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(branch)}
                    className="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                    title="Edit Branch"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(branch)}
                    className="p-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                    title="Delete Branch"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Static Form Modals */}
      {showAddForm && (
        <Modal 
          isOpen={showAddForm} 
          onClose={() => setShowAddForm(false)}
          title="Add New Branch"
          maxWidth="max-w-md"
        >
          <BranchForm 
            open={showAddForm} 
            onOpenChange={setShowAddForm}
            onSuccess={handleAddSuccess}
            mode="add"
            companies={companies}
          />
        </Modal>
      )}

      {showEditForm && (
        <Modal 
          isOpen={showEditForm} 
          onClose={() => setShowEditForm(false)}
          title="Edit Branch"
          maxWidth="max-w-md"
        >
          <BranchForm 
            open={showEditForm} 
            onOpenChange={setShowEditForm}
            onSuccess={handleEditSuccess}
            branch={selectedBranch}
            mode="edit"
            companies={companies}
          />
        </Modal>
      )}

      {/* View Branch Modal */}
      {showViewModal && selectedBranch && (
        <Modal 
          isOpen={showViewModal} 
          onClose={() => setShowViewModal(false)}
          title={selectedBranch.naam_vestiging}
          maxWidth="max-w-5xl"
        >
          <div className="p-6 space-y-8">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch Name</span>
                  <p className="text-base font-semibold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50">
                    {selectedBranch.naam_vestiging}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</span>
                  <p className="text-base text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50">
                    {selectedBranch.company?.naam || 'Not specified'}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                  <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedBranch.status === 'actief' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                    }`}>
                      {selectedBranch.status}
                    </span>
                  </div>
                </div>
                {selectedBranch.opleverdatum && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Date</span>
                    <p className="text-base text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50">
                      {new Date(selectedBranch.opleverdatum).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Address
              </h3>
              <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Street Address</span>
                    <p className="text-base text-gray-900 dark:text-white">
                      {[selectedBranch.straat, selectedBranch.huisnummer].filter(Boolean).join(' ') || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">City & Postal Code</span>
                    <p className="text-base text-gray-900 dark:text-white">
                      {[selectedBranch.postcode, selectedBranch.plaats].filter(Boolean).join(' ') || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-500" />
                    Email Address
                  </span>
                  <p className="text-base text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50">
                    {selectedBranch.emailadres || 'Not provided'}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-500" />
                    Phone Number
                  </span>
                  <p className="text-base text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50">
                    {selectedBranch.telefoonnummer || 'Not provided'}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    Contact Person
                  </span>
                  <p className="text-base text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50">
                    {selectedBranch.contactpersoon || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {selectedBranch.opmerkingen && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Notes & Comments
                </h3>
                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-base text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                    {selectedBranch.opmerkingen}
                  </p>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors border border-gray-200 dark:border-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedBranch);
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-colors shadow-lg hover:shadow-green-500/25"
              >
                Edit Branch
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Inline Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Branch"
        description="This action cannot be undone. All associated data will be permanently removed."
        itemName={selectedBranch?.naam_vestiging || ''}
      />
    </div>
  );
}