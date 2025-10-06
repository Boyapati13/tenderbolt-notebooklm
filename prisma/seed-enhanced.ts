import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with enhanced data...");

  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: "org_demo" },
    update: {},
    create: {
      id: "org_demo",
      name: "TenderBolt Solutions Ltd",
    },
  });

  console.log("✓ Organization created:", org.name);

  // Create team members/users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "sarah.johnson@tenderbolt.ai" },
      update: {},
      create: {
        id: "user_001",
        email: "sarah.johnson@tenderbolt.ai",
        name: "Sarah Johnson",
        role: "Bid Manager",
        department: "Business Development",
        phone: "+1 (555) 123-4567",
        organizationId: org.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "michael.chen@tenderbolt.ai" },
      update: {},
      create: {
        id: "user_002",
        email: "michael.chen@tenderbolt.ai",
        name: "Michael Chen",
        role: "Technical Lead",
        department: "Engineering",
        phone: "+1 (555) 234-5678",
        organizationId: org.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "emma.davis@tenderbolt.ai" },
      update: {},
      create: {
        id: "user_003",
        email: "emma.davis@tenderbolt.ai",
        name: "Emma Davis",
        role: "Compliance Officer",
        department: "Legal & Compliance",
        phone: "+1 (555) 345-6789",
        organizationId: org.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "james.wilson@tenderbolt.ai" },
      update: {},
      create: {
        id: "user_004",
        email: "james.wilson@tenderbolt.ai",
        name: "James Wilson",
        role: "Bid Writer",
        department: "Proposals",
        phone: "+1 (555) 456-7890",
        organizationId: org.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "olivia.martinez@tenderbolt.ai" },
      update: {},
      create: {
        id: "user_005",
        email: "olivia.martinez@tenderbolt.ai",
        name: "Olivia Martinez",
        role: "Financial Analyst",
        department: "Finance",
        phone: "+1 (555) 567-8901",
        organizationId: org.id,
      },
    }),
  ]);

  console.log(`✓ ${users.length} team members created`);

  // Create sample tenders with different statuses
  const tendersData = [
    {
      id: "tender_001",
      title: "Government Infrastructure Project",
      description: "Major highway construction and maintenance project for the Department of Transportation",
      value: 5000000,
      currency: "USD",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: "working",
      winProbability: 75,
      technicalScore: 80,
      commercialScore: 70,
      complianceScore: 85,
      riskScore: 65,
      client: "Department of Transportation",
      priority: "high",
      tags: "government,infrastructure,construction",
      notes: "Strong relationship with client. Previous successful projects.",
      oneDriveLink: "https://tenderboltltd-my.sharepoint.com/personal/projects/gov-infrastructure-2025",
      googleDriveLink: "https://drive.google.com/drive/folders/1ABC123_GovInfra2025",
      ownerId: users[0].id,
    },
    {
      id: "tender_002",
      title: "Cloud Infrastructure Migration",
      description: "Enterprise cloud migration and infrastructure modernization for Fortune 500 company",
      value: 2500000,
      currency: "USD",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "submitted",
      winProbability: 65,
      technicalScore: 85,
      commercialScore: 60,
      complianceScore: 75,
      riskScore: 70,
      client: "Global Tech Solutions Inc",
      priority: "high",
      tags: "cloud,IT,migration,aws",
      notes: "Submitted on time. Waiting for client evaluation.",
      oneDriveLink: "https://tenderboltltd-my.sharepoint.com/personal/projects/cloud-migration-gts",
      ownerId: users[1].id,
    },
    {
      id: "tender_003",
      title: "Healthcare IT System",
      description: "Implementation of integrated healthcare management system for regional hospital network",
      value: 3800000,
      currency: "USD",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: "interested",
      winProbability: 82,
      technicalScore: 90,
      commercialScore: 75,
      complianceScore: 88,
      riskScore: 55,
      client: "Regional Health Authority",
      priority: "high",
      tags: "healthcare,IT,HIPAA,compliance",
      notes: "Excellent technical fit. Strong compliance capabilities.",
      googleDriveLink: "https://drive.google.com/drive/folders/2DEF456_HealthcareIT",
      ownerId: users[0].id,
    },
    {
      id: "tender_004",
      title: "Enterprise Software Implementation",
      description: "Custom ERP system implementation for manufacturing company",
      value: 1200000,
      currency: "USD",
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: "discovery",
      winProbability: 55,
      technicalScore: 65,
      commercialScore: 70,
      complianceScore: 60,
      riskScore: 75,
      client: "Manufacturing Corp",
      priority: "medium",
      tags: "erp,software,manufacturing",
      notes: "Initial discovery phase. Need more technical details.",
      oneDriveLink: "https://tenderboltltd-my.sharepoint.com/personal/projects/erp-manufacturing",
      ownerId: users[1].id,
    },
    {
      id: "tender_005",
      title: "Data Center Modernization",
      description: "Complete data center infrastructure upgrade and optimization",
      value: 4500000,
      currency: "USD",
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      status: "working",
      winProbability: 70,
      technicalScore: 75,
      commercialScore: 72,
      complianceScore: 80,
      riskScore: 68,
      client: "Financial Services Group",
      priority: "high",
      tags: "datacenter,infrastructure,fintech",
      notes: "Complex technical requirements. Good commercial position.",
      googleDriveLink: "https://drive.google.com/drive/folders/3GHI789_DataCenter2025",
      ownerId: users[0].id,
    },
    {
      id: "tender_006",
      title: "Cybersecurity Assessment Project",
      description: "Comprehensive security audit and penetration testing services",
      value: 850000,
      currency: "USD",
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: "closed",
      winProbability: 45,
      technicalScore: 70,
      commercialScore: 50,
      complianceScore: 75,
      riskScore: 80,
      client: "Energy Corporation",
      priority: "low",
      tags: "security,audit,cyber",
      notes: "Lost to competitor. Price too high.",
      ownerId: users[2].id,
    },
    {
      id: "tender_007",
      title: "Smart City IoT Platform",
      description: "IoT infrastructure for smart city initiative",
      value: 6200000,
      currency: "USD",
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: "discovery",
      winProbability: 60,
      technicalScore: 70,
      commercialScore: 65,
      complianceScore: 68,
      riskScore: 72,
      client: "City of Metropolis",
      priority: "medium",
      tags: "iot,smartcity,government",
      notes: "Long-term opportunity. Requires partnership.",
      oneDriveLink: "https://tenderboltltd-my.sharepoint.com/personal/projects/smartcity-iot",
      ownerId: users[1].id,
    },
    {
      id: "tender_008",
      title: "E-Learning Platform Development",
      description: "Development of comprehensive online learning management system",
      value: 950000,
      currency: "USD",
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: "not_interested",
      winProbability: 30,
      technicalScore: 55,
      commercialScore: 40,
      complianceScore: 60,
      riskScore: 85,
      client: "University Consortium",
      priority: "low",
      tags: "education,software,lms",
      notes: "Not aligned with strategic focus. Declining to bid.",
      ownerId: users[3].id,
    },
  ];

  for (const tenderData of tendersData) {
    const tender = await prisma.tender.upsert({
      where: { id: tenderData.id },
      update: {},
      create: {
        ...tenderData,
        organizationId: org.id,
      },
    });

    // Add team members to each tender
    const teamAssignments = [
      { tenderId: tender.id, userId: users[0].id, role: "Bid Manager" },
      { tenderId: tender.id, userId: users[1].id, role: "Technical Lead" },
      { tenderId: tender.id, userId: users[2].id, role: "Compliance Reviewer" },
      { tenderId: tender.id, userId: users[3].id, role: "Bid Writer" },
    ];

    // Only assign team to active tenders (not closed or not_interested)
    if (!["closed", "not_interested"].includes(tender.status)) {
      for (const assignment of teamAssignments) {
        await prisma.teamMember.upsert({
          where: {
            userId_tenderId: {
              userId: assignment.userId,
              tenderId: assignment.tenderId,
            },
          },
          update: {},
          create: assignment,
        });
      }
    }

    // Add external links
    if (tender.status !== "not_interested" && tender.status !== "closed") {
      await prisma.externalLink.create({
        data: {
          label: "Technical Documentation",
          url: `https://docs.tenderbolt.ai/projects/${tender.id}/technical`,
          type: "custom",
          description: "Technical specifications and architecture documents",
          tenderId: tender.id,
        },
      });

      await prisma.externalLink.create({
        data: {
          label: "Client Portal",
          url: `https://portal.client.com/${tender.id}`,
          type: "custom",
          description: "Client-facing project portal",
          tenderId: tender.id,
        },
      });
    }

    console.log(`✓ Tender created: ${tender.title} (${tender.status})`);
  }

  console.log("\n🎉 Database seeding completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   • 1 Organization`);
  console.log(`   • ${users.length} Team Members`);
  console.log(`   • ${tendersData.length} Projects/Tenders`);
  console.log(`   • Team assignments and external links added`);
  console.log(`\n🚀 You can now start the app with: npm run dev`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

