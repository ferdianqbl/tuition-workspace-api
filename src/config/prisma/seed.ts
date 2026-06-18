import bcryptjs from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { Role, CaseStatus } from "../../generated/prisma/client";

async function main() {
  console.log("Cleaning database...");
  await prisma.caseAccesses.deleteMany();
  await prisma.caseDocuments.deleteMany();
  await prisma.cases.deleteMany();
  await prisma.tutorDocuments.deleteMany();
  await prisma.tutorProfiles.deleteMany();
  await prisma.authSessions.deleteMany();
  await prisma.users.deleteMany();

  console.log("Seeding users...");
  const saltRounds = 10;
  const passwordHash = await bcryptjs.hash("Password123", saltRounds);

  // 1. Create Admin
  const admin = await prisma.users.create({
    data: {
      username: "admin",
      password: passwordHash,
      name: "System Administrator",
      role: Role.ADMIN,
    },
  });

  // 2. Create Parents
  const parent1 = await prisma.users.create({
    data: {
      username: "parent1",
      password: passwordHash,
      name: "Parent One",
      role: Role.PARENT,
    },
  });

  const parent2 = await prisma.users.create({
    data: {
      username: "parent2",
      password: passwordHash,
      name: "Parent Two",
      role: Role.PARENT,
    },
  });

  // 3. Create Tutors
  const tutorUser1 = await prisma.users.create({
    data: {
      username: "tutor1",
      password: passwordHash,
      name: "Tutor One",
      role: Role.TUTOR,
    },
  });

  const tutorUser2 = await prisma.users.create({
    data: {
      username: "tutor2",
      password: passwordHash,
      name: "Tutor Two",
      role: Role.TUTOR,
    },
  });

  // 4. Create Tutor Profiles
  const tutorProfile1 = await prisma.tutorProfiles.create({
    data: {
      userId: tutorUser1.id,
      displayName: "Tutor One (Mathematics Specialist)",
      qualifications: [
        "Bachelor of Science in Mathematics (NUS)",
        "MOE Teaching Award Recipient",
      ],
      experiences: [
        "5 years tutoring JC H2 Mathematics",
        "Coached secondary school students in A-Math",
      ],
    },
  });

  const tutorProfile2 = await prisma.tutorProfiles.create({
    data: {
      userId: tutorUser2.id,
      displayName: "Tutor Two (English & Literature Specialist)",
      qualifications: [
        "Master of Arts in English Literature (NTU)",
        "CELTA Certified Instructor",
      ],
      experiences: [
        "Teacher at secondary school for 3 years",
        "Private IELTS preparation coaching",
      ],
    },
  });

  // 5. Create Tuition Cases
  const case1 = await prisma.cases.create({
    data: {
      userId: parent1.id,
      title: "Primary 5 Science Tuition (Urgent)",
      subject: "Science",
      level: "Primary 5",
      location: "Bukit Timah",
      budgetPerHour: 45.0,
      status: CaseStatus.OPEN,
    },
  });

  const case2 = await prisma.cases.create({
    data: {
      userId: parent1.id,
      title: "Secondary 4 A-Math Tuition",
      subject: "Additional Mathematics",
      level: "Secondary 4",
      location: "Clementi",
      budgetPerHour: 60.0,
      status: CaseStatus.OPEN,
    },
  });

  const case3 = await prisma.cases.create({
    data: {
      userId: parent2.id,
      title: "JC 2 Chemistry Tuition",
      subject: "Chemistry",
      level: "JC 2",
      location: "Orchard",
      budgetPerHour: 85.0,
      status: CaseStatus.OPEN,
    },
  });

  // 6. Create Case Accesses (Inviting Tutors)
  // Invite tutor1 to case2 (A-Math)
  await prisma.caseAccesses.create({
    data: {
      caseId: case2.id,
      parentId: parent1.id,
      tutorId: tutorUser1.id,
    },
  });

  // Invite tutor2 to case3 (Chemistry)
  await prisma.caseAccesses.create({
    data: {
      caseId: case3.id,
      parentId: parent2.id,
      tutorId: tutorUser2.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
