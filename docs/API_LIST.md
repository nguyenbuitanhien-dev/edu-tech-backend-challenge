# DANH SÁCH ENDPOINT API (API SPECIFICATION LIST)

Hệ thống cung cấp danh sách hơn 12 endpoints RESTful được đồng bộ 100% với sơ đồ ERD tối ưu.

---

## 1. Auth API (Xác thực & Phân quyền)

### 1.1 `POST /api/auth/register`
- **Mô tả**: Đăng ký tài khoản mới (Học viên hoặc Khách hàng).
- **Access**: Public
- **Request Body**:
  ```json
  {
    "full_name": "Nguyễn Văn A",
    "email": "studenta@example.com",
    "phone": "0987654321",
    "password": "Password123!",
    "role": "STUDENT"
  }
  ```
- **Response Status**: `201 Created`

### 1.2 `POST /api/auth/login`
- **Mô tả**: Đăng nhập lấy Token xác thực JWT.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "studenta@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` (Trả về `access_token` và thông tin User).

---

## 2. Courses & Classes API (Quản lý Khóa học & Lớp học)

### 2.1 `POST /api/courses`
- **Mô tả**: Tạo mới khóa học tổng quát.
- **Access**: `MANAGER`, `STAFF`
- **Request Body**:
  ```json
  {
    "course_code": "MATH12_FULL",
    "name": "Khóa Ôn Thi THPT Quốc Gia Môn Toán",
    "description": "Luyện thi đại học môn Toán 12 trọn gói 3 tháng",
    "payment_type": "FULL_COURSE",
    "book_set": "Kết nối tri thức"
  }
  ```
- **Response Status**: `201 Created`

### 2.2 `GET /api/courses`
- **Mô tả**: Lấy danh sách khóa học.
- **Access**: Public / Authenticated

### 2.3 `POST /api/classes`
- **Mô tả**: Khai giảng lớp học mới từ Khóa học.
- **Access**: `MANAGER`, `STAFF`
- **Request Body**:
  ```json
  {
    "course_id": "uuid-course-123",
    "class_code": "MATH12_T24",
    "teacher_id": "uuid-teacher-456",
    "staff_id": "uuid-staff-789",
    "capacity": 30,
    "google_meet_link": "https://meet.google.com/abc-defg-hij",
    "start_date": "2026-09-01",
    "end_date": "2026-11-30"
  }
  ```
- **Response Status**: `201 Created`

### 2.4 `GET /api/classes/:id`
- **Mô tả**: Chi tiết lớp học. Tự động ẩn `google_meet_link` nếu học viên yêu cầu có `access_locked = true` (do thanh toán `OVERDUE`).
- **Access**: Authenticated (`STUDENT`, `TEACHER`, `STAFF`, `MANAGER`)

---

## 3. Enrollments API (Quy trình Đăng ký & Theo dõi)

### 3.1 `POST /api/enrollments`
- **Mô tả**: Học viên đăng ký lớp học (Khởi tạo trạng thái `REGISTERED`).
- **Access**: `STUDENT`, `STAFF`
- **Request Body**:
  ```json
  {
    "class_id": "uuid-class-123"
  }
  ```
- **Response Status**: `201 Created` (Trả về thông tin Enrollment & danh sách Payment khởi tạo).

### 3.2 `PATCH /api/enrollments/:id/status`
- **Mô tả**: Nhân viên/Quản lý cập nhật tiến trình đăng ký (`REGISTERED` → `CONSULTED` → `PAID` → `FINISHED`).
- **Access**: `STAFF`, `MANAGER`
- **Request Body**:
  ```json
  {
    "status": "CONSULTED"
  }
  ```

### 3.3 `GET /api/students/my-enrollments`
- **Mô tả**: Học viên xem các lớp đã đăng ký, trạng thái thanh toán, điểm danh và link Google Meet (nếu chưa bị khóa).
- **Access**: `STUDENT`

---

## 4. Payments API (Thanh toán & Kiểm tra Quá hạn)

### 4.1 `POST /api/payments/:id/pay`
- **Mô tả**: Thực hiện thanh toán đợt học phí. Chuyển trạng thái `PAYMENT.status` thành `PAID` và tự động mở lại quyền truy cập link học (`access_locked = false`) nếu đã thanh toán hết nợ quá hạn.
- **Access**: `STUDENT`, `STAFF`, `MANAGER`
- **Request Body**:
  ```json
  {
    "paid_date": "2026-09-05"
  }
  ```

### 4.2 `POST /api/payments/check-overdue`
- **Mô tả**: Quét tự động các đợt thanh toán có `due_date < Today` và `status == PENDING`, chuyển thành `OVERDUE` và đặt `ENROLLMENT.access_locked = true`.
- **Access**: `MANAGER`, `SYSTEM`

---

## 5. Service Requests API (Dịch vụ Công nghệ & Log)

### 5.1 `POST /api/service-requests`
- **Mô tả**: Khách hàng (đã đăng nhập hoặc vãng lai) gửi yêu cầu dịch vụ / thông tin liên hệ.
- **Access**: Public / Authenticated
- **Request Body**:
  ```json
  {
    "service_name": "Thiết kế Website E-learning",
    "contact_info": "Trần Văn B - email: b@example.com - SĐT: 0912345678"
  }
  ```

### 5.2 `PATCH /api/service-requests/:id/status`
- **Mô tả**: Nhân viên chuyển trạng thái (`NEW` → `IN_PROGRESS` → `DONE` / `CANCELED`), tự động ghi nhận nhật ký vào `SERVICE_REQUEST_LOG` (lưu `old_status`, `new_status`, `changed_by`, `changed_at`).
- **Access**: `STAFF`, `MANAGER`
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS",
    "staff_id": "uuid-staff-789"
  }
  ```

### 5.3 `GET /api/service-requests/:id/logs`
- **Mô tả**: Xem lịch sử cập nhật trạng thái của dịch vụ (`SERVICE_REQUEST_LOG`).
- **Access**: `STAFF`, `MANAGER`

### 5.4 `POST /api/service-requests/:id/rating`
- **Mô tả**: Khách hàng đánh giá dịch vụ (`rating` 1..5 sao và `feedback_comment`).
- **Access**: Authenticated (`CUSTOMER` / `STUDENT`)
- **Request Body**:
  ```json
  {
    "rating": 5,
    "feedback_comment": "Rất hài lòng với tốc độ tư vấn và hỗ trợ kỹ thuật."
  }
  ```
