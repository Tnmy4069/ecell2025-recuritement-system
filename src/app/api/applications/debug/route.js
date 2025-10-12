import dbConnect from '../../../../../lib/mongodb';
import Application from '../../../../../models/Application';
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
            details: err.message
          }, { status: 400 }));
          return;
        }

        try {
          // Debug info
          const debugInfo = {
            totalRecords: records.length,
            headers: records.length > 0 ? Object.keys(records[0]) : [],
            firstRecord: records.length > 0 ? records[0] : null,
            issues: []
          };

          // Check for common issues
          if (records.length === 0) {
            debugInfo.issues.push('No records found in CSV');
          }

          // Check required fields mapping
          const requiredFields = ['fullName', 'email', 'whatsappNumber', 'department', 'yearOfStudy', 'firstPreference', 'whyThisRole', 'pastExperience'];
          const availableHeaders = debugInfo.headers;
          
          for (const field of requiredFields) {
            const found = availableHeaders.some(header => 
              header.toLowerCase().includes(field.toLowerCase()) ||
              field.toLowerCase().includes(header.toLowerCase())
            );
            if (!found) {
              debugInfo.issues.push(`Required field '${field}' not found in headers`);
            }
          }

          // Check enum values
          if (records.length > 0) {
            const firstRecord = records[0];
            
            // Check department values
            const validDepartments = [
              'Computer Science & Design (CSD)',
              'Automation & Robotics (A&R)', 
              'Civil and Environmental Engineering (CEE)'
            ];
            
            const departmentField = availableHeaders.find(h => h.toLowerCase().includes('department'));
            if (departmentField && firstRecord[departmentField]) {
              if (!validDepartments.includes(firstRecord[departmentField])) {
                debugInfo.issues.push(`Department value '${firstRecord[departmentField]}' doesn't match expected values: ${validDepartments.join(', ')}`);
              }
            }

            // Check year values
            const validYears = [
              'FE (Energetic Soul? We love it.)',
              'SE (Getting warmed up, huh?)',
              'TE (The sweet spot.)',
              'BE (Final boss energy.)'
            ];
            
            const yearField = availableHeaders.find(h => h.toLowerCase().includes('year'));
            if (yearField && firstRecord[yearField]) {
              if (!validYears.includes(firstRecord[yearField])) {
                debugInfo.issues.push(`Year value '${firstRecord[yearField]}' doesn't match expected values: ${validYears.join(', ')}`);
              }
            }

            // Check role values
            const validRoles = [
              '📝 Documentation (The storytellers)',
              '📸Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)',
              '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
              '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
              '💻 Technical / Web (Code is poetry, right?)',
              '⚙️ Operations (The backbone. The MVP.)',
              '🤝 Marketing & Sponsorship (Bring home the bacon)'
            ];

            const roleField = availableHeaders.find(h => h.toLowerCase().includes('preference') || h.toLowerCase().includes('role'));
            if (roleField && firstRecord[roleField]) {
              if (!validRoles.includes(firstRecord[roleField])) {
                debugInfo.issues.push(`Role value '${firstRecord[roleField]}' doesn't match expected values. Available roles: ${validRoles.join(', ')}`);
              }
            }
          }

          resolve(Response.json({
            debug: debugInfo,
            sampleValidation: records.length > 0 ? {
              record: records[0],
              validation: 'Check if values match required enum constraints'
            } : null
          }));

        } catch (error) {
          console.error('Debug error:', error);
          resolve(Response.json({
            error: 'Failed to analyze CSV',
            details: error.message
          }, { status: 500 }));
        }
      });
    });

  } catch (error) {
    console.error('Debug upload error:', error);
    return Response.json({
      error: 'Failed to process debug upload',
      details: error.message
    }, { status: 500 });
  }
}
