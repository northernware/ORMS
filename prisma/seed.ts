import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// The 11 standing committees of the Sangguniang Bayan. Composition per
// committee: 1 Chairman, 1 Vice Chairman, 3 Members. SB members sit on
// several committees each.
const COMMITTEES: { name: string; description: string }[] = [
  { name: 'Committee on Rules and Privileges', description: 'Internal rules, order of business, and privileges of the Sanggunian' },
  { name: 'Committee on Ways and Means', description: 'Revenue generation, taxation, and fiscal measures' },
  { name: 'Committee on Appropriations', description: 'Budget review and appropriation measures' },
  { name: 'Committee on Peace and Order and Public Safety', description: 'Peace and order, public safety, and disaster preparedness' },
  { name: 'Committee on Health and Sanitation', description: 'Public health services and sanitation' },
  { name: 'Committee on Education, Culture and Sports', description: 'Education, cultural affairs, and sports development' },
  { name: 'Committee on Agriculture and Fisheries', description: 'Agricultural and fisheries development' },
  { name: 'Committee on Public Works and Infrastructure', description: 'Infrastructure projects and public works' },
  { name: 'Committee on Environmental Protection', description: 'Environmental protection and natural resources' },
  { name: 'Committee on Women, Children and Family Welfare', description: 'Welfare of women, children, and families' },
  { name: 'Committee on Tourism, Trade and Industry', description: 'Tourism, trade, investment, and local enterprise' },
]

// Placeholder roster of SB members used to fill committee seats.
const SB_MEMBERS = [
  'Hon. R. Dela Cruz',
  'Hon. M. Santos',
  'Hon. J. Reyes',
  'Hon. A. Bautista',
  'Hon. L. Garcia',
  'Hon. C. Mendoza',
  'Hon. P. Aquino',
  'Hon. T. Villanueva',
  'Hon. E. Ramos (Liga ng mga Barangay)',
  'Hon. K. Torres (SK Federation)',
]

