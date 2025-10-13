const fs = require('fs');

function fixCSVFormat() {
  try {
    // Read the broken CSV
    const content = fs.readFileSync('fresh_data_fixed.csv', 'utf8');
    
    // Split into lines and rebuild properly
    const lines = content.split('\n');
    const header = lines[0];
    
    console.log('🔧 Fixing CSV formatting issues...\n');
    
    // Process each record carefully
    const fixedLines = [header];
    let currentRecord = '';
    let insideQuotes = false;
    let quoteCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Count quotes in this line
      const quotes = (line.match(/"/g) || []).length;
      quoteCount += quotes;
      
      if (currentRecord) {
        currentRecord += ' ' + line;
      } else {
        currentRecord = line;
      }
      
      // If we have even number of quotes, this record is complete
      if (quoteCount % 2 === 0) {
        // Clean up the record
        const cleanRecord = currentRecord
          .replace(/\n/g, ' ')  // Replace newlines with spaces
          .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
          .trim();
        
        fixedLines.push(cleanRecord);
        currentRecord = '';
        quoteCount = 0;
      }
    }
    
    // Add any remaining record
    if (currentRecord) {
      const cleanRecord = currentRecord
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      fixedLines.push(cleanRecord);
    }
    
    const fixedContent = fixedLines.join('\n');
    fs.writeFileSync('fresh_data_clean.csv', fixedContent);
    
    console.log('✅ Fixed CSV saved as "fresh_data_clean.csv"');
    console.log(`📊 Records processed: ${fixedLines.length - 1}`);
    
  } catch (error) {
    console.error('❌ Error fixing CSV:', error.message);
  }
}

fixCSVFormat();
