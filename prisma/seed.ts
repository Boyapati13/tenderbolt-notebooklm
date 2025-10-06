import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: "org_demo" },
    update: {},
    create: {
      id: "org_demo",
      name: "Demo Company Ltd",
    },
  });

  console.log("✓ Organization created:", org.name);

  // Create user
  const user = await prisma.user.upsert({
    where: { email: "demo@tenderbolt.ai" },
    update: {},
    create: {
      id: "user_demo",
      email: "demo@tenderbolt.ai",
      name: "Demo User",
      organizationId: org.id,
    },
  });

  console.log("✓ User created:", user.name);

  // Create sample tenders
  const tenders = [
    {
      id: "tender_001",
      title: "Government Infrastructure Project",
      description: "Major highway construction and maintenance project for the Department of Transportation",
      value: 5000000,
      currency: "USD",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      status: "active",
      winProbability: 75,
      technicalScore: 80,
      commercialScore: 70,
      complianceScore: 85,
      riskScore: 65,
      client: "Department of Transportation",
      stage: "Proposal Development",
      submissionDays: 45,
      goNoGo: "GO" as const,
      organizationId: org.id,
      ownerId: user.id,
    },
    {
      id: "tender_002",
      title: "Cloud Infrastructure Migration",
      description: "Enterprise cloud migration and modernization services for financial services company",
      value: 2500000,
      currency: "USD",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "active",
      winProbability: 65,
      technicalScore: 75,
      commercialScore: 60,
      complianceScore: 70,
      riskScore: 55,
      client: "Global Finance Corp",
      stage: "Technical Review",
      submissionDays: 30,
      goNoGo: "GO" as const,
      organizationId: org.id,
      ownerId: user.id,
    },
    {
      id: "tender_003",
      title: "Healthcare IT System Implementation",
      description: "Electronic health records system implementation for regional hospital network",
      value: 3800000,
      currency: "USD",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      status: "active",
      winProbability: 82,
      technicalScore: 85,
      commercialScore: 78,
      complianceScore: 90,
      riskScore: 72,
      client: "Regional Healthcare Network",
      stage: "Qualification",
      submissionDays: 60,
      goNoGo: "GO" as const,
      organizationId: org.id,
      ownerId: user.id,
    },
    {
      id: "tender_004",
      title: "Educational Software Platform",
      description: "Development of comprehensive learning management system for university",
      value: 1200000,
      currency: "USD",
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      status: "active",
      winProbability: 45,
      technicalScore: 60,
      commercialScore: 50,
      complianceScore: 55,
      riskScore: 40,
      client: "State University System",
      stage: "Initial Assessment",
      submissionDays: 90,
      goNoGo: "UNDECIDED" as const,
      organizationId: org.id,
      ownerId: user.id,
    },
    {
      id: "tender_005",
      title: "Data Center Upgrade Project",
      description: "Complete data center infrastructure upgrade and expansion",
      value: 4500000,
      currency: "USD",
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (completed)
      status: "won",
      winProbability: 100,
      technicalScore: 95,
      commercialScore: 88,
      complianceScore: 92,
      riskScore: 85,
      client: "Tech Innovations Inc",
      stage: "Awarded",
      submissionDays: 0,
      goNoGo: "GO" as const,
      organizationId: org.id,
      ownerId: user.id,
    },
  ];

  for (const tender of tenders) {
    const created = await prisma.tender.upsert({
      where: { id: tender.id },
      update: {},
      create: tender,
    });
    console.log(`✓ Tender created: ${created.title}`);

    // Create stages for each tender
    if (created.status === "active") {
      const stages = [
        {
          id: `${tender.id}_stage_1`,
          name: "Requirements Analysis",
          order: 1,
          status: "COMPLETE" as const,
          tenderId: created.id,
        },
        {
          id: `${tender.id}_stage_2`,
          name: "Solution Design",
          order: 2,
          status: "IN_PROGRESS" as const,
          tenderId: created.id,
        },
        {
          id: `${tender.id}_stage_3`,
          name: "Proposal Writing",
          order: 3,
          status: "PENDING" as const,
          tenderId: created.id,
        },
        {
          id: `${tender.id}_stage_4`,
          name: "Review & Submit",
          order: 4,
          status: "PENDING" as const,
          tenderId: created.id,
        },
      ];

      for (const stage of stages) {
        await prisma.stage.upsert({
          where: { id: stage.id },
          update: {},
          create: stage,
        });
      }
      console.log(`  ✓ Created ${stages.length} stages for ${created.title}`);
    }

    // Create sample insights for active tenders
    if (created.status === "active" && [tenders[0].id, tenders[1].id].includes(tender.id)) {
      const insights = [
        {
          id: `${tender.id}_insight_1`,
          type: "requirement",
          content: "Minimum 5 years of industry experience required for project lead",
          citation: "Technical Requirements Document, Section 3.2",
          tenderId: created.id,
        },
        {
          id: `${tender.id}_insight_2`,
          type: "compliance",
          content: "ISO 27001 certification mandatory for security compliance",
          citation: "Compliance Requirements, Page 12",
          tenderId: created.id,
        },
        {
          id: `${tender.id}_insight_3`,
          type: "risk",
          content: "Tight timeline may require additional resources to meet deadlines",
          citation: "Project Schedule Analysis",
          tenderId: created.id,
        },
        {
          id: `${tender.id}_insight_4`,
          type: "deadline",
          content: `Submission deadline: ${created.deadline?.toLocaleDateString()}`,
          citation: "Tender Notice",
          tenderId: created.id,
        },
      ];

      for (const insight of insights) {
        await prisma.insight.upsert({
          where: { id: insight.id },
          update: {},
          create: insight,
        });
      }
      console.log(`  ✓ Created ${insights.length} insights for ${created.title}`);
    }
  }

  console.log("\n✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

