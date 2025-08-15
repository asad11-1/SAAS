'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Eye, Edit, Trash2, Building2, Award, Calendar, X, Loader2, User, Check, Minus, AlertTriangle } from 'lucide-react';
import { StudentForm } from '../components/forms/student-form';
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

interface StudentStats {
  total: number;
  active: number;
  thisMonth: number;
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
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-600 to-pink-600 flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats>({ total: 0, active: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection states
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Selected student for operations
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  // Update selection states when students or selected students change
  useEffect(() => {
    const filteredIds = new Set(filteredStudents.map(s => s.id));
    const selectedInFiltered = Array.from(selectedStudents).filter(id => filteredIds.has(id));
    
    if (selectedInFiltered.length === 0) {
      setIsAllSelected(false);
      setIsIndeterminate(false);
    } else if (selectedInFiltered.length === filteredStudents.length) {
      setIsAllSelected(true);
      setIsIndeterminate(false);
    } else {
      setIsAllSelected(false);
      setIsIndeterminate(true);
    }
  }, [selectedStudents, students, searchQuery]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiService.getStudentStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddSuccess = () => {
    fetchStudents();
    fetchStats();
  };

  const handleEditSuccess = () => {
    fetchStudents();
    fetchStats();
    setSelectedStudent(null);
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowEditForm(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      await apiService.deleteStudent(selectedStudent.id);
      fetchStudents();
      fetchStats();
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all filtered students
      const filteredIds = new Set(filteredStudents.map(s => s.id));
      setSelectedStudents(prev => new Set(Array.from(prev).filter(id => !filteredIds.has(id))));
    } else {
      // Select all filtered students
      const filteredIds = filteredStudents.map(s => s.id);
      setSelectedStudents(prev => new Set([...Array.from(prev), ...filteredIds]));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedStudents).map(id => apiService.deleteStudent(id)));
      setSelectedStudents(new Set());
      fetchStudents();
      fetchStats();
    } catch (error) {
      console.error('Error deleting students:', error);
      throw error;
    }
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const getFullName = (student: Student) => {
    return [student.voornaam, student.tussenvoegsel, student.achternaam]
      .filter(Boolean)
      .join(' ');
  };

  const filteredStudents = students.filter(student => {
    const fullName = getFullName(student).toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) ||
           student.emailadres?.toLowerCase().includes(query) ||
           student.company?.naam.toLowerCase().includes(query) ||
           student.bsn_nummer?.toLowerCase().includes(query);
  });

  const selectedCount = selectedStudents.size;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
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
            Students
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage student registrations and training records</p>
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
            className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-orange-500/25 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-50/80 to-pink-50/80 dark:from-orange-950/30 dark:to-pink-950/30 backdrop-blur-xl rounded-2xl border border-orange-200/50 dark:border-orange-800/50 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.total}</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/30 backdrop-blur-xl rounded-2xl border border-blue-200/50 dark:border-blue-800/50 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.active}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-800/50 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {students.filter(s => s.certificaat_naam).length}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Certified</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 backdrop-blur-xl rounded-2xl border border-green-200/50 dark:border-green-800/50 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.thisMonth}</p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, email, company, or BSN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
            />
          </div>
          <button className="px-6 py-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      {filteredStudents.length > 0 && (
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
                    ? 'bg-gradient-to-br from-orange-500 to-pink-500 border-orange-500 shadow-lg shadow-orange-500/25 scale-105'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-orange-400 dark:group-hover:border-orange-500 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20'
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
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
                {isAllSelected ? 'Deselect All' : isIndeterminate ? 'Select All' : 'Select All'}
              </span>
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({selectedCount} of {filteredStudents.length} students selected)
            </span>
          </div>
        </div>
      )}

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-12 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchQuery ? 'No students found' : 'No students yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search criteria to find the students you\'re looking for.' 
              : 'Get started by adding your first student to begin managing training records.'}
          </p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-orange-500/25 flex items-center gap-3 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Add Your First Student
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border transition-all duration-300 group ${
                selectedStudents.has(student.id)
                  ? 'border-orange-300 dark:border-orange-500 bg-orange-50/20 dark:bg-orange-900/10'
                  : 'border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl hover:border-orange-300/50 dark:hover:border-orange-500/50'
              } p-6`}
            >
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <label className="cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                    className="peer sr-only"
                  />
                  <div className={`
                    w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
                    ${selectedStudents.has(student.id)
                      ? 'bg-gradient-to-br from-orange-500 to-pink-500 border-orange-500 shadow-lg shadow-orange-500/25 scale-105'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-orange-400 dark:group-hover:border-orange-500 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20'
                    }
                  `}>
                    {selectedStudents.has(student.id) && (
                      <Check className="w-4 h-4 text-white animate-in zoom-in-50 duration-200" />
                    )}
                  </div>
                </label>

                {/* Student Content */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-1">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {getFullName(student)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                        }`}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {student.emailadres && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="truncate">{student.emailadres}</span>
                          </div>
                        )}
                        {student.company && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Building2 className="h-4 w-4 flex-shrink-0 text-purple-500" />
                            <span className="truncate">{student.company.naam}</span>
                          </div>
                        )}
                        {student.certificaat_naam && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Award className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                            <span className="truncate">{student.certificaat_naam}</span>
                          </div>
                        )}
                        {student.functie && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-lg font-medium border border-orange-200 dark:border-orange-800">Role</span>
                            <span className="truncate">{student.functie}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={() => handleView(student)}
                      className="p-3 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(student)}
                      className="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                      title="Edit Student"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(student)}
                      className="p-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
                      title="Delete Student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
          title="Add New Student"
          maxWidth="max-w-md"
        >
          <StudentForm 
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
          title="Edit Student"
          maxWidth="max-w-md"
        >
          <StudentForm 
            open={showEditForm} 
            onOpenChange={setShowEditForm}
            onSuccess={handleEditSuccess}
            student={selectedStudent}
            mode="edit"
          />
        </Modal>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <Modal 
          isOpen={showViewModal} 
          onClose={() => setShowViewModal(false)}
          title={getFullName(selectedStudent)}
          maxWidth="max-w-4xl"
        >
          <div className="p-6 space-y-8">
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</span>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{getFullName(selectedStudent)}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedStudent.geslacht || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</span>
                  <p className="text-base text-gray-900 dark:text-white">
                    {selectedStudent.geboortedatum 
                      ? new Date(selectedStudent.geboortedatum).toLocaleDateString() 
                      : 'Not provided'}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nationality</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedStudent.nationaliteit || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">BSN Number</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedStudent.bsn_nummer || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedStudent.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {selectedStudent.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedStudent.emailadres || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedStudent.telefoonnummer || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Work Information */}
            {(selectedStudent.company || selectedStudent.functie || selectedStudent.personeelsnummer) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Work Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedStudent.company && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</span>
                      <p className="text-base text-gray-900 dark:text-white">{selectedStudent.company.naam}</p>
                    </div>
                  )}
                  {selectedStudent.branch && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch</span>
                      <p className="text-base text-gray-900 dark:text-white">{selectedStudent.branch.naam_vestiging}</p>
                    </div>
                  )}
                  {selectedStudent.personeelsnummer && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Employee Number</span>
                      <p className="text-base text-gray-900 dark:text-white">{selectedStudent.personeelsnummer}</p>
                    </div>
                  )}
                  {selectedStudent.functie && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</span>
                      <p className="text-base text-gray-900 dark:text-white">{selectedStudent.functie}</p>
                    </div>
                  )}
                  {selectedStudent.afdeling && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</span>
                      <p className="text-base text-gray-900 dark:text-white">{selectedStudent.afdeling}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certification */}
            {selectedStudent.certificaat_naam && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Certification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificate</span>
                    <p className="text-base text-gray-900 dark:text-white">{selectedStudent.certificaat_naam}</p>
                  </div>
                  {selectedStudent.certificaat_datum && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificate Date</span>
                      <p className="text-base text-gray-900 dark:text-white">
                        {new Date(selectedStudent.certificaat_datum).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedStudent.opmerkingen && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Notes
                </h3>
                <p className="text-base text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">{selectedStudent.opmerkingen}</p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedStudent);
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white rounded-xl transition-colors"
              >
                Edit Student
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
        title="Delete Student"
        description="This action cannot be undone. All training records will be permanently removed."
        itemName={selectedStudent ? getFullName(selectedStudent) : ''}
      />

      <DeleteConfirmation
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Students"
        description={`This action cannot be undone. All training records for ${selectedCount} students will be permanently removed.`}
        itemName={`${selectedCount} students`}
      />
    </div>
  );
}