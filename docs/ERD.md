## Nhận xét & Đánh giá chi tiết mô hình

### 🌟 Các Điểm Nổi Bật (Ưu điểm)
1. **`SERVICE_REQUEST_LOG`**: Thêm bảng audit log theo dõi lịch sử chuyển trạng thái (`old_status` -> `new_status`), người thay đổi (`changed_by`), thời gian (`changed_at`) là một điểm cộng chuẩn Senior cho việc truy vết nghiệp vụ.
2. **`month_index` trong `PAYMENT`**: Thiết kế cực kỳ thông minh để quản lý số tháng đóng tiền (`1`, `2`, `3` cho `MONTHLY` và `null` cho `FULL_COURSE`).
3. **Phân tách `COURSE` & `CLASS`**: `payment_type` nằm ở `COURSE` giúp định nghĩa quy định thanh toán theo khung khóa học.
4. **Vòng đời trạng thái rõ ràng**:
   - `ENROLLMENT.status`: `REGISTERED` → `CONSULTED` → `PAID` → `FINISHED`.
   - `PAYMENT.status`: `PENDING` → `PAID` → `OVERDUE`.
   - `SERVICE_REQUEST.status`: `NEW` → `IN_PROGRESS` → `DONE` → `CANCELED`.

### 💡 Các điểm bổ sung để hoàn thiện 100%
1. **`USER.password_hash` & `USER.is_active`**: Cần thiết cho API Auth JWT và quản lý vô hiệu hóa tài khoản.
2. **`ENROLLMENT.access_locked`**: Thêm cờ khóa truy cập để phục vụ logic tự động ẩn link Google Meet khi `PAYMENT` chuyển sang `OVERDUE`.
3. **`SERVICE_REQUEST.customer_id` dạng `Nullable`**: Đáp ứng trường hợp khách vãng lai chưa tạo tài khoản vẫn gửi được yêu cầu tư vấn qua `contact_info`.
