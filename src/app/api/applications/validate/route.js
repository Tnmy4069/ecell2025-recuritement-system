import dbConnect from '../../../../../lib/mongodb';
import { parse } from 'csv-parse';

export async function POST(request) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    
    return new Promise((resolve) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, async (err, records) => {
        if (err) {
          resolve(Response.json({
            error: 'Failed to parse CSV file',
            details: err.message,
            success: false
          }, { status: 400 }));
          return;
        }

        const validationResults = {
          totalRecords: records.length,
          validRecords: 0,
          errors: [],
          warnings: [],
          sample: records.length > 0 ? records[0] : null,
          headers: records.length > 0 ? Object.keys(records[0]) : []
        };

        // Check headers
        const expectedHeaders = ['fullName', 'email', 'whatsappNumber', 'isFromNashik', 'department', 'yearOfStudy', 'firstPreference', 'whyThisRole', 'pastExperience', 'hasOtherClubs'];
        const availableHeaders = validationResults.headers;
        
        for (const expected of expectedHeaders) {
          if (!availableHeaders.includes(expected)) {
            validationResults.errors.push(`Missing required header: ${expected}`);
          }
        }

        // Validate each record
        for (let i = 0; i < Math.min(records.length, 10); i++) { // Check first 10 records
          const record = records[i];
          const rowErrors = [];
          
          // Check required fields
          if (!record.fullName) rowErrors.push('Missing fullName');
          if (!record.email) rowErrors.push('Missing email');
          if (!record.whatsappNumber) rowErrors.push('Missing whatsappNumber');
          if (!record.department) rowErrors.push('Missing department');
          if (!record.yearOfStudy) rowErrors.push('Missing yearOfStudy');
          if (!record.firstPreference) rowErrors.push('Missing firstPreference');
          
          // Check enum values
          const validDepartments = [
            'Computer Science & Design (CSD)',
            'Automation & Robotics (A&R)',
            'Civil and Environmental Engineering (CEE)'
          ];
          
          if (record.department && !validDepartments.includes(record.department)) {
            rowErrors.push(`Invalid department: ${record.department}`);
          }

          const validYears = [
            'FE (Energetic Soul? We love it.)',
            'SE (Getting warmed up, huh?)',
            'TE (The sweet spot.)',
            'BE (Final boss energy.)'
          ];
          
          if (record.yearOfStudy && !validYears.includes(record.yearOfStudy)) {
            rowErrors.push(`Invalid year: ${record.yearOfStudy}`);
          }

          // Check role preference (after normalization)
          if (record.firstPreference && record.firstPreference.startsWith('??')) {
            validationResults.warnings.push(`Row ${i + 2}: Role preference has corrupted emoji characters`);
          }

          if (rowErrors.length > 0) {
            validationResults.errors.push(`Row ${i + 2} (${record.email || 'No email'}): ${rowErrors.join(', ')}`);
          } else {
            validationResults.validRecords++;
          }
        }

        resolve(Response.json({
          validation: validationResults,
          success: validationResults.errors.length === 0,
          message: validationResults.errors.length === 0 ? 
            'CSV validation passed!' : 
            `Found ${validationResults.errors.length} errors that need to be fixed`
        }));
      });
    });

  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({
      error: 'Failed to validate CSV file',
      details: error.message,
      success: false
    }, { status: 500 });
  }
}
