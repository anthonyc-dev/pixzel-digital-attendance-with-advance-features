export const employees = [
  {
    id: "EMP001",
    name: "John Michael Santos",
    email: "john.santos@pixzel.com",
    department: "Engineering",
    position: "Senior Developer",
    status: "active",
    hireDate: "2022-03-15",
    avatar: "JMS",
    salary: 45000,
    attendanceRate: 98,
  },
  {
    id: "EMP002",
    name: "Maria Clara Rivera",
    email: "maria.rivera@pixzel.com",
    department: "Design",
    position: "UI/UX Designer",
    status: "active",
    hireDate: "2021-08-20",
    avatar: "MCR",
    salary: 38000,
    attendanceRate: 95,
  },
  {
    id: "EMP003",
    name: "Robert Chen",
    email: "robert.chen@pixzel.com",
    department: "Marketing",
    position: "Marketing Manager",
    status: "active",
    hireDate: "2020-05-10",
    avatar: "RC",
    salary: 52000,
    attendanceRate: 92,
  },
  {
    id: "EMP004",
    name: "Sarah Johnson",
    email: "sarah.johnson@pixzel.com",
    department: "Human Resources",
    position: "HR Specialist",
    status: "active",
    hireDate: "2021-11-01",
    avatar: "SJ",
    salary: 35000,
    attendanceRate: 100,
  },
  {
    id: "EMP005",
    name: "David Kim",
    email: "david.kim@pixzel.com",
    department: "Finance",
    position: "Financial Analyst",
    status: "on-leave",
    hireDate: "2022-01-05",
    avatar: "DK",
    salary: 42000,
    attendanceRate: 88,
  },
  {
    id: "EMP006",
    name: "Emily White",
    email: "emily.white@pixzel.com",
    department: "Engineering",
    position: "QA Engineer",
    status: "active",
    hireDate: "2023-02-14",
    avatar: "EW",
    salary: 36000,
    attendanceRate: 97,
  },
  {
    id: "EMP007",
    name: "James Rodriguez",
    email: "james.rodriguez@pixzel.com",
    department: "Operations",
    position: "Operations Manager",
    status: "active",
    hireDate: "2020-09-01",
    avatar: "JR",
    salary: 48000,
    attendanceRate: 94,
  },
  {
    id: "EMP008",
    name: "Lisa Anderson",
    email: "lisa.anderson@pixzel.com",
    department: "Sales",
    position: "Sales Representative",
    status: "inactive",
    hireDate: "2021-06-15",
    avatar: "LA",
    salary: 32000,
    attendanceRate: 75,
  },
];

export const attendanceLogs = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", date: "2026-04-11", timeIn: "08:55", timeOut: "17:32", status: "Present", hoursWorked: 8.62, overtime: 0.62 },
  { id: 2, employeeId: "EMP002", name: "Maria Clara Rivera", date: "2026-04-11", timeIn: "09:02", timeOut: "18:15", status: "Present", hoursWorked: 9.22, overtime: 1.22 },
  { id: 3, employeeId: "EMP003", name: "Robert Chen", date: "2026-04-11", timeIn: "08:45", timeOut: "17:45", status: "Present", hoursWorked: 9.0, overtime: 1.0 },
  { id: 4, employeeId: "EMP004", name: "Sarah Johnson", date: "2026-04-11", timeIn: "09:00", timeOut: "17:30", status: "Present", hoursWorked: 8.5, overtime: 0.5 },
  { id: 5, employeeId: "EMP006", name: "Emily White", date: "2026-04-11", timeIn: "08:50", timeOut: "18:00", status: "Present", hoursWorked: 9.17, overtime: 1.17 },
  { id: 6, employeeId: "EMP007", name: "James Rodriguez", date: "2026-04-11", timeIn: "09:10", timeOut: "18:30", status: "Late", hoursWorked: 9.33, overtime: 1.33 },
  { id: 7, employeeId: "EMP005", name: "David Kim", date: "2026-04-11", timeIn: "-", timeOut: "-", status: "On Leave", hoursWorked: 0, overtime: 0 },
];

