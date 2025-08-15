'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Building2, Award, Calendar,
  MapPin, Filter, Download, RefreshCw, ChevronDown,
  Globe, Target, Star, Activity, Zap, BarChart3,
  PieChart as PieChartIcon, TrendingUp as LineChartIcon,
  UserCheck, Mail, Phone, Briefcase, Shield
} from 'lucide-react';

// Import your actual API service
import { apiService } from '../lib/api';

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

interface StudentStats {
  total: number;
  active: number;
  thisMonth: number;
}

// Custom chart colors
const CHART_COLORS = [
  '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', 
  '#EF4444', '#EC4899', '#6366F1', '#84CC16',
  '#F97316', '#14B8A6', '#8B5A2B', '#DC2626'
];

export default function AnalyticsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats>({ total: 0, active: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, companiesData, branchesData, statsData] = await Promise.all([
        apiService.getStudents(),
        apiService.getCompanies(),
        apiService.getBranches(),
        apiService.getStudentStats().catch(() => ({ total: 0, active: 0, thisMonth: 0 }))
      ]);
      setStudents(studentsData);
      setCompanies(companiesData);
      setBranches(branchesData);
      setStudentStats(statsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get full name
  const getFullName = (student: Student) => {
    return [student.voornaam, student.tussenvoegsel, student.achternaam]
      .filter(Boolean)
      .join(' ');
  };

  // Helper function to filter data by date range
  const filterByDateRange = (items: any[], dateField: string = 'created_at') => {
    if (dateRange === 'all') return items;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (dateRange) {
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return items;
    }
    
    return items.filter(item => new Date(item[dateField]) >= cutoffDate);
  };

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    if (!students.length && !companies.length) return null;

    const filteredStudents = filterByDateRange(students);
    const filteredCompanies = filterByDateRange(companies);
    const filteredBranches = filterByDateRange(branches);

    // Basic totals
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.is_active).length;
    const inactiveStudents = totalStudents - activeStudents;
    const certifiedStudents = students.filter(s => s.certificaat_naam && s.certificaat_naam.trim() !== '').length;
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'actief').length;
    const totalBranches = branches.length;
    const activeBranches = branches.filter(b => b.status === 'actief').length;

    // Monthly trends for the last 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      const monthStudents = students.filter(s => {
        const createdDate = new Date(s.created_at);
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === year;
      }).length;
      
      const monthCompanies = companies.filter(c => {
        const createdDate = new Date(c.created_at);
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === year;
      }).length;

      const monthBranches = branches.filter(b => {
        const createdDate = new Date(b.created_at);
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === year;
      }).length;
      
      return {
        month: `${month} '${String(year).slice(-2)}`,
        students: monthStudents,
        companies: monthCompanies,
        branches: monthBranches,
        total: monthStudents + monthCompanies + monthBranches
      };
    });

    // Department/Function distribution
    const functionData = students.reduce((acc, student) => {
      const func = student.functie || 'Not Specified';
      acc[func] = (acc[func] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const functionChart = Object.entries(functionData)
      .map(([name, value]) => ({ 
        name: name === 'Not Specified' ? 'No Function Listed' : name, 
        value, 
        percentage: ((value / totalStudents) * 100).toFixed(1) 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Location distribution (from branches)
    const locationData = students.reduce((acc, student) => {
      const location = student.branch?.naam_vestiging || 'No Branch Assigned';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const locationChart = Object.entries(locationData)
      .map(([name, value]) => ({ 
        name: name === 'No Branch Assigned' ? 'Unassigned' : name, 
        value, 
        percentage: ((value / totalStudents) * 100).toFixed(1) 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // City distribution (from companies)
    const cityData = companies.reduce((acc, company) => {
      const city = company.plaats || 'City Not Listed';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const cityChart = Object.entries(cityData)
      .map(([name, value]) => ({ 
        name, 
        value, 
        percentage: ((value / totalCompanies) * 100).toFixed(1) 
      }))
      .sort((a, b) => b.value - a.value);

    // Certification analysis
    const certificationData = students.reduce((acc, student) => {
      const cert = student.certificaat_naam || 'No Certificate';
      if (cert.trim() === '') {
        acc['No Certificate'] = (acc['No Certificate'] || 0) + 1;
      } else {
        acc[cert] = (acc[cert] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const certificationChart = Object.entries(certificationData)
      .map(([name, value]) => ({ 
        name, 
        value, 
        percentage: ((value / totalStudents) * 100).toFixed(1) 
      }))
      .sort((a, b) => b.value - a.value);

    // Company type distribution
    const companyTypeData = companies.reduce((acc, company) => {
      const type = company.soort_bedrijf || 'Type Not Specified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const companyTypeChart = Object.entries(companyTypeData)
      .map(([name, value]) => ({ 
        name: name === 'Type Not Specified' ? 'Unspecified' : name, 
        value, 
        percentage: ((value / totalCompanies) * 100).toFixed(1) 
      }))
      .sort((a, b) => b.value - a.value);

    // Gender distribution
    const genderData = students.reduce((acc, student) => {
      const gender = student.geslacht || 'Not Specified';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const genderChart = Object.entries(genderData)
      .map(([name, value]) => ({ 
        name: name === 'Not Specified' ? 'Unspecified' : name, 
        value, 
        percentage: ((value / totalStudents) * 100).toFixed(1) 
      }));

    // Nationality distribution (top 10)
    const nationalityData = students.reduce((acc, student) => {
      const nationality = student.nationaliteit || 'Not Specified';
      acc[nationality] = (acc[nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const nationalityChart = Object.entries(nationalityData)
      .map(([name, value]) => ({ 
        name: name === 'Not Specified' ? 'Unspecified' : name, 
        value, 
        percentage: ((value / totalStudents) * 100).toFixed(1) 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Company performance metrics
    const studentsPerCompany = companies.map(company => {
      const studentCount = students.filter(s => s.company?.id === company.id).length;
      return {
        companyName: company.naam,
        studentCount,
        status: company.status,
        type: company.soort_bedrijf || 'Unspecified'
      };
    }).sort((a, b) => b.studentCount - a.studentCount).slice(0, 10);

    // Performance rates
    const certificationRate = totalStudents > 0 ? ((certifiedStudents / totalStudents) * 100).toFixed(1) : '0.0';
    const activeRate = totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(1) : '0.0';
    const companyActiveRate = totalCompanies > 0 ? ((activeCompanies / totalCompanies) * 100).toFixed(1) : '0.0';
    const branchActiveRate = totalBranches > 0 ? ((activeBranches / totalBranches) * 100).toFixed(1) : '0.0';

    // Data completeness analysis
    const studentsWithEmail = students.filter(s => s.emailadres && s.emailadres.trim() !== '').length;
    const studentsWithPhone = students.filter(s => s.telefoonnummer && s.telefoonnummer.trim() !== '').length;
    const studentsWithBSN = students.filter(s => s.bsn_nummer && s.bsn_nummer.trim() !== '').length;
    const companiesWithEmail = companies.filter(c => c.emailadres && c.emailadres.trim() !== '').length;
    const companiesWithPhone = companies.filter(c => c.telefoon && c.telefoon.trim() !== '').length;

    const dataQuality = {
      studentEmailCompletion: totalStudents > 0 ? ((studentsWithEmail / totalStudents) * 100).toFixed(1) : '0.0',
      studentPhoneCompletion: totalStudents > 0 ? ((studentsWithPhone / totalStudents) * 100).toFixed(1) : '0.0',
      studentBSNCompletion: totalStudents > 0 ? ((studentsWithBSN / totalStudents) * 100).toFixed(1) : '0.0',
      companyEmailCompletion: totalCompanies > 0 ? ((companiesWithEmail / totalCompanies) * 100).toFixed(1) : '0.0',
      companyPhoneCompletion: totalCompanies > 0 ? ((companiesWithPhone / totalCompanies) * 100).toFixed(1) : '0.0',
    };

    return {
      totals: {
        students: totalStudents,
        activeStudents,
        inactiveStudents,
        certifiedStudents,
        companies: totalCompanies,
        activeCompanies,
        branches: totalBranches,
        activeBranches
      },
      rates: {
        certification: certificationRate,
        active: activeRate,
        companyActive: companyActiveRate,
        branchActive: branchActiveRate
      },
      charts: {
        monthly: monthlyData,
        functions: functionChart,
        locations: locationChart,
        cities: cityChart,
        certifications: certificationChart,
        companyTypes: companyTypeChart,
        gender: genderChart,
        nationalities: nationalityChart,
        companyPerformance: studentsPerCompany
      },
      dataQuality
    };
  }, [students, companies, branches, dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <BarChart3 className="h-10 w-10 animate-pulse text-white" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-lg animate-pulse"></div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Loading Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Analyzing your data...</p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-float-delay"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="group">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-lg animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 bg-clip-text text-transparent mb-1">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time insights from your student management system
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Date Range Filter */}
            <div className="relative">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-2xl px-6 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 shadow-xl appearance-none pr-12"
              >
                <option value="all">All Time</option>
                <option value="year">This Year</option>
                <option value="quarter">Last 3 Months</option>
                <option value="month">Last Month</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button 
              onClick={fetchData}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 p-3 rounded-2xl transition-all hover:scale-110 shadow-xl"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

         
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {/* Total Students */}
          <div className="bg-gradient-to-br from-blue-100/80 to-cyan-100/80 dark:from-blue-950/30 dark:to-cyan-950/30 backdrop-blur-xl rounded-2xl border border-blue-200/50 dark:border-blue-800/50 p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analytics.totals.students.toLocaleString()}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Students</p>
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Activity className="h-3 w-3" />
                <span className="font-semibold">{analytics.rates.active}% Active</span>
              </div>
            </div>
          </div>

          {/* Active Students */}
          <div className="bg-gradient-to-br from-emerald-100/80 to-green-100/80 dark:from-emerald-950/30 dark:to-green-950/30 backdrop-blur-xl rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{analytics.totals.activeStudents.toLocaleString()}</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Active Students</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="font-semibold">{analytics.totals.inactiveStudents} Inactive</span>
              </div>
            </div>
          </div>

          {/* Certified Students */}
          <div className="bg-gradient-to-br from-amber-100/80 to-yellow-100/80 dark:from-amber-950/30 dark:to-yellow-950/30 backdrop-blur-xl rounded-2xl border border-amber-200/50 dark:border-amber-800/50 p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-white" />
              </div>
              <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{analytics.totals.certifiedStudents.toLocaleString()}</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Certified</p>
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <span className="font-semibold">{analytics.rates.certification}% Rate</span>
              </div>
            </div>
          </div>

          {/* Total Companies */}
          <div className="bg-gradient-to-br from-purple-100/80 to-indigo-100/80 dark:from-purple-950/30 dark:to-indigo-950/30 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-800/50 p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{analytics.totals.companies.toLocaleString()}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Companies</p>
              <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                <span className="font-semibold">{analytics.rates.companyActive}% Active</span>
              </div>
            </div>
          </div>

          {/* Total Branches */}
          <div className="bg-gradient-to-br from-green-100/80 to-teal-100/80 dark:from-green-950/30 dark:to-teal-950/30 backdrop-blur-xl rounded-2xl border border-green-200/50 dark:border-green-800/50 p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{analytics.totals.branches.toLocaleString()}</p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Branches</p>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span className="font-semibold">{analytics.rates.branchActive}% Active</span>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-gradient-to-br from-rose-100/80 to-pink-100/80 dark:from-rose-950/30 dark:to-pink-950/30 backdrop-blur-xl rounded-2xl border border-rose-200/50 dark:border-rose-800/50 p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
              <Zap className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                {Math.round((parseFloat(analytics.rates.active) + parseFloat(analytics.rates.certification)) / 2)}%
              </p>
              <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">Performance</p>
              <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                <span className="font-semibold">Overall Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Monthly Trends Chart */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <LineChartIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Growth Trends</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly registrations over time</p>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.charts.monthly}>
                  <defs>
                    <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="companyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="branchGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      border: 'none', 
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)'
                    }} 
                  />
                  <Legend />
                  <Area name="Students" type="monotone" dataKey="students" stroke="#8B5CF6" fill="url(#studentGradient)" strokeWidth={3} />
                  <Area name="Companies" type="monotone" dataKey="companies" stroke="#06B6D4" fill="url(#companyGradient)" strokeWidth={3} />
                  <Area name="Branches" type="monotone" dataKey="branches" stroke="#10B981" fill="url(#branchGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Function Distribution */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Job Functions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student roles and positions</p>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.charts.functions}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    labelLine={false}
                  >
                    {analytics.charts.functions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      border: 'none', 
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Branch Distribution */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Branch Distribution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Students by location</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {analytics.charts.locations.slice(0, 8).map((location, index) => (
                <div key={location.name} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{location.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{location.value}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">
                      {location.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certification Analysis */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Certifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Training achievements</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {analytics.charts.certifications.slice(0, 8).map((cert, index) => (
                <div key={cert.name} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{cert.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{cert.value}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">
                      {cert.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality Metrics */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Quality</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Information completeness</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Student Email Completion */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Student Emails</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{analytics.dataQuality.studentEmailCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${analytics.dataQuality.studentEmailCompletion}%` }}
                  ></div>
                </div>
              </div>

              {/* Student Phone Completion */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Student Phones</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{analytics.dataQuality.studentPhoneCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${analytics.dataQuality.studentPhoneCompletion}%` }}
                  ></div>
                </div>
              </div>

              {/* Student BSN Completion */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Student BSN</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{analytics.dataQuality.studentBSNCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${analytics.dataQuality.studentBSNCompletion}%` }}
                  ></div>
                </div>
              </div>

              {/* Company Contact Completion */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Company Contacts</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{analytics.dataQuality.companyEmailCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${analytics.dataQuality.companyEmailCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Performing Companies */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Companies by Students</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Most active partnerships</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {analytics.charts.companyPerformance.map((company, index) => (
                <div key={company.companyName} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{company.companyName}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {company.type} • {company.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{company.studentCount}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">students</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics Overview */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Demographics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gender and nationality distribution</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Gender Distribution */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Gender Distribution</h4>
                <div className="space-y-2">
                  {analytics.charts.gender.map((gender, index) => (
                    <div key={gender.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{gender.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{gender.value}</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">
                          {gender.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Nationalities */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Top Nationalities</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {analytics.charts.nationalities.slice(0, 6).map((nationality, index) => (
                    <div key={nationality.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: CHART_COLORS[(index + 3) % CHART_COLORS.length] }}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{nationality.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{nationality.value}</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">
                          {nationality.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 25s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}