'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle, Download, CheckCircle, X, Info, Building2, Users, Loader2 } from 'lucide-react';
import { apiService } from '../lib/api';

interface ImportResult {
  type: string;
  success: number;
  total: number;
  skipped?: number;
  errors: string[];
  filename: string;
}

export default function ImportPage() {
  const [companiesFile, setCompaniesFile] = useState<File | null>(null);
  const [studentsFile, setStudentsFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<'companies' | 'students' | null>(null);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'companies' | 'students') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'companies') {
        setCompaniesFile(file);
      } else {
        setStudentsFile(file);
      }
    }
  };

  const handleImport = async (type: 'companies' | 'students') => {
    const file = type === 'companies' ? companiesFile : studentsFile;
    if (!file) return;

    setIsUploading(true);
    setUploadingType(type);

    try {
      let result;
      if (type === 'companies') {
        result = await apiService.importCompanies(file);
      } else {
        result = await apiService.importStudents(file);
      }
      
      setImportResults({
        type,
        success: result.success || 0,
        total: result.total || 0,
        skipped: result.skipped || 0,
        errors: result.errors || [],
        filename: file.name
      });

      // Clear file after import attempt
      if (type === 'companies') {
        setCompaniesFile(null);
      } else {
        setStudentsFile(null);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      setImportResults({
        type,
        success: 0,
        total: 0,
        errors: [error.message || 'Network error. Please try again.'],
        filename: file.name
      });
    } finally {
      setIsUploading(false);
      setUploadingType(null);
    }
  };

  const downloadTemplate = (type: 'companies' | 'students') => {
    // Create CSV template data based on actual Excel structure
    const companyTemplate = [
      ['Bedrijfsnaam', 'Straat', 'Huisnr', 'Postcode', 'Plaats', 'Land', 'Emailadres', 'Website', 'Telefoon1', 'Status', 'Opmerking'],
      ['ABC Training B.V.', 'Hoofdstraat', '123', '1234AB', 'Amsterdam', 'Nederland', 'info@abctraining.nl', 'www.abctraining.nl', '020-1234567', 'actief', 'Professionele trainingen en cursussen']
    ];

    const studentTemplate = [
      ['bedrijfsnaam', 'voornaam', 'tussenvoegsel', 'achternaam', 'datum_geboortedatum', 'BSN nummer', 'telefoonnummer_1', 'emailadres', 'adres1', 'huisnummer', 'postcode', 'plaats', 'nationaliteit', 'geslacht', 'personeelsnummer', 'functie', 'afdeling', 'opmerking', 'actief'],
      ['ABC Training B.V.', 'Jan', 'van', 'Dijk', '1990-05-15', '123456789', '06-12345678', 'jan.vandijk@email.com', 'Teststraat', '12', '1111AA', 'Amsterdam', 'Nederlandse', 'M', 'EMP001', 'Verpleegkundige', 'Spoedeisende Hulp', 'Zeer gemotiveerde medewerker', 'true']
    ];

    const data = type === 'companies' ? companyTemplate : studentTemplate;
    const csvContent = data.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_template.csv`;
    link.click();
  };

  const getResultStatus = () => {
    if (!importResults) return null;
    
    const hasErrors = importResults.errors.length > 0;
    const hasSuccess = importResults.success > 0;
    const isEmpty = importResults.total === 0;
    
    if (isEmpty) return 'empty';
    if (hasErrors && !hasSuccess) return 'failed';
    if (hasErrors && hasSuccess) return 'partial';
    if (hasSuccess) return 'success';
    return 'unknown';
  };

  const getStatusIcon = () => {
    const status = getResultStatus();
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'failed':
        return <X className="h-5 w-5 text-red-500" />;
      case 'empty':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    const status = getResultStatus();
    switch (status) {
      case 'success':
        return 'Import completed successfully';
      case 'partial':
        return 'Import completed with some errors';
      case 'failed':
        return 'Import failed';
      case 'empty':
        return 'File contains no data rows';
      default:
        return 'Import status unknown';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Import Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Import companies and students from Excel files</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Upload className="h-6 w-6 text-blue-600" />
              Upload Excel Files
            </h2>
            
            <div className="space-y-8">
              {/* Companies Upload */}
              <div className="group">
                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 hover:shadow-lg">
                  
                  {/* Background decoration */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-300"></div>
                  
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg ring-4 ring-purple-500/20">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Companies Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Upload your companies spreadsheet (.xlsx, .xls)
                    </p>
                    
                    {companiesFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{companiesFile.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(companiesFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => handleImport('companies')}
                            disabled={isUploading}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                          >
                            {isUploading && uploadingType === 'companies' ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <Building2 className="h-4 w-4" />
                                Import Companies
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setCompaniesFile(null)}
                            disabled={isUploading}
                            className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleFileSelect(e, 'companies')}
                          className="hidden"
                          id="companies-file"
                        />
                        <label
                          htmlFor="companies-file"
                          className="cursor-pointer inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50"
                        >
                          <FileText className="h-5 w-5" />
                          Choose Excel File
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Students Upload */}
              <div className="group">
                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 bg-gradient-to-br from-orange-50/50 to-pink-50/50 dark:from-orange-950/20 dark:to-pink-950/20 hover:shadow-lg">
                  
                  {/* Background decoration */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-orange-400/10 to-pink-400/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-300"></div>
                  
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-600 to-pink-600 flex items-center justify-center shadow-lg ring-4 ring-orange-500/20">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Students Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Upload your students spreadsheet (.xlsx, .xls)
                    </p>
                    
                    {studentsFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{studentsFile.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(studentsFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => handleImport('students')}
                            disabled={isUploading}
                            className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                          >
                            {isUploading && uploadingType === 'students' ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <Users className="h-4 w-4" />
                                Import Students
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setStudentsFile(null)}
                            disabled={isUploading}
                            className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleFileSelect(e, 'students')}
                          className="hidden"
                          id="students-file"
                        />
                        <label
                          htmlFor="students-file"
                          className="cursor-pointer inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50"
                        >
                          <FileText className="h-5 w-5" />
                          Choose Excel File
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions & Results */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Info className="h-6 w-6 text-blue-600" />
              Import Instructions
            </h2>
            
            <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-3">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Your Excel files must contain data rows, not just headers</li>
                    <li>Use the exact field names shown in templates</li>
                    <li>Companies must be imported before students for proper linking</li>
                    <li>File size limit: 10MB per file</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Template Downloads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => downloadTemplate('companies')}
                  className="group p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-gradient-to-br hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-950/50 dark:hover:to-blue-950/50 rounded-xl transition-all hover:scale-105 hover:shadow-lg flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Companies Template</p>
                    <p className="text-xs opacity-80">Download Excel template</p>
                  </div>
                </button>
                
                <button
                  onClick={() => downloadTemplate('students')}
                  className="group p-4 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/30 dark:to-pink-950/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-gradient-to-br hover:from-orange-100 hover:to-pink-100 dark:hover:from-orange-950/50 dark:hover:to-pink-950/50 rounded-xl transition-all hover:scale-105 hover:shadow-lg flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Students Template</p>
                    <p className="text-xs opacity-80">Download Excel template</p>
                  </div>
                </button>
              </div>

              {/* Field Requirements */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Expected Excel Fields:</h4>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-900 dark:text-purple-100">Companies (Excel):</span>
                    </div>
                    <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                      <p><strong>Required:</strong> Bedrijfsnaam</p>
                      <p><strong>Optional:</strong> Straat, Huisnr, Postcode, Plaats, Land, Emailadres, Website, Telefoon1, Status, Opmerking</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-900 dark:text-orange-100">Students (Excel):</span>
                    </div>
                    <div className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                      <p><strong>Required:</strong> voornaam OR achternaam</p>
                      <p><strong>Linking:</strong> bedrijfsnaam (must match existing company)</p>
                      <p><strong>Optional:</strong> tussenvoegsel, datum_geboortedatum, BSN nummer, emailadres, telefoonnummer_1, adres1, huisnummer, postcode, plaats, nationaliteit, geslacht, personeelsnummer, functie, afdeling, opmerking, actief</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Import Results */}
          {importResults && (
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  {getStatusIcon()}
                  Import Results
                </h2>
                <button
                  onClick={() => setImportResults(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Status Summary */}
                <div className="text-center p-6 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getStatusIcon()}
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {getStatusMessage()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    File: <span className="font-medium">{importResults.filename}</span> • 
                    Type: <span className="font-medium capitalize">{importResults.type}</span>
                  </p>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50/80 dark:bg-green-950/30 rounded-xl border border-green-200/50 dark:border-green-800/50">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{importResults.success}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">Successful</p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50/80 dark:bg-red-950/30 rounded-xl border border-red-200/50 dark:border-red-800/50">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <X className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{importResults.errors?.length || 0}</p>
                    <p className="text-sm text-red-700 dark:text-red-300">Errors</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Info className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{importResults.skipped || 0}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Skipped</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50/80 dark:bg-purple-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{importResults.total}</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Total</p>
                  </div>
                </div>

                {/* Error Details */}
                {importResults.errors?.length > 0 && (
                  <div className="bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Issues Found:
                    </h4>
                    <div className="max-h-48 overflow-y-auto">
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
                        {importResults.errors.slice(0, 20).map((error: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                        {importResults.errors.length > 20 && (
                          <li className="flex items-start gap-2 font-medium">
                            <span className="text-red-500 mt-1">•</span>
                            <span>... and {importResults.errors.length - 20} more issues</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Empty File Information */}
                {getResultStatus() === 'empty' && (
                  <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      File Information:
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your Excel file contains only headers but no data rows. Please ensure your file includes actual data records below the header row.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}