import bcryptjs from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { Role, CaseStatus } from "@prisma/client";

async function main() {
  console.log("Cleaning database...");
  await prisma.caseAccesses.deleteMany();
  await prisma.caseDocuments.deleteMany();
  await prisma.cases.deleteMany();
  await prisma.tutorDocuments.deleteMany();
  await prisma.tutorProfiles.deleteMany();
  await prisma.authSessions.deleteMany();
  await prisma.users.deleteMany();

  console.log("Generating seed data...");
  const saltRounds = 10;
  const passwordHash = await bcryptjs.hash("Password123", saltRounds);

  // 1. Create 1 Admin
  console.log("Seeding 1 admin account...");
  await prisma.users.create({
    data: {
      username: "admin",
      password: passwordHash,
      name: "System Administrator",
      role: Role.ADMIN,
    },
  });

  const locations = [
    "Bukit Timah", "Clementi", "Orchard", "Jurong East", "Tampines",
    "Bedok", "Woodlands", "Ang Mo Kio", "Serangoon", "Novena",
    "Bishan", "Queenstown", "Sengkang", "Punggol", "Yishun",
    "Pasir Ris", "Toa Payoh", "Geylang", "Tiong Bahru", "Marine Parade"
  ];

  const subjects = [
    "Science", "Mathematics", "Additional Mathematics", "English", "Literature",
    "Chemistry", "Physics", "Biology", "History", "Geography",
    "Chinese", "Malay", "Tamil", "Economics"
  ];

  const levels = [
    "Primary 1", "Primary 3", "Primary 5", "Primary 6",
    "Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4",
    "JC 1", "JC 2"
  ];

  const qualificationsPool = [
    ["Bachelor of Science in Mathematics (NUS)", "MOE Teaching Award Recipient"],
    ["Master of Arts in English Literature (NTU)", "CELTA Certified Instructor"],
    ["Bachelor of Engineering (SMU)", "Ex-MOE School Teacher"],
    ["PhD in Chemistry (NUS)", "O-Level Exam Setter Assistant"],
    ["Bachelor of Science in Physics (NUS)", "10+ years private tutoring experience"]
  ];

  const experiencesPool = [
    ["5 years tutoring JC level", "Coached secondary school students in A-Math"],
    ["Teacher at secondary school for 3 years", "Private IELTS preparation coaching"],
    ["8 years full-time tuition centre tutor", "Prepared students for PSLE exams"],
    ["Over 100 students tutored in Biology", "Guided students to A grade in O-Level Chemistry"],
    ["12 years teaching experience", "Former Head of Department at top school"]
  ];

  // 2. Create 3 Parents
  console.log("Seeding 3 parent accounts...");
  const parents = [];
  for (let i = 1; i <= 3; i++) {
    const parent = await prisma.users.create({
      data: {
        username: `parent${i}`,
        password: passwordHash,
        name: `Parent User ${i}`,
        role: Role.PARENT,
      },
    });
    parents.push(parent);
  }

  // 3. Create 5 Tutors & Tutor Profiles
  console.log("Seeding 5 tutor accounts and profiles...");
  const tutors = [];
  for (let i = 1; i <= 5; i++) {
    const tutor = await prisma.users.create({
      data: {
        username: `tutor${i}`,
        password: passwordHash,
        name: `Tutor User ${i}`,
        role: Role.TUTOR,
      },
    });
    tutors.push(tutor);

    await prisma.tutorProfiles.create({
      data: {
        userId: tutor.id,
        displayName: `${tutor.name} (${subjects[i % subjects.length]!} Specialist)`,
        qualifications: qualificationsPool[i - 1]!,
        experiences: experiencesPool[i - 1]!,
      },
    });
  }

  // 4. Create 25 Tuition Cases
  console.log("Seeding 25 tuition cases...");
  const cases = [];
  const caseTitles = [
    "Primary 5 Science Tuition (Urgent)",
    "Secondary 4 A-Math Tuition",
    "JC 2 Chemistry Tuition",
    "Primary 6 English Foundations",
    "Secondary 3 Physics Preparation",
    "JC 1 Economics Homework Help",
    "Secondary 2 Geography and History",
    "Primary 3 Mathematics Booster",
    "Secondary 4 Biology Intensive",
    "JC 2 English Literature Study",
    "Primary 6 Chinese Oral and Writing",
    "Secondary 1 General Science Intro",
    "Secondary 4 Chemistry Prep Exam",
    "JC 1 H2 Physics Crash Course",
    "Primary 4 English Enrichment",
    "Secondary 3 Additional Math",
    "Secondary 2 Literature Appreciation",
    "JC 2 H2 Mathematics",
    "Primary 5 Mathematics Foundation",
    "Secondary 4 Chinese Exam Focus",
    "Primary 6 Science Revision",
    "Secondary 1 English Reading",
    "Secondary 3 Chemistry Lab Prep",
    "JC 2 H2 Economics",
    "Secondary 4 Physics Revision"
  ];

  for (let i = 1; i <= 25; i++) {
    const parent = parents[(i - 1) % parents.length]!;
    const status = i % 8 === 0 ? CaseStatus.CLOSED : (i % 6 === 0 ? CaseStatus.MATCHED : CaseStatus.OPEN);
    const caseData = await prisma.cases.create({
      data: {
        userId: parent.id,
        title: caseTitles[i - 1] ?? `Tuition Case ${i} (Request)`,
        subject: subjects[i % subjects.length]!,
        level: levels[i % levels.length]!,
        location: locations[i % locations.length]!,
        budgetPerHour: Math.floor(35 + (i * 3.5)),
        status: status,
      },
    });
    cases.push(caseData);
  }

  // 5. Create Case Accesses (Invites)
  console.log("Seeding initial case accesses / invitations...");
  // Let's invite tutor1 to case2
  await prisma.caseAccesses.create({
    data: {
      caseId: cases[1]!.id,
      parentId: cases[1]!.userId,
      tutorId: tutors[0]!.id,
    },
  });

  // Invite tutor2 to case3
  await prisma.caseAccesses.create({
    data: {
      caseId: cases[2]!.id,
      parentId: cases[2]!.userId,
      tutorId: tutors[1]!.id,
    },
  });

  // Invite tutor3, tutor4 to case5
  await prisma.caseAccesses.create({
    data: {
      caseId: cases[4]!.id,
      parentId: cases[4]!.userId,
      tutorId: tutors[2]!.id,
    },
  });
  await prisma.caseAccesses.create({
    data: {
      caseId: cases[4]!.id,
      parentId: cases[4]!.userId,
      tutorId: tutors[3]!.id,
    },
  });

  // Invite tutor5 to case6
  await prisma.caseAccesses.create({
    data: {
      caseId: cases[5]!.id,
      parentId: cases[5]!.userId,
      tutorId: tutors[4]!.id,
    },
  });

  console.log("Database seeded successfully with 1 Admin, 3 Parents, 5 Tutors, and 25 Cases!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
