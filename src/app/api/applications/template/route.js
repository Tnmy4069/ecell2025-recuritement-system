import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // CSV template with exact column headers as specified
    const csvTemplate = `fullName,email,whatsappNumber,isFromNashik,department,yearOfStudy,firstPreference,secondaryRole,whyJoinEcell,relevantExperience,hasOtherClubs,projectsWorkedOn,availabilityPerWeek,status,adminRemarks,feedback
John Doe,john.doe@example.com,9876543210,false,Computer Engineering (B.Tech),Second Year,📝 Documentation (Content Writing & Research),🎨 Design Team,I want to contribute to the entrepreneurship ecosystem and learn about startups while developing my writing skills.,I have experience in content writing for my college magazine and have written technical blogs.,true,Created a blog website using React and wrote 15+ technical articles on web development.,15-20 hours,pending,,Sample application for reference - remove this row when adding real data,
Jane Smith,jane.smith@example.com,9876543211,true,Mechanical Engineering (B.Tech),Third Year,🎨 Design Team (UI/UX & Graphics),📸 Photography/Videography,I'm passionate about design and want to create visual content for E-Cell events and startup branding.,2 years experience with Figma Adobe Creative Suite and have freelanced for local businesses.,false,Designed complete brand identity for 3 startups including logos posters and social media content.,20-25 hours,shortlisted,Good design portfolio,Another sample application - replace with actual data,
Raj Patel,raj.patel@example.com,9876543212,false,Information Technology (B.Tech),First Year,💻 Technical / Web (Development & Tech Support),⚙️ Operations,I want to build technical solutions for E-Cell and learn about startup technology stacks.,Built 5+ web applications using MERN stack and have experience with cloud deployment.,false,Developed an e-commerce platform a task management app and contributed to open source projects.,25-30 hours,selected,Excellent technical skills,Sample entry showing different status,
Priya Singh,priya.singh@example.com,9876543213,true,Business Administration (MBA),Second Year,🤝 Marketing & Sponsorship (Digital Marketing & PR),🎉 Events,I want to leverage my marketing background to promote entrepreneurship and build industry connections.,3 years of digital marketing experience with successful social media campaigns for brands.,true,Managed marketing for college fest (20k+ attendees) and increased social media engagement by 400%.,18-22 hours,rejected,Overqualified for student position,Example of rejected application,
Arjun Kumar,arjun.kumar@example.com,9876543214,false,Electronics Engineering (B.Tech),Third Year,🎉 Events (Event Management & Coordination),🤝 Marketing & Sponsorship,I enjoy organizing events and want to create impactful experiences that inspire future entrepreneurs.,Organized 10+ college events including technical workshops and cultural programs.,true,Led organizing committee for TechFest 2024 (5000+ participants) and managed logistics for startup pitch competition.,15-18 hours,pending,Good event management experience,Replace this sample data with real applications,`;

    // Create response with CSV content using tab-separated values
    const response = new NextResponse(csvTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ecell_applications_template.csv"',
        'Cache-Control': 'no-cache',
      },
    });

    return response;
  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
