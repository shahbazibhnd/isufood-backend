const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// مقادیر از .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// ایجاد کلاینت Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// نمایش فایل‌های استاتیک از پوشه public
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// تست ساده
app.get('/', (req, res) => {
  res.send('سرور ایزو فود با Supabase اجرا شد ✅');
});

// ثبت سفارش جدید
app.post('/order', async (req, res) => {
  const { user_id, items, total } = req.body;

  const { data, error } = await supabase
    .from('orders')
    .insert([{ user_id, items, total }]);

  if (error) {
    console.error('❌ خطا در ذخیره سفارش:', error);
    return res.status(500).json({ error: 'خطا در ثبت سفارش' });
  }

  res.status(201).json({ message: 'سفارش با موفقیت ثبت شد', data });
});

// همه مسیرهای دیگر به index.html ختم شوند (برای SPAها مفید است)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// اجرای سرور
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
