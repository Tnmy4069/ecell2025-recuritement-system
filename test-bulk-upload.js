const fs = require('fs');
const path = require('path');

async function testBulkUpload() {
  try {
    // Read the test CSV file with new applications
    const csvPath = path.join(__dirname, 'test_new_applications.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found:', csvPath);
      return;
    }
    
    const csvData = fs.readFileSync(csvPath, 'utf8');
    console.log('📤 Uploading CSV file to bulk endpoint...');
    console.log(`📄 File size: ${csvData.length} bytes`);
    console.log(`📄 First few lines:`, csvData.split('\n').slice(0, 3).join('\n'));
    
    // Create a File-like object using Blob
    const blob = new Blob([csvData], { type: 'text/csv' });
    const file = new File([blob], 'test_new_applications.csv', { type: 'text/csv' });
    
    // Create FormData and append the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Make the request to the bulk upload endpoint
    const response = await fetch('http://localhost:3000/api/applications/bulk', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Bulk upload successful!');
      console.log(`📊 Results:`, result);
    } else {
      console.log('❌ Bulk upload failed:');
      console.log(`Status: ${response.status}`);
      console.log(`Error:`, result);
    }
    
  } catch (error) {
    console.error('💥 Error during bulk upload:', error);
  }
}

// Run the test
testBulkUpload();
