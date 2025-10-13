const fs = require('fs');

function createCleanCSV() {
  // Let's recreate the CSV manually with proper escaping
  const records = [
    ['email', 'fullName', 'whatsappNumber', 'isFromNashik', 'department', 'yearOfStudy', 'firstPreference', 'secondaryRole', 'whyThisRole', 'pastExperience', 'hasOtherClubs', 'projectsWorkedOn', 'availabilityPerWeek', 'status', 'adminRemarks', 'feedback'],
    
    ['purvad02415@gmail.com', 'Purva Deepak Dhamne', '7798020105', 'Yes', 'Automation & Robotics (A&R)', 'TE (The sweet spot.)', '🤝 Marketing & Sponsorship (Bring home the bacon)', '🎉 Events (Anchoring & Chaos coordinator extraordinaire)', 'I have good communication skills which I can utilise and upgrade in this role and grow with the E-Cell Team', 'I have past experience in Marketing Public Relations Building Counselling Anchoring Modeling Designing Events Management Photography', 'Yes', 'ARSA', '⏱️ 4–6 hrs/week minimum 🌙 Available for late-night / off-campus events', 'pending', '', ''],
    
    ['sanikatambe1213@gmail.com', 'Sanika Ambadas Tambe', '8766713645', 'Yes', 'Civil and Environmental Engineering (CEE)', 'SE (Getting warmed up, huh?)', '🎉 Events (Anchoring & Chaos coordinator extraordinaire)', '🎨 Design Team (Make it pretty. Make it pop.)', 'I think I can handle the crowd, my conversation skills are strong', 'I was part of CESA committee in engineers week as event coordinator', 'No', '', '🌙 Available for late-night / off-campus events', 'pending', '', ''],
    
    ['eklavyahire01@gmail.com', 'Eklavya Ganesh Hire', '9112929633', 'Yes', 'Computer Science & Design (CSD)', 'FE (Energetic Soul? We love it.)', '🎉 Events (Anchoring & Chaos coordinator extraordinaire)', '📝 Documentation (The storytellers)', 'Ever since I entered this college campus I always wanted to be part of E-cell community', 'As the host of Teachers day and engineers Day event', 'Yes', 'Leading the Code crafters club', '⏱️ 4–6 hrs/week minimum', 'pending', '', ''],
    
    ['mohitgaikwad1784@gmail.com', 'Mohit Vinod Gaikwad', '9356883037', 'Yes', 'Automation & Robotics (A&R)', 'BE (Final boss energy.)', '⚙️ Operations (The backbone. The MVP.)', '🎨 Design Team (Make it pretty. Make it pop.)', 'Coz it suits me ig', 'I have leadership quality . I can also take decisions', 'No', '', '⏱️ 4–6 hrs/week minimum 🌙 Available for late-night / off-campus events', 'pending', '', ''],
    
    ['khushipal0908@gmail.com', 'Khushi Pal', '9518946709', 'Yes', 'Computer Science & Design (CSD)', 'FE (Energetic Soul? We love it.)', '🎉 Events (Anchoring & Chaos coordinator extraordinaire)', '💻 Technical / Web (Code is poetry, right?)', 'To be honest my first preference from the heart is the Technical/Web team but since Im still new to coding I dont feel confident enough to fit in just yet. Thats why I chose the Event team as my first preference.', 'Im currently learning web development Ive covered most of the basics but still need more practice to really play around with the code. Ive created a few simple web pages and found the process genuinely interesting.', 'No', '', '⏱️ 4–6 hrs/week minimum 🌙 Available for late-night / off-campus events', 'pending', '', '']
  ];
  
  // Convert to proper CSV format
  const csvContent = records.map(row => 
    row.map(field => {
      // Escape quotes and wrap in quotes if needed
      const escaped = String(field).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  ).join('\n');
  
  fs.writeFileSync('fresh_data_simple.csv', csvContent);
  console.log('✅ Created simplified CSV with first 6 records for testing');
  console.log('📁 File: fresh_data_simple.csv');
}

createCleanCSV();
