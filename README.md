# EDUCATION & TECH SERVICE MANAGEMENT SYSTEM (BACKEND API)

Hệ thống Backend API cho Nền tảng Đào tạo Khóa học Online và Quản lý Dịch vụ Công nghệ.

---

## 1. Tech Stack (Công Nghệ Sử Dụng)

- **Language & Runtime**: Node.js (v20+) + TypeScript.
- **Web Framework**: Express.js (Layered & Modular Clean Architecture).
- **Database & ORM**: PostgreSQL 16 (khởi chạy qua Docker Compose) kết hợp Prisma ORM.
- **Validation**: Zod (Type-safe Schema Validation).
- **Date & Timezone**: `dayjs` (kết nối plugin `utc`, `timezone`, `customParseFormat`).
- **Testing**: Jest + Supertest (Automated Unit & Integration Tests).

---

## 2. Múi Giờ & Quy Tắc Kỳ Nghỉ (Timezone & Holiday Rules)

1. **Múi Giờ Hệ Thống (Timezone)**:
   - **Thống nhất tuyệt đối**: `Asia/Ho_Chi_Minh` (GMT+7).
   - **Định dạng Ngày Input / Output**: `YYYY-MM-DD` (Ví dụ: `"2026-01-01"`).
   - Tất cả phép tính toán quét ngày học đều được chuẩn hóa theo múi giờ `Asia/Ho_Chi_Minh` tại `src/config/timezone.ts` và `src/utils/date.ts`.

2. **Quy Tắc Kỳ Nghỉ Dài (`holidayRanges`)**:
   - **TÍNH INCLUSIVE HAI ĐẦU**: Kỳ nghỉ `[start, end]` bao gồm **CẢ ngày bắt đầu và ngày kết thúc**.
   - *Ví dụ*: `holidayRanges: [["2026-01-26", "2026-02-05"]]` nghĩa là tất cả các ngày từ `2026-01-26` đến hết ngày `2026-02-05` đều được tính là ngày nghỉ và sẽ bị loại trừ khi sinh lịch học.

---

## ⚡ 3. Cách Chạy Dự Án Local (Local Setup)

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Bật CSDL PostgreSQL qua Docker (Tùy chọn)
```bash
docker compose up -d
```

### Bước 3: Khởi tạo Database & Dữ liệu mẫu
```bash
npx prisma db push
npx ts-node prisma/seed.ts
```

### Bước 4: Khởi chạy Server
```bash
# Khởi chạy chế độ Development (Auto reload):
npm run dev

# Hoặc khởi chạy chế độ Production (Build TypeScript):
npm run build
npm start
```
👉 Server sẽ lắng nghe tại: `http://localhost:3000`

### Bước 5: Chạy bộ kiểm thử tự động (Unit & Integration Tests)
```bash
npm test
```

---

## 4. Hướng Dẫn Chạy Postman Collection (`docs/postman_collection.json`)

Toàn bộ các request kiểm thử từ **Bài 2, Bài 3 đến PHẦN C — MINI REST API** đã được lưu sẵn trong file **[`docs/postman_collection.json`](docs/postman_collection.json)**.

### Cách Import & Kiểm thử 1-Click trên Postman:
1. Mở ứng dụng **Postman**.
2. Chọn nút **Import** (ở góc trên cùng bên trái) ➔ Chọn file [`docs/postman_collection.json`](docs/postman_collection.json).
3. Collection sẽ hiển thị đầy đủ 2 thư mục chính:

#### 🔹 Thư mục `BÀI 2 & BÀI 3 (Algorithm APIs)`:
- `Bài 2 - POST /schedule/generate (200 OK)`: Sinh 16 buổi học & ngày bế giảng.
- `Bài 2 - POST /schedule/generate (Lỗi 400)`: Kiểm thử bắt lỗi thiếu `startDate`.
- `Bài 3 - POST /invoice/calc (200 OK)`: Tính subtotal, discount SAVE10, refund & total.
- `Bài 3 - POST /invoice/calc (Lỗi 400)`: Kiểm thử bắt lỗi `months = 5` (>3).

#### 🔹 Thư mục `PHẦN C - MINI REST API`:
- `1. Auth - Đăng nhập Staff lấy Token`: `POST /api/auth/login` với email `staff@example.com` / pass `Password123!`.
- `2. Auth - Đăng nhập Student lấy Token`: `POST /api/auth/login` với email `student@example.com` / pass `Password123!`.
- `3. Education - Danh sách Khóa học`: `GET /api/courses`.
- `4. Education - Chi tiết Lớp học`: `GET /api/classes/:id` (Tự động ẩn link Meet nếu quá hạn).
- `5. Enrollment - Xem lớp học của học viên`: `GET /api/students/my-enrollments`.
- `6. Payment - Quét nợ quá hạn`: `POST /api/payments/check-overdue` (Tự động khóa link Meet).
- `7. Payment - Thanh toán hóa đơn`: `POST /api/payments/:id/pay` (Mở lại link Meet).
- `8. Tech Service - Đặt dịch vụ công nghệ`: `POST /api/service-requests`.
- `9. Tech Service - Đổi trạng thái & Lưu Audit Log`: `PATCH /api/service-requests/:id/status`.
- `10. Tech Service - Xem nhật ký Audit Log`: `GET /api/service-requests/:id/logs`.

