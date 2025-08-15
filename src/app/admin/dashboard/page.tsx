// ============= COMPLETE SUPER ADMIN DASHBOARD =============
// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, Users, Crown, Plus, Search, Edit, Trash2, Eye, 
  Globe, Calendar, Activity, TrendingUp, Shield, Settings,
  MapPin, Mail, Phone, X, ExternalLink, Copy, Check, AlertTriangle,
  Save, Lock, Unlock, UserCheck, UserX, RefreshCw, Database
} from 'lucide-react';
import { ProtectedRoute } from '../../components/protected-route';
import { apiService } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

interface Tenant {
  id: string;
  subdomain: string;
  company_name: string;
  plan_type: string;
  is_active: boolean;
  max_students: number;
  max_branches: number;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

interface TenantUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  tenant_admin: boolean;
}

interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  totalStudents: number;
  totalCompanies: number;
}

interface TenantDetailsModalProps {
  tenant: Tenant;
  onClose: () => void;
  onUpdate: () => void;
}

// Tenant Details Modal Component
function TenantDetailsModal({ tenant, onClose, onUpdate }: TenantDetailsModalProps) {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editData, setEditData] = useState({
    company_name: tenant.company_name,
    plan_type: tenant.plan_type,
    max_students: tenant.max_students,
    max_branches: tenant.max_branches,
    is_active: tenant.is_active
  });
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  useEffect(() => {
    fetchTenantUsers();
  }, [tenant.id]);

  const fetchTenantUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTenantUsers(tenant.id);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching tenant users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenant = async () => {
    try {
      await apiService.updateTenant(tenant.id, editData);
      setEditMode(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating tenant:', error);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createTenantAdmin(tenant.id, newAdminForm);
      setShowAddAdmin(false);
      setNewAdminForm({ email: '', password: '', first_name: '', last_name: '' });
      fetchTenantUsers();
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiService.updateUser(userId, { is_active: !currentStatus });
      fetchTenantUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTenantUrl = () => {
    if (typeof window === 'undefined') return '';
    const hostname = window.location.hostname;
    if (hostname.includes('localhost')) {
      return `http://localhost:3002?tenant=${tenant.subdomain}`;
    }
    return `https://${tenant.subdomain}.${hostname.split('.').slice(1).join('.')}`;
  };

  const admins = users.filter(user => user.tenant_admin);
  const regularUsers = users.filter(user => !user.tenant_admin);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editMode ? (
                <input
                  type="text"
                  value={editData.company_name}
                  onChange={(e) => setEditData({...editData, company_name: e.target.value})}
                  className="text-2xl font-bold bg-transparent border-b-2 border-red-500 focus:outline-none text-gray-900 dark:text-white"
                />
              ) : (
                tenant.company_name
              )}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400 font-mono">
                {tenant.subdomain}.yourdomain.com
              </span>
              <button
                onClick={() => copyToClipboard(getTenantUrl())}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Copy URL"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
              </button>
              <a
                href={getTenantUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Open Site"
              >
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleUpdateTenant}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditData({
                    company_name: tenant.company_name,
                    plan_type: tenant.plan_type,
                    max_students: tenant.max_students,
                    max_branches: tenant.max_branches,
                    is_active: tenant.is_active
                  });
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">Status</p>
              <p className="font-bold text-blue-900 dark:text-blue-100">
                {editMode ? (
                  <select
                    value={editData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setEditData({...editData, is_active: e.target.value === 'active'})}
                    className="text-sm bg-transparent border border-blue-300 rounded px-2 py-1"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  tenant.is_active ? 'Active' : 'Inactive'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl border border-purple-200 dark:border-purple-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-purple-700 dark:text-purple-300 text-sm">Plan</p>
              <p className="font-bold text-purple-900 dark:text-purple-100 capitalize">
                {editMode ? (
                  <select
                    value={editData.plan_type}
                    onChange={(e) => setEditData({...editData, plan_type: e.target.value})}
                    className="text-sm bg-transparent border border-purple-300 rounded px-2 py-1"
                  >
                    <option value="trial">Trial</option>
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                ) : (
                  tenant.plan_type
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-xl border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-green-700 dark:text-green-300 text-sm">Max Students</p>
              <p className="font-bold text-green-900 dark:text-green-100">
                {editMode ? (
                  <input
                    type="number"
                    value={editData.max_students}
                    onChange={(e) => setEditData({...editData, max_students: parseInt(e.target.value)})}
                    className="text-sm bg-transparent border border-green-300 rounded px-2 py-1 w-20"
                    min="1"
                  />
                ) : (
                  tenant.max_students.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 rounded-xl border border-orange-200 dark:border-orange-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-orange-700 dark:text-orange-300 text-sm">Max Branches</p>
              <p className="font-bold text-orange-900 dark:text-orange-100">
                {editMode ? (
                  <input
                    type="number"
                    value={editData.max_branches}
                    onChange={(e) => setEditData({...editData, max_branches: parseInt(e.target.value)})}
                    className="text-sm bg-transparent border border-orange-300 rounded px-2 py-1 w-20"
                    min="1"
                  />
                ) : (
                  tenant.max_branches
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dates
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Created:</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(tenant.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(tenant.updated_at).toLocaleDateString()}
              </span>
            </div>
            {tenant.trial_ends_at && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Trial Ends:</span>
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  {new Date(tenant.trial_ends_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Usage Stats
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Users:</span>
              <span className="text-gray-900 dark:text-white font-medium">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Users:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {users.filter(u => u.is_active).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Admins:</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">{admins.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users Section */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Users ({admins.length})
          </h3>
          <button
            onClick={() => setShowAddAdmin(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-orange-400" />
            <p>No admin users found for this tenant</p>
            <button
              onClick={() => setShowAddAdmin(true)}
              className="mt-2 text-red-600 hover:text-red-700 text-sm"
            >
              Create the first admin
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-700/70 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {admin.first_name[0]}{admin.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {admin.first_name} {admin.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{admin.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Admin
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleUserStatus(admin.id, admin.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      admin.is_active
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    title={admin.is_active ? 'Deactivate User' : 'Activate User'}
                  >
                    {admin.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regular Users Section */}
      {regularUsers.length > 0 && (
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Regular Users ({regularUsers.length})
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {regularUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-700/70 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {user.first_name[0]}{user.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {user.first_name} {user.last_name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.last_login ? (
                    <>Last login: {new Date(user.last_login).toLocaleDateString()}</>
                  ) : (
                    'Never logged in'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Admin Form */}
      {showAddAdmin && (
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Add New Admin</h3>
            <button
              onClick={() => setShowAddAdmin(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={newAdminForm.first_name}
                onChange={(e) => setNewAdminForm({...newAdminForm, first_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={newAdminForm.last_name}
                onChange={(e) => setNewAdminForm({...newAdminForm, last_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={newAdminForm.email}
                onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={newAdminForm.password}
                onChange={(e) => setNewAdminForm({...newAdminForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddAdmin(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Add Admin
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Main Dashboard Component
function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats>({
    totalTenants: 0,
    activeTenants: 0,
    totalStudents: 0,
    totalCompanies: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // Add tenant form state
  const [formData, setFormData] = useState({
    subdomain: '',
    company_name: '',
    plan_type: 'trial',
    max_students: 100,
    max_branches: 5,
    admin_email: '',
    admin_password: '',
    admin_first_name: '',
    admin_last_name: ''
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const data = await apiService.getTenants();
      setTenants(data);
      
      // Calculate stats
      const activeTenants = data.filter((t: Tenant) => t.is_active).length;
      setStats({
        totalTenants: data.length,
        activeTenants,
        totalStudents: 0, // You can enhance this with actual data
        totalCompanies: 0  // You can enhance this with actual data
      });
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiService.createTenant(formData);
      setShowAddForm(false);
      setFormData({
        subdomain: '',
        company_name: '',
        plan_type: 'trial',
        max_students: 100,
        max_branches: 5,
        admin_email: '',
        admin_password: '',
        admin_first_name: '',
        admin_last_name: ''
      });
      fetchTenants();
    } catch (error) {
      console.error('Error creating tenant:', error);
    }
  };

  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowViewModal(true);
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      try {
        await apiService.deleteTenant(tenantId);
        fetchTenants();
      } catch (error) {
        console.error('Error deleting tenant:', error);
      }
    }
  };

  const getSubdomainUrl = (subdomain: string) => {
    if (typeof window === 'undefined') return '#';
    
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost')) {
      return `http://localhost:3002?tenant=${subdomain}`;
    } else {
      return `https://${subdomain}.${hostname.split('.').slice(1).join('.')}`;
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all tenants and system administration</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add New Tenant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 rounded-2xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.totalTenants}</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">Total Tenants</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-2xl border border-green-200 dark:border-green-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeTenants}</h3>
              <p className="text-green-700 dark:text-green-300 text-sm">Active Tenants</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalCompanies}</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">Total Companies</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-2xl border border-purple-200 dark:border-purple-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalStudents}</h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">Total Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search tenants by company name or subdomain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Tenants</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredTenants.length} of {tenants.length} tenants
          </div>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No tenants found' : 'No tenants yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search criteria.' 
                : 'Create your first tenant to get started.'}
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add First Tenant
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                          {tenant.company_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tenant.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {tenant.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tenant.plan_type === 'enterprise' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : tenant.plan_type === 'trial'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {tenant.plan_type}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate font-mono">{tenant.subdomain}.yourdomain.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>Max {tenant.max_students} students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 flex-shrink-0" />
                          <span>Max {tenant.max_branches} branches</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>Created {new Date(tenant.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={getSubdomainUrl(tenant.subdomain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Open Tenant Site"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button 
                      onClick={() => handleViewTenant(tenant)}
                      className="p-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="p-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete Tenant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Tenant Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              Tenant Details: {selectedTenant?.company_name}
            </DialogTitle>
          </DialogHeader>

          {selectedTenant && (
            <TenantDetailsModal
              tenant={selectedTenant}
              onClose={() => setShowViewModal(false)}
              onUpdate={fetchTenants}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Tenant Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              Add New Tenant
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTenant} className="p-6 pt-0 space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="ABC Training B.V."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subdomain *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subdomain}
                    onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="abctraining"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.subdomain}.yourdomain.com
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Configuration */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Plan Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Type
                  </label>
                  <select
                    value={formData.plan_type}
                    onChange={(e) => setFormData({...formData, plan_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="trial">Trial</option>
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Students
                  </label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Branches
                  </label>
                  <input
                    type="number"
                    value={formData.max_branches}
                    onChange={(e) => setFormData({...formData, max_branches: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Admin User */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Initial Admin User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admin_first_name}
                    onChange={(e) => setFormData({...formData, admin_first_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admin_last_name}
                    onChange={(e) => setFormData({...formData, admin_last_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.admin_email}
                    onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.admin_password}
                    onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-colors"
              >
                Create Tenant
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  return (
    <ProtectedRoute requireSuperAdmin>
      <SuperAdminDashboard />
    </ProtectedRoute>
  );
}