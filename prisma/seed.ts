import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

  const planDept = await prisma.department.upsert({
    where: { code: 'PLAN' },
    update: {},
    create: {
      name: 'Planning and Development',
      code: 'PLAN',
      description: 'Urban Planning and Development',
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

  const staff = await prisma.user.upsert({
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

  console.log('✅ Users seeded')

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

  await prisma.ordinance.upsert({
    where: { ordinanceNumber: 'ORD-2024-015' },
    update: {},
    create: {
      ordinanceNumber: 'ORD-2024-015',
      title: 'Public Market Regulation',
      year: 2024,
      who: 'Budget and Finance Department',
      what: 'Regulation of public market operations and vendor fees',
      when: new Date('2024-06-01'),
      where: 'All public markets',
      why: 'Orderly market operations and fair vendor practices',
      how: 'Licensing system and fee schedule implementation',
      approvalAuthority: 'Municipal Council',
      departmentId: budgetDept.id,
      status: 'active',
      summary: 'Regulates public market operations including vendor registration and fee structures.',
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  })

  console.log('✅ Ordinances seeded')

  // Seed sample resolutions
  await prisma.resolution.create({
    data: {
      resolutionNumber: 'RES-2025-001',
      title: 'Approval of Annual Health Budget',
      year: 2025,
      who: 'Municipal Council',
      what: 'Annual budget allocation for health programs',
      when: new Date('2025-02-01'),
      where: 'Health Department',
      why: 'Funding essential public health services',
      how: 'Budget appropriation from general fund',
      approvingBody: 'Municipal Council',
      responsibleDepartmentId: healthDept.id,
      status: 'active',
      summary: 'Approves the annual budget allocation for health department programs.',
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  })

  await prisma.resolution.create({
    data: {
      resolutionNumber: 'RES-2025-002',
      title: 'Infrastructure Development Plan',
      year: 2025,
      who: 'Engineering Department',
      what: 'Five-year infrastructure development roadmap',
      when: new Date('2025-04-15'),
      where: 'Municipality-wide',
      why: 'Systematic infrastructure improvement',
      how: 'Phased construction and rehabilitation projects',
      approvingBody: 'Municipal Council',
      responsibleDepartmentId: engrDept.id,
      status: 'pending_approval',
      summary: 'Proposes a five-year plan for infrastructure development and rehabilitation.',
      createdBy: deptHead.id,
      updatedBy: deptHead.id,
    },
  })

  await prisma.resolution.create({
    data: {
      resolutionNumber: 'RES-2025-003',
      title: 'Employee Welfare Program',
      year: 2025,
      who: 'Administrative Office',
      what: 'Enhanced employee benefits and welfare programs',
      where: 'All departments',
      why: 'Employee retention and satisfaction',
      how: 'Implementation of additional benefits packages',
      approvingBody: 'Municipal Council',
      responsibleDepartmentId: adminDept.id,
      status: 'draft',
      summary: 'Draft resolution for enhanced employee welfare programs.',
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  })

  console.log('✅ Resolutions seeded')

  // Seed audit logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'CREATE',
      tableName: 'ordinances',
      recordId: 1,
      newValues: JSON.stringify({ title: 'Municipal Waste Management Ordinance' }),
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script',
    },
  })

  console.log('✅ Audit logs seeded')
  console.log('🎉 Database seeding complete!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   Admin:     admin@orms.gov / password')
  console.log('   Dept Head: head@orms.gov  / password')
  console.log('   Staff:     staff@orms.gov / password')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