async function main() {
  console.log('🌱 Seeding database...')

  // Seed departments
  const adminDept = await prisma.department.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      name: 'Office of the Administrator',
      code: 'ADMIN',
      description: 'Administrative Office',
      isActive: true,
    },
  })

  const sbDept = await prisma.department.upsert({
    where: { code: 'SB' },
    update: {},
    create: {
      name: 'Sangguniang Bayan Office',
      code: 'SB',
      description: 'Office of the Sangguniang Bayan — secretariat and records',
      isActive: true,
    },
  })

  const mayorDept = await prisma.department.upsert({
    where: { code: 'MAYOR' },
    update: {},
    create: {
      name: "Office of the Mayor",
      code: 'MAYOR',
      description: "Mayor's Office — endorses most requests to the Sanggunian",
      isActive: true,
    },
  })

  const engrDept = await prisma.department.upsert({
    where: { code: 'ENGR' },
    update: {},
    create: {
      name: 'Engineering Department',
      code: 'ENGR',
      description: 'Engineering and Infrastructure',
      isActive: true,
    },
  })

  const healthDept = await prisma.department.upsert({
    where: { code: 'HEALTH' },
    update: {},
    create: {
      name: 'Health Department',
      code: 'HEALTH',
      description: 'Public Health Services',
      isActive: true,
    },
  })

  const budgetDept = await prisma.department.upsert({
    where: { code: 'BUDGET' },
    update: {},
    create: {
      name: 'Budget and Finance',
      code: 'BUDGET',
      description: 'Budget and Financial Management',
      isActive: true,
    },
  })

  console.log('✅ Departments seeded')

  // Seed users
  const hashedPassword = await bcrypt.hash('password', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@orms.gov' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@orms.gov',
      password: hashedPassword,
      role: 'Administrator',
      departmentId: adminDept.id,
      isActive: true,
    },
  })

  const sbStaff = await prisma.user.upsert({
    where: { email: 'sbstaff@orms.gov' },
    update: { role: 'SB_Staff', departmentId: sbDept.id },
    create: {
      name: 'SB Office Staff',
      email: 'sbstaff@orms.gov',
      password: hashedPassword,
      role: 'SB_Staff',
      departmentId: sbDept.id,
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'sbmember@orms.gov' },
    update: { role: 'SB_Member', departmentId: sbDept.id },
    create: {
      name: 'Hon. R. Dela Cruz',
      email: 'sbmember@orms.gov',
      password: hashedPassword,
      role: 'SB_Member',
      departmentId: sbDept.id,
      isActive: true,
    },
  })

  const deptHead = await prisma.user.upsert({
    where: { email: 'head@orms.gov' },
    update: {},
    create: {
      name: 'Engineering Head',
      email: 'head@orms.gov',
      password: hashedPassword,
      role: 'Department_Head',
      departmentId: engrDept.id,
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'staff@orms.gov' },
    update: {},
    create: {
      name: 'Health Staff',
      email: 'staff@orms.gov',
      password: hashedPassword,
      role: 'Staff',
      departmentId: healthDept.id,
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'vicemayor@orms.gov' },
    update: { role: 'Vice_Mayor', departmentId: sbDept.id },
    create: {
      name: 'Vice Mayor (Presiding Officer)',
      email: 'vicemayor@orms.gov',
      password: hashedPassword,
      role: 'Vice_Mayor',
      departmentId: sbDept.id,
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'mayor@orms.gov' },
    update: { role: 'Mayor', departmentId: mayorDept.id },
    create: {
      name: 'Mayor',
      email: 'mayor@orms.gov',
      password: hashedPassword,
      role: 'Mayor',
      departmentId: mayorDept.id,
      isActive: true,
    },
  })

  console.log('✅ Users seeded')

  // Seed the 11 standing committees and their seats.
  for (let i = 0; i < COMMITTEES.length; i++) {
    const def = COMMITTEES[i]
    const committee = await prisma.committee.upsert({
      where: { name: def.name },
      update: { description: def.description },
      create: { name: def.name, description: def.description, isActive: true },
    })

    // Rotate the roster so each committee gets a different chairman.
    await prisma.committeeMember.deleteMany({ where: { committeeId: committee.id } })
    const seats = [0, 1, 2, 3, 4].map((s) => SB_MEMBERS[(i + s) % SB_MEMBERS.length])
    await prisma.committeeMember.createMany({
      data: [
        { committeeId: committee.id, name: seats[0], position: 'Chairman' },
        { committeeId: committee.id, name: seats[1], position: 'Vice_Chairman' },
        { committeeId: committee.id, name: seats[2], position: 'Member' },
        { committeeId: committee.id, name: seats[3], position: 'Member' },
        { committeeId: committee.id, name: seats[4], position: 'Member' },
      ],
    })
  }

  const healthCommittee = await prisma.committee.findUniqueOrThrow({ where: { name: 'Committee on Health and Sanitation' } })
  const infraCommittee = await prisma.committee.findUniqueOrThrow({ where: { name: 'Committee on Public Works and Infrastructure' } })
  const waysCommittee = await prisma.committee.findUniqueOrThrow({ where: { name: 'Committee on Ways and Means' } })

  console.log('✅ Committees seeded')

  // Seed sample ordinances
  await prisma.ordinance.upsert({
    where: { ordinanceNumber: 'ORD-2025-001' },
    update: {},
    create: {
      ordinanceNumber: 'ORD-2025-001',
      title: 'Municipal Waste Management Ordinance',
      year: 2025,
      who: 'Municipal Government',
      what: 'Comprehensive waste management program',
      when: new Date('2025-01-15'),
      where: 'Municipality-wide',
      why: 'Environmental protection and public health',
      how: 'Implementation of segregation, collection, and disposal protocols',
      approvalAuthority: 'Municipal Council',
      departmentId: healthDept.id,
      status: 'active',
      summary: 'Establishes comprehensive waste management protocols across the municipality.',
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  })

  await prisma.ordinance.upsert({
    where: { ordinanceNumber: 'ORD-2025-002' },
    update: {},
    create: {
      ordinanceNumber: 'ORD-2025-002',
      title: 'Building Code Amendment',
      year: 2025,
      who: 'Engineering Department',
      what: 'Updated building standards for seismic resilience',
      when: new Date('2025-03-01'),
      where: 'All construction zones',
      why: 'Earthquake preparedness and structural safety',
      how: 'Adoption of updated seismic design standards',
      approvalAuthority: 'Municipal Council',
      departmentId: engrDept.id,
      status: 'active',
      summary: 'Amends existing building codes to include enhanced seismic standards.',
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  })

  console.log('✅ Ordinances seeded')

  // Seed sample resolutions across the real lifecycle. Delete-and-recreate
  // keeps re-seeding from piling up duplicates; children cascade.
  await prisma.resolution.deleteMany({})

  const term = '2025-2028'

  // Fully completed: request → calendar → committee → report → adopted → signed.
  const signed = await prisma.resolution.create({
    data: {
      resolutionNumber: 'RES-2026-001',
      title: 'MOA with Provincial Health Office for Medical Outreach',
      year: 2026,
      term,
      who: 'Municipal Health Office and Provincial Health Office',
      what: 'Memorandum of Agreement for quarterly medical outreach missions',
      when: new Date('2026-03-02'),
      where: 'All barangays',
      why: 'Bring basic health services closer to remote communities',
      how: 'Joint staffing and funding under a MOA prepared by the Health Office',
      requestedBy: 'Municipal Health Office',
      requestReceivedAt: new Date('2026-01-12'),
      endorsedByMayor: true,
      responsibleDepartmentId: healthDept.id,
      status: 'signed',
      summary: 'Authorizes the Mayor to sign a MOA with the Provincial Health Office for quarterly medical outreach missions.',
      adoptedAt: new Date('2026-02-23'),
      signedAt: new Date('2026-03-02'),
      requesterNotifiedAt: new Date('2026-03-04'),
      createdBy: sbStaff.id,
      updatedBy: sbStaff.id,
    },
  })
  await prisma.calendarItem.createMany({
    data: [
      { resolutionId: signed.id, purpose: 'referral', sessionDate: new Date('2026-01-19'), remarks: 'First take-up; referred to committee' },
      { resolutionId: signed.id, purpose: 'adoption', sessionDate: new Date('2026-02-23'), remarks: 'Committee report for adoption' },
    ],
  })
  await prisma.committeeReferral.create({
    data: {
      resolutionId: signed.id,
      committeeId: healthCommittee.id,
      referredAt: new Date('2026-01-19'),
      hearingHeldAt: new Date('2026-02-05'),
      reportFindings: 'The MOA terms are in order and funding is available under the health program budget.',
      reportRecommendation: 'Favorable — recommend adoption authorizing the Mayor to sign the MOA.',
      reportSubmittedAt: new Date('2026-02-16'),
    },
  })

  // Mid-flow: referred to committee, hearing pending.
  const inCommittee = await prisma.resolution.create({
    data: {
      resolutionNumber: 'RES-2026-002',
      title: 'Concreting of Farm-to-Market Road, Sitio Malinis',
      year: 2026,
      term,
      who: 'Engineering Department',
      what: 'Road concreting request endorsed for SB action',
      where: 'Sitio Malinis',
      why: 'Farm produce transport is impassable during rains',
      how: 'LGU funds with provincial counterpart',
      requestedBy: 'Barangay Council of Malinis',
      requestReceivedAt: new Date('2026-06-08'),
      endorsedByMayor: true,
      responsibleDepartmentId: engrDept.id,
      status: 'in_committee',
      summary: 'Request for concreting of the Sitio Malinis farm-to-market road.',
      createdBy: sbStaff.id,
      updatedBy: sbStaff.id,
    },
  })
  await prisma.calendarItem.create({
    data: { resolutionId: inCommittee.id, purpose: 'referral', sessionDate: new Date('2026-06-15'), remarks: 'First take-up' },
  })
  await prisma.committeeReferral.create({
    data: { resolutionId: inCommittee.id, committeeId: infraCommittee.id, referredAt: new Date('2026-06-15') },
  })

  // On the calendar, not yet taken up in session.
  const calendared = await prisma.resolution.create({
    data: {
      resolutionNumber: 'RES-2026-003',
      title: 'Grant of Market Stall Fee Discount for Displaced Vendors',
      year: 2026,
      term,
      requestedBy: 'Public Market Vendors Association',
      requestReceivedAt: new Date('2026-07-01'),
      endorsedByMayor: true,
      responsibleDepartmentId: budgetDept.id,
      status: 'calendared',
      summary: 'Request for temporary stall fee discounts for vendors displaced by the market renovation.',
      createdBy: sbStaff.id,
      updatedBy: sbStaff.id,
    },
  })
  await prisma.calendarItem.create({
    data: { resolutionId: calendared.id, purpose: 'referral', sessionDate: new Date('2026-07-20') },
  })

  // Fresh intake.
  await prisma.resolution.create({
    data: {
      resolutionNumber: 'RES-2026-004',
      title: 'Request for Additional Streetlights along the National Highway',
      year: 2026,
      term,
      requestedBy: 'Office of the Mayor',
      requestReceivedAt: new Date('2026-07-15'),
      endorsedByMayor: true,
      responsibleDepartmentId: engrDept.id,
      status: 'request_received',
      summary: 'Endorsed request for installation of additional streetlights along the national highway stretch.',
      createdBy: sbStaff.id,
      updatedBy: sbStaff.id,
    },
  })

  // Report submitted; awaiting the adoption session.
  const forAdoption = await prisma.resolution.create({
    data: {
      resolutionNumber: 'RES-2026-005',
      title: 'Imposition of Special Levy for Public Market Improvement',
      year: 2026,
      term,
      requestedBy: 'Budget and Finance Office',
      requestReceivedAt: new Date('2026-05-04'),
      endorsedByMayor: false,
      responsibleDepartmentId: budgetDept.id,
      status: 'for_adoption',
      summary: 'Proposed special levy to fund the public market improvement program.',
      createdBy: sbStaff.id,
      updatedBy: sbStaff.id,
    },
  })
  await prisma.calendarItem.createMany({
    data: [
      { resolutionId: forAdoption.id, purpose: 'referral', sessionDate: new Date('2026-05-18') },
      { resolutionId: forAdoption.id, purpose: 'adoption', sessionDate: new Date('2026-07-20'), remarks: 'Committee report for adoption' },
    ],
  })
  await prisma.committeeReferral.create({
    data: {
      resolutionId: forAdoption.id,
      committeeId: waysCommittee.id,
      referredAt: new Date('2026-05-18'),
      hearingHeldAt: new Date('2026-06-10'),
      reportFindings: 'Levy rates are within statutory limits; vendor consultation conducted.',
      reportRecommendation: 'Favorable with amendment — phase in the levy over two years.',
      reportSubmittedAt: new Date('2026-07-06'),
    },
  })

  console.log('✅ Resolutions seeded')
  console.log('🎉 Database seeding complete!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   Admin:      admin@orms.gov     / password')
  console.log('   SB Staff:   sbstaff@orms.gov   / password')
  console.log('   SB Member:  sbmember@orms.gov  / password')
  console.log('   Dept Head:  head@orms.gov      / password')
  console.log('   Staff:      staff@orms.gov     / password')
  console.log('   Vice Mayor: vicemayor@orms.gov / password')
  console.log('   Mayor:      mayor@orms.gov     / password')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
