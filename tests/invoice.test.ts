import { describe, it, expect } from '@jest/globals';
import { calcInvoice } from '../src/modules/enrollment/invoice-calculator.service';

describe('Bài 3 — Invoice Calculator (Test Suite Chi Tiết)', () => {
  it('1. Tính học phí chính xác cho gói MONTHLY 3 tháng + Mã SAVE10 + Hủy 2 buổi', () => {
    const res = calcInvoice('MONTHLY', 1000000, 3, 'SAVE10', 2, 20000);

    expect(res).toEqual({
      subtotal: 3000000,
      discount: 300000,
      refund: 40000,
      total: 2660000,
    });
  });

  it('2. Tính học phí cho gói FULL_COURSE + Mã FLAT50K', () => {
    const res = calcInvoice('FULL_COURSE', 2500000, 1, 'FLAT50K', 0, 0);

    expect(res).toEqual({
      subtotal: 2500000,
      discount: 50000,
      refund: 0,
      total: 2450000,
    });
  });

  it('3. Không dùng mã giảm giá (promoCode = null)', () => {
    const res = calcInvoice('MONTHLY', 1000000, 2, null, 0, 0);

    expect(res).toEqual({
      subtotal: 2000000,
      discount: 0,
      refund: 0,
      total: 2000000,
    });
  });

  it('4. Clamp discount không vượt quá subtotal (FLAT50K khi subtotal < 50k)', () => {
    const res = calcInvoice('FULL_COURSE', 30000, 1, 'FLAT50K', 0, 0);

    expect(res.subtotal).toBe(30000);
    expect(res.discount).toBe(30000); // Clamp discount <= subtotal
    expect(res.total).toBe(0);
  });

  it('5. Clamp total không bao giờ âm (khi tiền hoàn lớn hơn số tiền còn lại)', () => {
    const res = calcInvoice('FULL_COURSE', 100000, 1, 'FLAT50K', 2, 50000);

    expect(res.subtotal).toBe(100000);
    expect(res.discount).toBe(50000);
    expect(res.refund).toBe(100000);
    expect(res.total).toBe(0); // clamp total >= 0
  });

  // --- VALIDATION ERROR TESTS ---

  it('6. Bắt lỗi khi MONTHLY có months ngoài 1..3 (months = 5)', () => {
    expect(() => {
      calcInvoice('MONTHLY', 1000000, 5, 'SAVE10');
    }).toThrow('Với gói MONTHLY, months ngoài 1..3 là không hợp lệ');
  });

  it('7. Bắt lỗi khi MONTHLY có months = 0', () => {
    expect(() => {
      calcInvoice('MONTHLY', 1000000, 0, 'SAVE10');
    }).toThrow('Với gói MONTHLY, months ngoài 1..3 là không hợp lệ');
  });

  it('8. Bắt lỗi khi basePrice < 0', () => {
    expect(() => {
      calcInvoice('MONTHLY', -100000, 2);
    }).toThrow('basePrice không được nhỏ hơn 0');
  });

  it('9. Bắt lỗi khi canceledClasses < 0', () => {
    expect(() => {
      calcInvoice('MONTHLY', 1000000, 2, 'SAVE10', -1, 50000);
    }).toThrow('canceledClasses không được nhỏ hơn 0');
  });

  it('10. Bắt lỗi khi refundPerClass < 0', () => {
    expect(() => {
      calcInvoice('MONTHLY', 1000000, 2, 'SAVE10', 1, -50000);
    }).toThrow('refundPerClass không được nhỏ hơn 0');
  });

  it('11. Bắt lỗi khi promoCode không thuộc SAVE10 / FLAT50K / null', () => {
    expect(() => {
      calcInvoice('MONTHLY', 1000000, 2, 'INVALID_CODE' as any);
    }).toThrow('promoCode không hợp lệ');
  });
});
