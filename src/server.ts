import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🌏 Múi giờ hệ thống: Asia/Ho_Chi_Minh`);
  console.log(`==================================================`);
});
