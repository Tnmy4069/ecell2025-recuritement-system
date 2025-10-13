const fs = require('fs');
const { parse } = require('csv-parse');

async function testCSVValidation() {
  try {
    const fileContent = fs.readFileSync('FINAL_WORKING_TEMPLATE.csv', 'utf8');
    
    console.log('📋 Testing CSV Validation...\n');
    
    const records = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    console.log(`✅ CSV Parsed Successfully - ${records.length} records found\n`);

    // Validate enum values
    const validDepartments = [
      'Computer Science & Design (CSD)',
      'Automation & Robotics (A&R)',
      'Civil and Environmental Engineering (CEE)'
    ];

    const validYears = [
      'FE (Energetic Soul? We love it.)',
      'SE (Getting warmed up, huh?)',
      'TE (The sweet spot.)',
      'BE (Final boss energy.)'
    ];

    const validRoles = [
      '📝 Documentation (The storytellers)',
      '📸Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)',
      '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
      '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
      '💻 Technical / Web (Code is poetry, right?)',
      '⚙️ Operations (The backbone. The MVP.)',
      '🤝 Marketing & Sponsorship (Bring home the bacon)'
    ];

    const errors = [];
    const warnings = [];

    // Check each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNum = i + 2; // +2 because index 0 = row 2 (after header)

      // Check required fields
      if (!record.fullName?.trim()) errors.push(`Row ${rowNum}: Missing fullName`);
      if (!record.email?.trim()) errors.push(`Row ${rowNum}: Missing email`);
      if (!record.whatsappNumber?.trim()) errors.push(`Row ${rowNum}: Missing whatsappNumber`);
      if (!record.department?.trim()) errors.push(`Row ${rowNum}: Missing department`);
      if (!record.yearOfStudy?.trim()) errors.push(`Row ${rowNum}: Missing yearOfStudy`);
      if (!record.firstPreference?.trim()) errors.push(`Row ${rowNum}: Missing firstPreference`);
      if (!record.whyThisRole?.trim()) errors.push(`Row ${rowNum}: Missing whyThisRole`);
      if (!record.pastExperience?.trim()) errors.push(`Row ${rowNum}: Missing pastExperience`);

      // Check enum values
      if (record.department && !validDepartments.includes(record.department)) {
        errors.push(`Row ${rowNum}: Invalid department "${record.department}"`);
      }

      if (record.yearOfStudy && !validYears.includes(record.yearOfStudy)) {
        errors.push(`Row ${rowNum}: Invalid yearOfStudy "${record.yearOfStudy}"`);
      }

      if (record.firstPreference && !validRoles.includes(record.firstPreference)) {
        errors.push(`Row ${rowNum}: Invalid firstPreference "${record.firstPreference}"`);
      }

      if (record.secondaryRole && record.secondaryRole.trim() && !validRoles.includes(record.secondaryRole)) {
        errors.push(`Row ${rowNum}: Invalid secondaryRole "${record.secondaryRole}"`);
      }

      // Check boolean fields
      if (record.isFromNashik && !['Yes', 'No', 'true', 'false'].includes(record.isFromNashik)) {
        warnings.push(`Row ${rowNum}: Unusual isFromNashik value "${record.isFromNashik}"`);
      }

      if (record.hasOtherClubs && !['Yes', 'No', 'true', 'false'].includes(record.hasOtherClubs)) {
        warnings.push(`Row ${rowNum}: Unusual hasOtherClubs value "${record.hasOtherClubs}"`);
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (record.email && !emailRegex.test(record.email)) {
        errors.push(`Row ${rowNum}: Invalid email format "${record.email}"`);
      }
    }

    // Report results
    console.log('🔍 VALIDATION RESULTS:\n');
    
    if (errors.length === 0) {
      console.log('✅ NO ERRORS FOUND! CSV should upload successfully.\n');
    } else {
      console.log(`❌ FOUND ${errors.length} ERRORS:\n`);
      errors.forEach(error => console.log(`   ${error}`));
      console.log('');
    }

    if (warnings.length > 0) {
      console.log(`⚠️ FOUND ${warnings.length} WARNINGS:\n`);
      warnings.forEach(warning => console.log(`   ${warning}`));
      console.log('');
    }

    // Show sample valid values
    console.log('📖 EXPECTED VALUES:\n');
    console.log('Valid Departments:');
    validDepartments.forEach(dept => console.log(`   - ${dept}`));
    console.log('\nValid Years:');
    validYears.forEach(year => console.log(`   - ${year}`));
    console.log('\nValid Roles:');
    validRoles.forEach(role => console.log(`   - ${role}`));

  } catch (error) {
    console.error('❌ Error validating CSV:', error.message);
  }
}

testCSVValidation();
