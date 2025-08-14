import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import * as XLSX from 'xlsx';

@Injectable()
export class ImportService {
  constructor(private supabaseService: SupabaseService) {}

  async importCompanies(buffer: Buffer, tenantId: string) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to array of arrays first
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const results = {
      success: 0,
      errors: [] as string[],
      total: 0,
      skipped: 0
    };

    // Check if file has data beyond headers
    if (rawData.length <= 1) {
      results.errors.push('Excel file contains only headers, no data rows found');
      return results;
    }

    // Get headers and data rows
    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);
    
    results.total = dataRows.length;

    console.log('Companies import - Headers found:', headers);
    console.log('Companies import - Data rows:', dataRows.length);

    const supabase = this.supabaseService.getClient();

    // Create field mapping based on actual Excel structure
    const fieldMap = {
      'Bedrijfsnaam': 'naam',
      'Straat': 'straat', 
      'Huisnr': 'huisnummer',
      'Postcode': 'postcode',
      'Plaats': 'plaats',
      'Land': 'land',
      'Emailadres': 'emailadres',
      'Website': 'website',
      'Telefoon1': 'telefoon',
      'Status': 'status',
      'Opmerking': 'algemene_omschrijving'
    };

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i] as any[];
      
      try {
        // Create object from row data using headers
        const rowData: any = {};
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined && row[index] !== null && row[index] !== '') {
            rowData[header] = row[index];
          }
        });

        // Skip empty rows
        if (Object.keys(rowData).length === 0 || !rowData['Bedrijfsnaam']) {
          results.skipped++;
          continue;
        }

        // Map fields to database structure
        const companyData = {
          tenant_id: tenantId,
          naam: rowData['Bedrijfsnaam']?.toString().trim(),
          straat: rowData['Straat']?.toString().trim() || null,
          huisnummer: rowData['Huisnr']?.toString().trim() || null,
          postcode: rowData['Postcode']?.toString().trim() || null,
          plaats: rowData['Plaats']?.toString().trim() || null,
          land: rowData['Land']?.toString().trim() || 'Nederland',
          emailadres: rowData['Emailadres']?.toString().trim() || null,
          website: rowData['Website']?.toString().trim() || null,
          telefoon: rowData['Telefoon1']?.toString().trim() || null,
          status: rowData['Status']?.toString().trim() || 'actief',
          algemene_omschrijving: rowData['Opmerking']?.toString().trim() || null,
        };

        // Validate required fields
        if (!companyData.naam) {
          results.errors.push(`Row ${i + 2}: Bedrijfsnaam is required`);
          continue;
        }

        const { error } = await supabase
          .from('companies')
          .insert(companyData);

        if (error) {
          results.errors.push(`Row ${i + 2}: ${error.message}`);
        } else {
          results.success++;
        }
      } catch (err) {
        results.errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    console.log('Companies import results:', results);
    return results;
  }

  async importStudents(buffer: Buffer, tenantId: string) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const results = {
      success: 0,
      errors: [] as string[],
      total: 0,
      skipped: 0
    };

    // Check if file has data beyond headers
    if (rawData.length <= 1) {
      results.errors.push('Excel file contains only headers, no data rows found');
      return results;
    }

    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);
    
    results.total = dataRows.length;

    console.log('Students import - Headers found:', headers);
    console.log('Students import - Data rows:', dataRows.length);

    const supabase = this.supabaseService.getClient();

    // First, get all companies to match by name
    const { data: companies } = await supabase
      .from('companies')
      .select('id, naam')
      .eq('tenant_id', tenantId);

    const companyMap = new Map(companies?.map(c => [c.naam.toLowerCase(), c.id]) || []);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i] as any[];
      
      try {
        // Create object from row data using headers
        const rowData: any = {};
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined && row[index] !== null && row[index] !== '') {
            rowData[header] = row[index];
          }
        });

        // Skip empty rows
        if (Object.keys(rowData).length === 0) {
          results.skipped++;
          continue;
        }

        // Validate required fields
        if (!rowData['voornaam'] && !rowData['achternaam']) {
          results.errors.push(`Row ${i + 2}: voornaam or achternaam is required`);
          continue;
        }

        // Find company by name
        let companyId = null;
        if (rowData['bedrijfsnaam']) {
          const companyName = rowData['bedrijfsnaam'].toString().toLowerCase().trim();
          companyId = companyMap.get(companyName);
          if (!companyId) {
            // Don't fail, just log and continue without company
            console.log(`Row ${i + 2}: Company '${rowData['bedrijfsnaam']}' not found, creating student without company link`);
          }
        }

        // Map fields to database structure
        const studentData = {
          tenant_id: tenantId,
          company_id: companyId,
          voornaam: rowData['voornaam']?.toString().trim() || '',
          tussenvoegsel: rowData['tussenvoegsel']?.toString().trim() || null,
          achternaam: rowData['achternaam']?.toString().trim() || '',
          geboortedatum: rowData['datum_geboortedatum'] ? 
            new Date(rowData['datum_geboortedatum']).toISOString().split('T')[0] : null,
          bsn_nummer: rowData['BSN nummer']?.toString().trim() || null,
          telefoonnummer: rowData['telefoonnummer_1']?.toString().trim() || null,
          emailadres: rowData['emailadres']?.toString().trim() || null,
          straat: rowData['adres1']?.toString().trim() || null,
          huisnummer: rowData['huisnummer']?.toString().trim() || null,
          postcode: rowData['postcode']?.toString().trim() || null,
          plaats: rowData['plaats']?.toString().trim() || null,
          nationaliteit: rowData['nationaliteit']?.toString().trim() || null,
          geslacht: rowData['geslacht']?.toString().trim() || null,
          personeelsnummer: rowData['personeelsnummer']?.toString().trim() || null,
          functie: rowData['functie']?.toString().trim() || null,
          afdeling: rowData['afdeling']?.toString().trim() || null,
          opmerkingen: rowData['opmerking']?.toString().trim() || null,
          is_active: rowData['actief'] ? rowData['actief'].toString().toLowerCase() === 'true' || rowData['actief'] === '1' : true
        };

        const { error } = await supabase
          .from('students')
          .insert(studentData);

        if (error) {
          results.errors.push(`Row ${i + 2}: ${error.message}`);
        } else {
          results.success++;
        }
      } catch (err) {
        results.errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    console.log('Students import results:', results);
    return results;
  }
}