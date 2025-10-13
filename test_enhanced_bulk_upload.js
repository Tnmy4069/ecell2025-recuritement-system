const fs = require('fs');
const { parse } = require('csv-parse');

// Simulate the enhanced bulk upload validation
async function testBulkUploadValidation() {
  console.log('🧪 Testing Enhanced Bulk Upload Validation...\n');

  const csvContent = fs.readFileSync('test_errors.csv', 'utf8');
  
  return new Promise((resolve) => {
    const results = [];
    const errorDetails = [];
    const skippedRows = [];
    
    parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, async (err, records) => {
      if (err) {
        console.error('❌ CSV Parse Error:', err.message);
        resolve();
        return;
      }

      console.log(`📄 Total records found: ${records.length}`);
      console.log('🔍 Processing each row...\n');

      const processedEmails = new Set(); // Track processed emails to simulate duplicate detection

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 2; // +2 because CSV rows start at 1 and we skip header
        
        try {
          // Simulate validation
          const fullName = record.fullName || '';
          const email = record.email || '';
          const department = record.department || '';
          
          // Check required fields
          const requiredFields = [
            { field: 'fullName', value: fullName },
            { field: 'email', value: email },
            { field: 'department', value: department }
          ];
          
          const missingFields = requiredFields.filter(({ value }) => !value || value.trim() === '');
          
          if (missingFields.length > 0) {
            const errorDetail = {
              row: rowNumber,
              email: email || 'N/A',
              fullName: fullName || 'N/A',
              error: `Missing required fields: ${missingFields.map(f => f.field).join(', ')}`,
              rawData: { ...record }
            };
            errorDetails.push(errorDetail);
            skippedRows.push(rowNumber);
            console.log(`❌ Row ${rowNumber}: Skipped - ${errorDetail.error}`);
            continue;
          }

          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            const errorDetail = {
              row: rowNumber,
              email: email,
              fullName: fullName || 'N/A',
              error: 'Invalid email format',
              rawData: { ...record }
            };
            errorDetails.push(errorDetail);
            skippedRows.push(rowNumber);
            console.log(`❌ Row ${rowNumber}: Skipped - Invalid email format`);
            continue;
          }

          // Check for duplicate emails in this batch
          if (processedEmails.has(email.toLowerCase())) {
            const errorDetail = {
              row: rowNumber,
              email: email,
              fullName: fullName || 'N/A',
              error: 'Duplicate email in this CSV batch',
              rawData: { ...record }
            };
            errorDetails.push(errorDetail);
            skippedRows.push(rowNumber);
            console.log(`❌ Row ${rowNumber}: Skipped - Duplicate email in batch`);
            continue;
          }

          // Add email to processed set
          processedEmails.add(email.toLowerCase());

          // Simulate successful processing
          results.push({
            row: rowNumber,
            email: email,
            fullName: fullName,
            id: `mock_id_${i}`
          });
          
          console.log(`✅ Row ${rowNumber}: Successfully processed - ${fullName} (${email})`);

        } catch (recordError) {
          const errorDetail = {
            row: rowNumber,
            email: record.email || 'N/A',
            fullName: record.fullName || 'N/A',
            error: recordError.message,
            errorType: recordError.name || 'ValidationError',
            rawData: { ...record }
          };
          errorDetails.push(errorDetail);
          skippedRows.push(rowNumber);
          console.log(`❌ Row ${rowNumber}: Error - ${recordError.message}`);
        }
      }

      // Generate final report
      console.log('\n📊 BULK UPLOAD RESULTS:');
      console.log('========================');
      console.log(`✅ Successful: ${results.length}`);
      console.log(`❌ Failed: ${errorDetails.length}`);
      console.log(`📋 Total Processed: ${records.length}`);
      console.log(`📈 Success Rate: ${((results.length / records.length) * 100).toFixed(1)}%`);
      
      if (skippedRows.length > 0) {
        console.log(`\n🚫 Skipped Rows: ${skippedRows.join(', ')}`);
      }

      if (errorDetails.length > 0) {
        console.log('\n📋 ERROR DETAILS:');
        console.log('=================');
        errorDetails.forEach((error, idx) => {
          console.log(`${idx + 1}. Row ${error.row}: ${error.fullName} (${error.email})`);
          console.log(`   Error: ${error.error}`);
          console.log(`   Type: ${error.errorType || 'ValidationError'}`);
          console.log('');
        });
      }

      console.log('\n🎉 Enhanced bulk upload validation test completed!');
      resolve();
    });
  });
}

// Run the test
testBulkUploadValidation().catch(console.error);