export const leaveBalances = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", leaveType: "Vacation", total: 15, used: 5, remaining: 10 },
  { id: 2, employeeId: "EMP001", name: "John Michael Santos", leaveType: "Sick", total: 10, used: 2, remaining: 8 },
  { id: 3, employeeId: "EMP001", name: "John Michael Santos", leaveType: "Personal", total: 5, used: 1, remaining: 4 },
  { id: 4, employeeId: "EMP002", name: "Maria Clara Rivera", leaveType: "Vacation", total: 15, used: 8, remaining: 7 },
  { id: 5, employeeId: "EMP002", name: "Maria Clara Rivera", leaveType: "Sick", total: 10, used: 3, remaining: 7 },
  { id: 6, employeeId: "EMP003", name: "Robert Chen", leaveType: "Vacation", total: 20, used: 12, remaining: 8 },
];

export const overtimeLogs = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", date: "2026-04-10", hours: 2.5, rate: 1.5, amount: 168.75, status: "Approved" },
  { id: 2, employeeId: "EMP002", name: "Maria Clara Rivera", date: "2026-04-09", hours: 1.5, rate: 1.5, amount: 142.50, status: "Approved" },
  { id: 3, employeeId: "EMP003", name: "Robert Chen", date: "2026-04-10", hours: 3.0, rate: 1.5, amount: 390.00, status: "Pending" },
  { id: 4, employeeId: "EMP006", name: "Emily White", date: "2026-04-08", hours: 2.0, rate: 1.5, amount: 135.00, status: "Approved" },
  { id: 5, employeeId: "EMP007", name: "James Rodriguez", date: "2026-04-11", hours: 1.0, rate: 1.5, amount: 120.00, status: "Pending" },
];

export const loans = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", type: "Salary Advance", amount: 50000, remaining: 35000, monthly: 5000, startDate: "2025-10-01", endDate: "2026-09-30", status: "Active" },
  { id: 2, employeeId: "EMP003", name: "Robert Chen", type: "Emergency Loan", amount: 30000, remaining: 18000, monthly: 3000, startDate: "2025-08-15", endDate: "2026-08-14", status: "Active" },
  { id: 3, employeeId: "EMP004", name: "Sarah Johnson", type: "Salary Advance", amount: 20000, remaining: 0, monthly: 0, startDate: "2024-12-01", endDate: "2025-11-30", status: "Completed" },
];

export const deductions = [
  { id: 1, employeeId: "EMP001", name: "John Michael Santos", type: "SSS", amount: 1200, period: "April 2026" },
  { id: 2, employeeId: "EMP002", name: "Maria Clara Rivera", type: "PhilHealth", amount: 800, period: "April 2026" },
  { id: 3, employeeId: "EMP003", name: "Robert Chen", type: "Pag-IBIG", amount: 500, period: "April 2026" },
  { id: 4, employeeId: "EMP001", name: "John Michael Santos", type: "Loan Deduction", amount: 5000, period: "April 2026" },
  { id: 5, employeeId: "EMP003", name: "Robert Chen", type: "Loan Deduction", amount: 3000, period: "April 2026" },
];

export const payrollData = [
  { id: "PR001", period: "April 1-15, 2026", status: "Finalized", totalEmployees: 8, totalPayroll: 324000, netPay: 280000, processedDate: "2026-04-15" },
  { id: "PR002", period: "March 16-31, 2026", status: "Finalized", totalEmployees: 8, totalPayroll: 320000, netPay: 276000, processedDate: "2026-03-31" },
  { id: "PR003", period: "March 1-15, 2026", status: "Finalized", totalEmployees: 7, totalPayroll: 280000, netPay: 242000, processedDate: "2026-03-15" },
];

export const dashboardStats = {
  totalEmployees: 8,
  presentToday: 6,
  onLeave: 1,
  absent: 1,
  totalOvertime: "18.5 hrs",
  totalDeductions: "₱45,200",
  pendingApprovals: 12,
  payrollThisMonth: "₱324,000",
};

export const departments = [
  "Engineering",
  "Design",
  "Marketing",
  "Human Resources",
  "Finance",
  "Operations",
  "Sales",
];

export const positions = [
  "Senior Developer",
  "Junior Developer",
  "UI/UX Designer",
  "Marketing Manager",
  "HR Specialist",
  "Financial Analyst",
  "QA Engineer",
  "Operations Manager",
  "Sales Representative",
];

export const leaveTypes = [
  "Vacation",
  "Sick Leave",
  "Personal Leave",
  "Maternity Leave",
  "Paternity Leave",
];

export const exceptionTypes = [
  "Late Arrival",
  "Early Departure",
  "Missed Punch",
  "Overtime Violation",
  "Unapproved Leave",
];