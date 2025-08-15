'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './contexts/auth-context'; // ✅ Fixed import path
import { apiService } from './lib/api'; // ✅ Import apiService
import { 
  Building2, Users, UserCheck, TrendingUp, Plus, Search, Eye, Edit, 
  MapPin, Mail, Phone, ArrowRight, Activity, Calendar, Award, Target,
  BarChart3, Clock, Filter, Upload, Home, ChevronRight, Sparkles,
  BookOpen, FileText, Settings, Star, Briefcase, GraduationCap,
  LogOut, User, Shield, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  naam: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  plaats?: string;
  emailadres?: string;
  telefoon?: string;
  kvk_nummer?: string;
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
  is_active: boolean;
  created_at: string;
  company?: {
    id: string;
    naam: string;
  };
}

interface DashboardStats {
  companies: number;
  branches: number;
  students: number;
  activeStudents: number;
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    companies: 0,
    branches: 0,
    students: 0,
    activeStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wait for auth to be ready before fetching data
  useEffect(() => {
    if (authLoading) {
      console.log('🔄 Dashboard waiting for auth to load...');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('❌ Dashboard: Not authenticated');
      setLoading(false);
      return;
    }
    
    console.log('✅ Dashboard: Auth ready, fetching data...');
    fetchData();
  }, [isAuthenticated, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Dashboard: Starting data fetch...');

      // ✅ Use apiService instead of direct fetch
      const [companiesData, branchesData, studentsData] = await Promise.all([
        apiService.getCompanies().catch(err => {
          console.error('❌ Error fetching companies:', err);
          return [];
        }),
        apiService.getBranches().catch(err => {
          console.error('❌ Error fetching branches:', err);
          return [];
        }),
        apiService.getStudents().catch(err => {
          console.error('❌ Error fetching students:', err);
          return [];
        })
      ]);

      console.log('✅ Dashboard data fetched:', {
        companies: companiesData.length,
        branches: branchesData.length,
        students: studentsData.length
      });

      setCompanies(companiesData);
      setStudents(studentsData);
      
      // Calculate stats
      const activeStudents = studentsData.filter((student: Student) => student.is_active).length;
      
      setStats({
        companies: companiesData.length,
        branches: branchesData.length,
        students: studentsData.length,
        activeStudents: activeStudents
      });

    } catch (error) {
      console.error('💥 Dashboard: Error fetching data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await logout();
    } catch (error) {
      console.error('💥 Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.naam) return user.naam;
    if (user?.first_name) return user.first_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getFullStudentName = (student: Student) => {
    return [student.voornaam, student.tussenvoegsel, student.achternaam]
      .filter(Boolean)
      .join(' ');
  };

  const isSuperAdmin = () => {
    return user?.role === 'super_admin' || user?.is_super_admin;
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Initializing Dashboard</h3>
            <p className="text-gray-500 dark:text-gray-400">Setting up your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Authentication Required</h3>
            <p className="text-gray-500 dark:text-gray-400">Please log in to access the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Dashboard</h3>
            <p className="text-gray-500 dark:text-gray-400">Gathering your data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center mx-auto">
            <Activity className="w-10 h-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Error Loading Dashboard</h3>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* Header with User Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
            {isSuperAdmin() ? (
              <Shield className="w-6 h-6 text-white" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {getUserDisplayName()}!
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {isSuperAdmin() && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Super Admin
                </span>
              )}
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Slim Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-indigo-700/95" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative px-8 py-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            
            {/* Welcome Content */}
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  Dashboard Overview
                </h2>
                <p className="text-blue-100 text-lg">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.companies}</div>
                <div className="text-sm text-blue-100">Companies</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.activeStudents}</div>
                <div className="text-sm text-blue-100">Active Students</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.branches}</div>
                <div className="text-sm text-blue-100">Branches</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tools Section for Super Admin */}
      {isSuperAdmin() && (
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Administration</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage system-wide settings and tenants</p>
              </div>
            </div>
            <Link href="/admin/dashboard">
              <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-red-500/25">
                <Settings className="w-4 h-4" />
                Admin Panel
              </button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Tenant Management</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Manage organization tenants and settings</p>
            </div>
            
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">User Management</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Manage system users and permissions</p>
            </div>
            
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">System Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">View system-wide analytics and reports</p>
            </div>
          </div>
        </div>
      )}

      {/* Companies Section */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Partner Companies</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your business partnerships</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/companies">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            </Link>
            <Link href="/companies">
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
        
        {companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {companies.slice(0, 6).map((company, index) => (
              <div
                key={company.id}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {company.naam}
                    </h3>
                    
                    {company.plaats && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{company.plaats}</span>
                      </div>
                    )}
                    
                    {company.emailadres && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{company.emailadres}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                        company.status === 'actief'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {company.status}
                      </span>
                      <Link href="/companies">
                        <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No companies yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start by adding your first partner company</p>
            <Link href="/companies">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg">
                <Plus className="w-4 h-4 inline mr-2" />
                Add First Company
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Students Section */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Students</h2>
              <p className="text-gray-600 dark:text-gray-400">Track student progress and enrollment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/students">
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </Link>
            <Link href="/students">
              <button className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
        
        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {students.slice(0, 6).map((student, index) => (
              <div
                key={student.id}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {getFullStudentName(student)}
                    </h3>
                    
                    {student.emailadres && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Mail className="w-4 w-4" />
                        <span className="truncate">{student.emailadres}</span>
                      </div>
                    )}
                    
                    {student.telefoonnummer && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Phone className="w-4 h-4" />
                        <span>{student.telefoonnummer}</span>
                      </div>
                    )}

                    {student.company && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Building2 className="w-4 h-4" />
                        <span className="truncate">{student.company.naam}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                        student.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Link href="/students">
                        <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No students yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start by enrolling your first student</p>
            <Link href="/students">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg">
                <Plus className="w-4 h-4 inline mr-2" />
                Add First Student
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}