---

## 5. Mô Tả Kiến Trúc Thư Mục (Clean Architecture)

Dự án áp dụng kiến trúc **Clean Architecture / Layered Architecture** phân tách lớp rõ ràng:

```text
backend/
├── docs/                                 # THƯ MỤC TÀI LIỆU (PHẦN A - THIẾT KẾ)
│   ├── ERD.md                            # Bản vẽ ERD (Mermaid) & Mô tả kiến trúc
│   ├── API_LIST.md                       # Danh sách >12 Endpoints API RESTful
│   └── postman_collection.json           # File Postman collection test 1-click
│
├── prisma/                               # DỮ LIỆU & ORM
│   ├── schema.prisma                     # Định nghĩa Models PostgreSQL & Enums
│   └── seed.ts                           # Script nạp dữ liệu mẫu
│
├── src/                                  # MÃ NGUỒN CHÍNH (SOURCE CODE)
│   ├── config/                           # Config Múi giờ Asia/Ho_Chi_Minh & Prisma Client
│   ├── constants/                        # Hằng số Roles & Status Enums
│   ├── utils/                            # UTILS: Helper xử lý Date YYYY-MM-DD & JSON Response
│   ├── middlewares/                      # MIDDLEWARES: Validation Zod 400 & Error handler 500
│   │
│   ├── modules/                          # CÁC MODULE NGHIỆP VỤ (FEATURE MODULES)
│   │   ├── education/                    # Module BÀI 2: Schedule Generator, Courses, Classes
│   │   │   ├── schedule.service.ts       # Service Business logic Bài 2
│   │   │   ├── education.schema.ts       # Zod Schema Validators Bài 2
│   │   │   ├── education.controller.ts   # Controller HTTP Handler
│   │   │   └── education.routes.ts       # Routes Router Express
│   │   │
│   │   ├── enrollment/                   # Module BÀI 3: Invoice Calculator, Payments
│   │   │   ├── invoice-calculator.service.ts # Service Business logic Bài 3
│   │   │   ├── enrollment.schema.ts      # Zod Schema Validators Bài 3
│   │   │   ├── enrollment.controller.ts  # Controller HTTP Handler
│   │   │   └── enrollment.routes.ts      # Routes Router Express
│   │   │
│   │   ├── auth/                         # Module Đăng ký / Đăng nhập JWT
│   │   └── service-request/              # Module Dịch vụ Công nghệ & Log Audit
│   │
│   ├── app.ts                            # Khởi tạo Express App & Gắn Routes
│   └── server.ts                         # Entry point chạy HTTP Server
│
└── tests/                                # BỘ AUTOMATED TESTS (JEST)
    ├── schedule.test.ts                  # Unit test cho Bài 2 (8 test cases)
    ├── invoice.test.ts                   # Unit test cho Bài 3 (11 test cases)
    ├── http_spec.test.ts                 # Integration test HTTP 200, 400 & 500
    └── server.test.ts                    # Test health check server
```

---

## 6. Ví Dụ cURL Cho 2 Endpoints Chính

### 6.1 Ví dụ cURL Bài 2: Sinh Lịch Học & Ngày Bế Giảng (`POST /schedule/generate`)

```bash
curl -X POST http://localhost:3000/schedule/generate \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-01-01",
    "totalClasses": 16,
    "classWeekdays": [1, 3],
    "holidays": ["2026-04-30", "2026-05-01"],
    "holidayRanges": [["2026-01-26", "2026-02-05"]]
  }'
```

**Response Output `200 OK`**:
```json
{
  "endDate": "2026-03-10",
  "fullSchedule": [
    "2026-01-01",
    "2026-01-06",
    "2026-01-08",
    "2026-01-13",
    "2026-01-15",
    "2026-01-20",
    "2026-01-22",
    "2026-02-10",
    "2026-02-12",
    "2026-02-17",
    "2026-02-19",
    "2026-02-24",
    "2026-02-26",
    "2026-03-03",
    "2026-03-05",
    "2026-03-10"
  ]
}
```

---

### 6.2 Ví dụ cURL Bài 3: Tính Học Phí & Hóa Đơn (`POST /invoice/calc`)

```bash
curl -X POST http://localhost:3000/invoice/calc \
  -H "Content-Type: application/json" \
  -d '{
    "courseType": "MONTHLY",
    "basePrice": 1500000,
    "months": 2,
    "promoCode": "SAVE10",
    "canceledClasses": 1,
    "refundPerClass": 40000
  }'
```

**Response Output `200 OK`**:
```json
{
  "subtotal": 3000000,
  "discount": 300000,
  "refund": 40000,
  "total": 2660000
}
```
