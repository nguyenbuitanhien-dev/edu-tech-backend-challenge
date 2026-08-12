import { describe, it, expect } from '@jest/globals';
import { generateSchedule } from '../src/modules/education/schedule.service';

describe('Bài 2 — Schedule Generator & Ngày bế giảng (Test Suite Chi Tiết)', () => {
  it('1. Tính lịch học chính xác cho 16 buổi (Thứ 3 & Thứ 5), loại trừ ngày lễ và kỳ nghỉ Tết dài', () => {
    const input = {
      startDate: '2026-01-01', // Thứ 5 (Quy ước: 3)
      totalClasses: 16,
      classWeekdays: [1, 3], // Thứ 3 (1) & Thứ 5 (3)
      holidays: ['2026-04-30', '2026-05-01'],
      holidayRanges: [['2026-01-26', '2026-02-05']] as Array<[string, string]>, // Kỳ nghỉ Tết
    };

    const result = generateSchedule(input);

    expect(result).toHaveProperty('endDate');
    expect(result).toHaveProperty('fullSchedule');
    expect(result.fullSchedule.length).toBe(16);

    // Ngày bắt đầu đúng là 2026-01-01 (Thứ 5)
    expect(result.fullSchedule[0]).toBe('2026-01-01');

    // Không có ngày nào nằm trong kỳ nghỉ Tết âm lịch [2026-01-26..2026-02-05]
    const hasTetDate = result.fullSchedule.some((date) => date >= '2026-01-26' && date <= '2026-02-05');
    expect(hasTetDate).toBe(false);

    // Ngày bế giảng endDate khớp 100% với ngày cuối cùng trong fullSchedule
    expect(result.endDate).toBe(result.fullSchedule[15]);
    expect(result.endDate).toBe('2026-03-10');
  });

  it('2. Edge Case: classWeekdays không được sort và chứa giá trị trùng lặp (vd: [3, 1, 3])', () => {
    const input = {
      startDate: '2026-01-01',
      totalClasses: 4,
      classWeekdays: [3, 1, 3], // Không sort, trùng lặp -> tự normalize thành [1, 3]
    };

    const result = generateSchedule(input);

    expect(result.fullSchedule.length).toBe(4);
    expect(result.fullSchedule).toEqual([
      '2026-01-01', // Thứ 5
      '2026-01-06', // Thứ 3
      '2026-01-08', // Thứ 5
      '2026-01-13', // Thứ 3
    ]);
  });

  it('3. Edge Case: Ngày lễ rời rạc (holidays) trùng với kỳ nghỉ dài (holidayRanges)', () => {
    const input = {
      startDate: '2026-04-28', // Thứ 3
      totalClasses: 3,
      classWeekdays: [1, 3], // Thứ 3 & Thứ 5
      holidays: ['2026-04-30'], // Trùng với holidayRange bên dưới
      holidayRanges: [['2026-04-30', '2026-05-03']] as Array<[string, string]>,
    };

    const result = generateSchedule(input);

    expect(result.fullSchedule.length).toBe(3);
    expect(result.fullSchedule[0]).toBe('2026-04-28');
    // Ngày 2026-04-30 bị nghỉ -> Nhảy sang Thứ 3 kế tiếp (2026-05-05)
    expect(result.fullSchedule[1]).toBe('2026-05-05');
    expect(result.fullSchedule[2]).toBe('2026-05-07');
    expect(result.endDate).toBe('2026-05-07');
  });

  // --- VALIDATION ERROR TESTS ---

  it('4. Bắt lỗi Validation khi totalClasses < 1 (vd: totalClasses = 0)', () => {
    expect(() => {
      generateSchedule({
        startDate: '2026-01-01',
        totalClasses: 0,
        classWeekdays: [1, 3],
      });
    }).toThrow('totalClasses phải là một số nguyên dương >= 1');
  });

  it('5. Bắt lỗi Validation khi startDate sai định dạng (vd: "01/01/2026")', () => {
    expect(() => {
      generateSchedule({
        startDate: '01/01/2026',
        totalClasses: 10,
        classWeekdays: [1, 3],
      });
    }).toThrow('startDate không đúng định dạng YYYY-MM-DD');
  });

  it('6. Bắt lỗi Validation khi startDate không tồn tại trong thực tế (vd: "2026-02-31")', () => {
    expect(() => {
      generateSchedule({
        startDate: '2026-02-31',
        totalClasses: 10,
        classWeekdays: [1, 3],
      });
    }).toThrow('startDate không đúng định dạng YYYY-MM-DD');
  });

  it('7. Bắt lỗi Validation khi holidayRanges có ngày bắt đầu > ngày kết thúc', () => {
    expect(() => {
      generateSchedule({
        startDate: '2026-01-01',
        totalClasses: 10,
        classWeekdays: [1, 3],
        holidayRanges: [['2026-02-05', '2026-01-26']],
      });
    }).toThrow('lớn hơn ngày kết thúc');
  });

  it('8. Bắt lỗi Validation khi classWeekdays rỗng hoặc chứa số không thuộc 0..6', () => {
    expect(() => {
      generateSchedule({
        startDate: '2026-01-01',
        totalClasses: 10,
        classWeekdays: [],
      });
    }).toThrow('classWeekdays phải là mảng các số từ 0 đến 6');
  });
});
