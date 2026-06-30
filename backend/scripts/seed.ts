import {
  PrismaClient,
  ProjectStatus,
  ProjectType,
  RoleName,
  MilestoneStatus,
  SubmissionStatus,
  EvidenceType,
  NotificationType,
  RiskSeverity,
  ForecastHorizon,
} from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function upsertSupabaseUser(email: string, password: string) {
  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find(u => u.email === email);
  if (found) return found;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // bypass email confirmation for seed users
  });
  if (error) throw new Error(`Failed to create Supabase auth user ${email}: ${error.message}`);
  return data.user;
}

async function hash(_pw: string) {
  return ''; // passwords managed by Supabase Auth
}

async function upsertRole(name: RoleName) {
  return prisma.role.upsert({ where: { name }, update: {}, create: { name, description: `${name} role` } });
}

async function main() {
  // Roles
  await Promise.all([
    upsertRole(RoleName.STUDENT),
    upsertRole(RoleName.SUPERVISOR),
    upsertRole(RoleName.ADMIN),
    upsertRole(RoleName.REVIEWER),
    upsertRole(RoleName.GUEST),
  ]);

  // Department
  const dept = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: { name: 'Computer Science', code: 'CS', description: 'Department of Computer Science & Engineering' },
  });

  // Cohort
  const cohort = await prisma.cohort.upsert({
    where: { id: 'cohort-2024' },
    update: {},
    create: { id: 'cohort-2024', name: 'Class of 2024', startDate: new Date('2024-01-15'), endDate: new Date('2024-12-15'), departmentId: dept.id },
  });

  // Supabase Auth users (created first so they can sign in immediately)
  const authUsers = [
    { email: 'admin@ipms.edu', password: 'Admin@1234' },
    { email: 'prof.boateng@ipms.edu', password: 'Supervisor@1234' },
    { email: 'dr.asante@ipms.edu', password: 'Supervisor@1234' },
    { email: 'kofi.adu@student.ipms.edu', password: 'Student@1234' },
    { email: 'ama.darko@student.ipms.edu', password: 'Student@1234' },
    { email: 'yaw.ofori@student.ipms.edu', password: 'Student@1234' },
    { email: 'akosua.frimpong@student.ipms.edu', password: 'Student@1234' },
  ];
  for (const u of authUsers) {
    await upsertSupabaseUser(u.email, u.password);
    console.log(`  ✓ Supabase auth user: ${u.email}`);
  }

  // Users
  const adminRole = await prisma.role.findUnique({ where: { name: RoleName.ADMIN } });
  const supervisorRole = await prisma.role.findUnique({ where: { name: RoleName.SUPERVISOR } });
  const studentRole = await prisma.role.findUnique({ where: { name: RoleName.STUDENT } });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ipms.edu' },
    update: {},
    create: {
      email: 'admin@ipms.edu', password: await hash('Admin@1234'),
      firstName: 'Grace', lastName: 'Mensah', preferredName: 'Grace',
      phone: '+233-24-000-0001', isActive: true, departmentId: dept.id,
      roles: { create: { roleId: adminRole!.id } },
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, title: 'HOD', departmentId: dept.id },
  });

  const sup1 = await prisma.user.upsert({
    where: { email: 'prof.boateng@ipms.edu' },
    update: {},
    create: {
      email: 'prof.boateng@ipms.edu', password: await hash('Supervisor@1234'),
      firstName: 'Kwame', lastName: 'Boateng', preferredName: 'Prof. Boateng',
      phone: '+233-24-000-0002', isActive: true, departmentId: dept.id,
      roles: { create: { roleId: supervisorRole!.id } },
    },
  });

  await prisma.supervisorProfile.upsert({
    where: { userId: sup1.id },
    update: {},
    create: { userId: sup1.id, title: 'Associate Professor', office: 'Room 204, CS Block' },
  });

  const sup2 = await prisma.user.upsert({
    where: { email: 'dr.asante@ipms.edu' },
    update: {},
    create: {
      email: 'dr.asante@ipms.edu', password: await hash('Supervisor@1234'),
      firstName: 'Abena', lastName: 'Asante', preferredName: 'Dr. Asante',
      phone: '+233-24-000-0003', isActive: true, departmentId: dept.id,
      roles: { create: { roleId: supervisorRole!.id } },
    },
  });

  await prisma.supervisorProfile.upsert({
    where: { userId: sup2.id },
    update: {},
    create: { userId: sup2.id, title: 'Senior Lecturer', office: 'Room 110, CS Block' },
  });

  // Students
  const students = await Promise.all([
    { email: 'kofi.adu@student.ipms.edu', firstName: 'Kofi', lastName: 'Adu', enrollment: 'CS/2021/001' },
    { email: 'ama.darko@student.ipms.edu', firstName: 'Ama', lastName: 'Darko', enrollment: 'CS/2021/002' },
    { email: 'yaw.ofori@student.ipms.edu', firstName: 'Yaw', lastName: 'Ofori', enrollment: 'CS/2021/003' },
    { email: 'akosua.frimpong@student.ipms.edu', firstName: 'Akosua', lastName: 'Frimpong', enrollment: 'CS/2021/004' },
  ].map(async s => {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email, password: await hash('Student@1234'),
        firstName: s.firstName, lastName: s.lastName, preferredName: s.firstName,
        phone: '+233-20-000-0000', isActive: true, departmentId: dept.id, cohortId: cohort.id,
        roles: { create: { roleId: studentRole!.id } },
      },
    });
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, enrollmentId: s.enrollment, level: '400', major: 'Computer Science', cohortId: cohort.id },
    });
    return user;
  }));

  const [kofi, ama, yaw, akosua] = students;

  // Projects
  const projects = await Promise.all([
    {
      title: 'AI-Powered Health Monitoring System',
      description: 'A wearable IoT system that uses machine learning to monitor vital signs and predict health anomalies in real time.',
      status: ProjectStatus.ACTIVE, type: ProjectType.THESIS,
      studentId: kofi.id, supervisorId: sup1.id,
      startDate: new Date('2024-02-01'), expectedEndDate: new Date('2024-11-30'),
    },
    {
      title: 'Blockchain-Based Academic Credential Verification',
      description: 'Decentralized platform for issuing and verifying academic certificates using Ethereum smart contracts.',
      status: ProjectStatus.ACTIVE, type: ProjectType.CAPSTONE,
      studentId: ama.id, supervisorId: sup1.id,
      startDate: new Date('2024-02-01'), expectedEndDate: new Date('2024-11-30'),
    },
    {
      title: 'Smart Campus Navigation App',
      description: 'Indoor navigation system using BLE beacons and computer vision for campus wayfinding.',
      status: ProjectStatus.ON_HOLD, type: ProjectType.RESEARCH,
      studentId: yaw.id, supervisorId: sup2.id,
      startDate: new Date('2024-03-01'), expectedEndDate: new Date('2024-12-15'),
    },
    {
      title: 'E-Waste Management Platform',
      description: 'Mobile platform connecting e-waste generators with certified recyclers, featuring gamification to encourage participation.',
      status: ProjectStatus.ACTIVE, type: ProjectType.CAPSTONE,
      studentId: akosua.id, supervisorId: sup2.id,
      startDate: new Date('2024-01-20'), expectedEndDate: new Date('2024-10-31'),
    },
  ].map(p => prisma.project.upsert({
    where: { id: p.title.toLowerCase().replace(/\s+/g, '-').slice(0, 36) },
    update: {},
    create: { id: p.title.toLowerCase().replace(/\s+/g, '-').slice(0, 36), ...p, cohortId: cohort.id, departmentId: dept.id },
  })));

  const [proj1, proj2, proj3, proj4] = projects;

  // Milestones for each project
  const milestoneData = [
    // Project 1 — AI Health Monitor (healthy)
    { projectId: proj1.id, title: 'Literature Review', dueDate: new Date('2024-03-15'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-03-10') },
    { projectId: proj1.id, title: 'System Architecture Design', dueDate: new Date('2024-04-30'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-04-25') },
    { projectId: proj1.id, title: 'Prototype Development', dueDate: new Date('2024-07-01'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-06-28') },
    { projectId: proj1.id, title: 'Model Training & Evaluation', dueDate: new Date('2024-09-01'), status: MilestoneStatus.IN_PROGRESS },
    { projectId: proj1.id, title: 'Final Report & Defence', dueDate: new Date('2024-11-15'), status: MilestoneStatus.PENDING },
    // Project 2 — Blockchain (at risk)
    { projectId: proj2.id, title: 'Research & Feasibility Study', dueDate: new Date('2024-03-01'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-03-05') },
    { projectId: proj2.id, title: 'Smart Contract Development', dueDate: new Date('2024-05-15'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-06-02') },
    { projectId: proj2.id, title: 'Frontend Dashboard', dueDate: new Date('2024-07-30'), status: MilestoneStatus.BLOCKED },
    { projectId: proj2.id, title: 'Security Audit', dueDate: new Date('2024-09-15'), status: MilestoneStatus.PENDING },
    { projectId: proj2.id, title: 'Final Submission', dueDate: new Date('2024-11-01'), status: MilestoneStatus.PENDING },
    // Project 3 — Campus Navigation (on hold/critical)
    { projectId: proj3.id, title: 'BLE Beacon Procurement', dueDate: new Date('2024-04-01'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-05-10') },
    { projectId: proj3.id, title: 'Indoor Mapping', dueDate: new Date('2024-06-01'), status: MilestoneStatus.BLOCKED },
    { projectId: proj3.id, title: 'App Development', dueDate: new Date('2024-08-01'), status: MilestoneStatus.PENDING },
    { projectId: proj3.id, title: 'Testing & Deployment', dueDate: new Date('2024-11-01'), status: MilestoneStatus.PENDING },
    // Project 4 — E-Waste (healthy)
    { projectId: proj4.id, title: 'Market Research', dueDate: new Date('2024-02-28'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-02-25') },
    { projectId: proj4.id, title: 'UI/UX Design', dueDate: new Date('2024-04-15'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-04-10') },
    { projectId: proj4.id, title: 'Backend API Development', dueDate: new Date('2024-06-30'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-06-28') },
    { projectId: proj4.id, title: 'Mobile App Build', dueDate: new Date('2024-08-31'), status: MilestoneStatus.COMPLETED, completedAt: new Date('2024-08-20') },
    { projectId: proj4.id, title: 'Pilot Testing', dueDate: new Date('2024-10-01'), status: MilestoneStatus.IN_PROGRESS },
  ];

  const milestones = await Promise.all(
    milestoneData.map(m => prisma.milestone.create({ data: m })),
  );

  // Submissions
  const subData = [
    { projectId: proj1.id, milestoneId: milestones[0].id, authorId: kofi.id, content: 'Literature review covering 45 papers on ML-based health monitoring systems, including CNN and LSTM approaches.', status: SubmissionStatus.APPROVED, evidenceType: EvidenceType.DOCUMENT },
    { projectId: proj1.id, milestoneId: milestones[1].id, authorId: kofi.id, content: 'System architecture includes ESP32 sensors, MQTT broker, and a FastAPI inference server with a React dashboard.', status: SubmissionStatus.APPROVED, evidenceType: EvidenceType.DOCUMENT },
    { projectId: proj1.id, milestoneId: milestones[2].id, authorId: kofi.id, content: 'Working prototype with heart rate, SpO2 and temperature sensors. Live data streams to cloud dashboard.', status: SubmissionStatus.APPROVED, evidenceType: EvidenceType.GITHUB, fileUrl: 'https://github.com/example/health-monitor' },
    { projectId: proj1.id, authorId: kofi.id, content: 'Progress update: LSTM model achieving 89% accuracy on validation set. Training ongoing.', status: SubmissionStatus.UNDER_REVIEW, evidenceType: EvidenceType.DOCUMENT },
    { projectId: proj2.id, milestoneId: milestones[5].id, authorId: ama.id, content: 'Feasibility study completed. Ethereum chosen over Hyperledger for public verifiability. Gas cost analysis included.', status: SubmissionStatus.APPROVED, evidenceType: EvidenceType.DOCUMENT },
    { projectId: proj2.id, milestoneId: milestones[6].id, authorId: ama.id, content: 'Smart contracts deployed on Sepolia testnet. 3 contract functions: issueCredential, revokeCredential, verifyCredential.', status: SubmissionStatus.REVISION_REQUIRED, evidenceType: EvidenceType.GITHUB, fileUrl: 'https://github.com/example/blockchain-creds' },
    { projectId: proj3.id, milestoneId: milestones[10].id, authorId: yaw.id, content: 'Procurement complete. 12 BLE beacons acquired and installed in Building A. Awaiting approval for Buildings B and C.', status: SubmissionStatus.APPROVED, evidenceType: EvidenceType.DOCUMENT },
    { projectId: proj4.id, milestoneId: milestones[14].id, authorId: akosua.id, content: 'Market research: 78% of respondents unaware of e-waste recycling options. Key competitors: GreenTech, EcoCollect.', status: SubmissionStatus.APPROVED, evidenceType: EvidenceType.DOCUMENT },
    { projectId: proj4.id, milestoneId: milestones[15].id, authorId: akosua.id, content: 'Figma designs complete. 32 screens covering user onboarding, waste pickup scheduling, and gamification badges.', status: SubmissionStatus.APPROVED, evidenceType: EvidenceType.SCREENSHOT },
    { projectId: proj4.id, milestoneId: milestones[16].id, authorId: akosua.id, content: 'REST API with Node.js/Express. Endpoints for users, pickups, recyclers, and rewards. 94% test coverage.', status: SubmissionStatus.APPROVED, evidenceType: EvidenceType.GITHUB, fileUrl: 'https://github.com/example/ewaste-api' },
    { projectId: proj4.id, milestoneId: milestones[17].id, authorId: akosua.id, content: 'Flutter app built for Android and iOS. APK available for testing. Push notifications integrated.', status: SubmissionStatus.APPROVED, evidenceType: EvidenceType.APK },
  ];

  const submissions = await Promise.all(subData.map(s => prisma.submission.create({ data: s })));

  // Notifications
  await Promise.all([
    prisma.notification.create({ data: { recipientId: kofi.id, type: NotificationType.REVIEW, title: 'Submission Reviewed', message: 'Your Model Training progress update is under review.', projectId: proj1.id } }),
    prisma.notification.create({ data: { recipientId: ama.id, type: NotificationType.ALERT, title: 'Revision Required', message: 'Your smart contract submission requires revision. Check supervisor feedback.', projectId: proj2.id } }),
    prisma.notification.create({ data: { recipientId: yaw.id, type: NotificationType.REMINDER, title: 'Milestone Overdue', message: 'Indoor Mapping milestone is blocked and overdue. Please contact your supervisor.', projectId: proj3.id } }),
    prisma.notification.create({ data: { recipientId: akosua.id, type: NotificationType.SYSTEM, title: 'Pilot Testing Started', message: 'Your Pilot Testing milestone has begun. Submit updates regularly.', projectId: proj4.id } }),
    prisma.notification.create({ data: { recipientId: sup1.id, type: NotificationType.REVIEW, title: 'Pending Reviews', message: '2 student submissions are awaiting your review.', link: '/supervisor/reviews' } }),
  ]);

  // AI Signals
  await Promise.all([
    // Proj1 — healthy
    prisma.aIHealthScore.create({ data: { projectId: proj1.id, score: 82, classification: 'HEALTHY', source: 'computed' } }),
    prisma.aIRiskSignal.create({ data: { projectId: proj1.id, severity: RiskSeverity.LOW, description: 'Model training milestone approaching deadline — monitor closely.', source: 'computed' } }),
    prisma.aIRecommendation.create({ data: { projectId: proj1.id, recommendation: 'Complete model evaluation and document results before moving to final report.', category: 'MILESTONE', source: 'computed' } }),
    prisma.forecast.create({ data: { projectId: proj1.id, horizon: ForecastHorizon.SHORT_TERM, summary: 'On track. 3 of 5 milestones completed. Short-term outlook is positive.', details: { completionRate: 60, overdue: 0 } } }),

    // Proj2 — at risk
    prisma.aIHealthScore.create({ data: { projectId: proj2.id, score: 48, classification: 'NEEDS_ATTENTION', source: 'computed' } }),
    prisma.aIRiskSignal.create({ data: { projectId: proj2.id, severity: RiskSeverity.HIGH, description: 'Frontend Dashboard milestone is BLOCKED — dependent tasks at risk.', source: 'computed' } }),
    prisma.aIRiskSignal.create({ data: { projectId: proj2.id, severity: RiskSeverity.MEDIUM, description: 'Smart contract submission requires revision — delay may cascade to security audit.', source: 'computed' } }),
    prisma.aIRecommendation.create({ data: { projectId: proj2.id, recommendation: 'Unblock the Frontend Dashboard milestone immediately. Escalate to supervisor if external dependency is causing the block.', category: 'MILESTONE', source: 'computed' } }),
    prisma.forecast.create({ data: { projectId: proj2.id, horizon: ForecastHorizon.MEDIUM_TERM, summary: 'At risk of missing November deadline if frontend remains blocked beyond September.', details: { completionRate: 40, overdue: 1, blockedMilestones: 1 } } }),

    // Proj3 — critical
    prisma.aIHealthScore.create({ data: { projectId: proj3.id, score: 22, classification: 'CRITICAL', source: 'computed' } }),
    prisma.aIRiskSignal.create({ data: { projectId: proj3.id, severity: RiskSeverity.CRITICAL, description: 'Project is ON HOLD. Indoor Mapping milestone is blocked and overdue by 60+ days.', source: 'computed' } }),
    prisma.aIRecommendation.create({ data: { projectId: proj3.id, recommendation: 'Immediate supervisor meeting required. Define a recovery plan with revised milestones dates.', category: 'PLANNING', source: 'computed' } }),
    prisma.forecast.create({ data: { projectId: proj3.id, horizon: ForecastHorizon.LONG_TERM, summary: 'High risk of project failure without immediate intervention. Only 25% of milestones complete.', details: { completionRate: 25, overdue: 2 } } }),

    // Proj4 — healthy
    prisma.aIHealthScore.create({ data: { projectId: proj4.id, score: 91, classification: 'HEALTHY', source: 'computed' } }),
    prisma.aIRiskSignal.create({ data: { projectId: proj4.id, severity: RiskSeverity.LOW, description: 'Minor risk: Pilot testing results may require additional iteration before final submission.', source: 'computed' } }),
    prisma.aIRecommendation.create({ data: { projectId: proj4.id, recommendation: 'Document pilot testing results thoroughly. Prepare final report in parallel.', category: 'SUBMISSION', source: 'computed' } }),
    prisma.forecast.create({ data: { projectId: proj4.id, horizon: ForecastHorizon.SHORT_TERM, summary: 'Excellent progress. 4 of 5 milestones complete. On track to finish ahead of schedule.', details: { completionRate: 80, overdue: 0 } } }),
  ]);

  // Analytics snapshots
  await Promise.all(projects.map(p =>
    prisma.analyticsSnapshot.create({
      data: {
        projectId: p.id,
        metrics: { views: Math.floor(Math.random() * 100 + 10), submissionsCount: Math.floor(Math.random() * 5 + 1), milestonesCompleted: Math.floor(Math.random() * 4 + 1) },
        note: 'Auto-generated snapshot on seed',
      },
    }),
  ));

  console.log('\n✓ Database seeded successfully!\n');
  console.log('Demo accounts (all passwords follow the same pattern):');
  console.log('  admin@ipms.edu          / Admin@1234');
  console.log('  prof.boateng@ipms.edu   / Supervisor@1234');
  console.log('  dr.asante@ipms.edu      / Supervisor@1234');
  console.log('  kofi.adu@student.ipms.edu       / Student@1234');
  console.log('  ama.darko@student.ipms.edu      / Student@1234');
  console.log('  yaw.ofori@student.ipms.edu      / Student@1234');
  console.log('  akosua.frimpong@student.ipms.edu / Student@1234');
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
