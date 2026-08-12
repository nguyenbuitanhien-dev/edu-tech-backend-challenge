export enum PaymentType {
  MONTHLY = 'MONTHLY',
  FULL_COURSE = 'FULL_COURSE',
}

export enum EnrollmentStatus {
  REGISTERED = 'REGISTERED',
  CONSULTED = 'CONSULTED',
  PAID = 'PAID',
  FINISHED = 'FINISHED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

export enum ServiceRequestStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
}
