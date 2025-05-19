const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// استفاده از میانی‌ها
app.use(cors());
app.use(express.json());

// مسیر تست برای '/'
app.get('/', (req, res) => {
  res.send('سرور ایزو فود با موفقیت اجرا شده ✅');
});

// مثال مسیر API
app.post('/order', (req, res) => {
  const data = req.body;
  console.log('سفارش جدید:', data);
  res.status(201).json({ message: 'سفارش با موفقیت دریافت شد' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
