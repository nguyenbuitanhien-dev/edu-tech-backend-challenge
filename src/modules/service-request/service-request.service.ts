import { prisma } from '../../config/prisma';
import { ServiceRequestStatus } from '../../constants/status';

export class ServiceRequestService {
  static async createRequest(data: {
    serviceName: string;
    contactInfo: string;
    customerId?: string;
  }) {
    return prisma.serviceRequest.create({
      data: {
        serviceName: data.serviceName,
        contactInfo: data.contactInfo,
        customerId: data.customerId || null,
        status: ServiceRequestStatus.NEW,
      },
      include: {
        customer: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  static async getRequests(customerId?: string) {
    const whereCondition = customerId ? { customerId } : {};

    return prisma.serviceRequest.findMany({
      where: whereCondition,
      include: {
        customer: { select: { id: true, fullName: true, email: true } },
        staff: { select: { id: true, fullName: true, email: true } },
        logs: {
          include: { changedBy: { select: { id: true, fullName: true, role: true } } },
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateStatus(
    requestId: string,
    newStatus: ServiceRequestStatus,
    changedById: string,
    staffId?: string,
    responseNote?: string
  ) {
    const existing = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      throw new Error('Yêu cầu dịch vụ không tồn tại.');
    }

    const oldStatus = existing.status;

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        ...(staffId && { staffId }),
      },
    });

    await prisma.serviceRequestLog.create({
      data: {
        serviceRequestId: requestId,
        oldStatus: oldStatus,
        newStatus: newStatus,
        changedById: changedById,
      },
    });

    return updated;
  }

  static async getLogs(requestId: string) {
    return prisma.serviceRequestLog.findMany({
      where: { serviceRequestId: requestId },
      include: {
        changedBy: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { changedAt: 'asc' },
    });
  }

  static async submitRating(requestId: string, rating: number, feedbackComment?: string) {
    const existing = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      throw new Error('Yêu cầu dịch vụ không tồn tại.');
    }

    if (existing.status !== ServiceRequestStatus.DONE) {
      throw new Error('Chỉ có thể gửi đánh giá cho dịch vụ đã hoàn thành (DONE).');
    }

    return prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        rating,
        feedbackComment: feedbackComment || null,
      },
    });
  }
}
