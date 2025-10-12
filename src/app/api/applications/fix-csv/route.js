import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    
    // Role mapping to fix emoji issues
    const roleMapping = {
      '?? Documentation (The storytellers)': '📝 Documentation (The storytellers)',
      '?? Marketing & Sponsorship (Bring home the bacon)': '🤝 Marketing & Sponsorship (Bring home the bacon)',
      '?? Events (Chaos coordinator extraordinaire)': '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
      '?? Events (Anchoring & Chaos coordinator extraordinaire)': '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
      '?? Design Team (Make it pretty. Make it pop.)': '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
      '?? Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)': '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
      '?? Technical / Web (Code is poetry, right?)': '💻 Technical / Web (Code is poetry, right?)',
      '?? Operations (The backbone. The MVP.)': '⚙️ Operations (The backbone. The MVP.)',
      '??Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)': '📸Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)'
    };

    // Fix the CSV content
    let fixedContent = fileContent;
    
    // Replace problematic role values
    for (const [broken, fixed] of Object.entries(roleMapping)) {
      fixedContent = fixedContent.replace(new RegExp(broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fixed);
    }
    
    // Fix column headers
    const headerMappings = {
      'whyJoinEcell': 'whyThisRole',
      'relevantExperience': 'pastExperience'
    };
    
    for (const [oldHeader, newHeader] of Object.entries(headerMappings)) {
      fixedContent = fixedContent.replace(oldHeader, newHeader);
    }
    
    // Fix empty required fields with placeholder data
    const lines = fixedContent.split('\n');
    const headers = lines[0].split(',');
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const cells = lines[i].split(',');
        
        // Fix empty pastExperience
        const pastExpIndex = headers.findIndex(h => h.includes('pastExperience') || h.includes('relevantExperience'));
        if (pastExpIndex !== -1 && (!cells[pastExpIndex] || cells[pastExpIndex].trim() === '' || cells[pastExpIndex] === 'No')) {
          cells[pastExpIndex] = '"No prior experience"';
        }
        
        // Fix empty whyThisRole
        const whyRoleIndex = headers.findIndex(h => h.includes('whyThisRole') || h.includes('whyJoinEcell'));
        if (whyRoleIndex !== -1 && (!cells[whyRoleIndex] || cells[whyRoleIndex].trim() === '')) {
          cells[whyRoleIndex] = '"Interested in contributing to E-Cell"';
        }
        
        lines[i] = cells.join(',');
      }
    }
    
    fixedContent = lines.join('\n');

    // Return the fixed CSV content
    return new Response(fixedContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="bulk_data_fixed.csv"'
      }
    });

  } catch (error) {
    console.error('CSV fix error:', error);
    return Response.json({
      error: 'Failed to fix CSV file',
      details: error.message
    }, { status: 500 });
  }
}
