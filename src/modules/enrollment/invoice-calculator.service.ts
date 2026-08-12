export type CourseType = 'MONTHLY' | 'FULL_COURSE';
export type PromoCode = 'SAVE10' | 'FLAT50K' | null | undefined;

export interface InvoiceCalculationResult {
  subtotal: number;
  discount: number;
  refund: number;
  total: number;
}

export function calcInvoice(
  courseType: CourseType,
  basePrice: number,
  months?: number,
  promoCode?: PromoCode,
  canceledClasses: number = 0,
  refundPerClass: number = 0
): InvoiceCalculationResult {
  if (courseType !== 'MONTHLY' && courseType !== 'FULL_COURSE') {
    throw new Error(`Lỗi validation: courseType không hợp lệ. Chỉ chấp nhận 'MONTHLY' hoặc 'FULL_COURSE'. Nhận được: '${courseType}'`);
  }

  if (typeof basePrice !== 'number' || Number.isNaN(basePrice) || basePrice < 0) {
    throw new Error('Lỗi validation: basePrice không được nhỏ hơn 0');
  }

  if (typeof canceledClasses !== 'number' || Number.isNaN(canceledClasses) || canceledClasses < 0) {
    throw new Error('Lỗi validation: canceledClasses không được nhỏ hơn 0');
  }

  if (typeof refundPerClass !== 'number' || Number.isNaN(refundPerClass) || refundPerClass < 0) {
    throw new Error('Lỗi validation: refundPerClass không được nhỏ hơn 0');
  }

  let subtotal = 0;

  if (courseType === 'MONTHLY') {
    if (typeof months !== 'number' || !Number.isInteger(months) || months < 1 || months > 3) {
      throw new Error('Lỗi validation: Với gói MONTHLY, months ngoài 1..3 là không hợp lệ');
    }
    subtotal = basePrice * months;
  } else {
    subtotal = basePrice;
  }

  let rawDiscount = 0;

  if (promoCode !== null && promoCode !== undefined) {
    const code = String(promoCode).trim().toUpperCase();
    if (code === '') {
      rawDiscount = 0;
    } else if (code === 'SAVE10') {
      rawDiscount = Math.floor(0.10 * subtotal);
    } else if (code === 'FLAT50K') {
      rawDiscount = 50000;
    } else {
      throw new Error(`Lỗi validation: promoCode không hợp lệ: '${promoCode}'. Chỉ chấp nhận 'SAVE10', 'FLAT50K' hoặc null`);
    }
  }

  const discount = Math.min(rawDiscount, subtotal);
  const refund = Math.floor(canceledClasses) * refundPerClass;
  const total = Math.max(0, subtotal - discount - refund);

  return {
    subtotal,
    discount,
    refund,
    total,
  };
}
