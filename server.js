const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// اتصال به Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ارائه فایل‌های استاتیک از public/
app.use(express.static('public'));

// روت تست سرور
app.get('/', (req, res) => {
  res.send('سرور ISUFood با Supabase اجرا شد ✅');
});

// روت ثبت سفارش
app.post('/order', async (req, res) => {
  const { user_id, items, total } = req.body;

  if (!user_id || !items || !total) {
    return res.status(400).json({ error: 'اطلاعات ناقص است' });
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([{ user_id, items, total }]);

  if (error) {
    console.error('❌ خطای Supabase هنگام ثبت سفارش:', error);
    return res.status(500).json({
      error: 'خطا در ثبت سفارش',
      details: error.message,
      hint: error.hint,
    });
  }

  res.status(201).json({ message: 'سفارش ثبت شد ✅', data });
});

// روت دریافت همه سفارش‌ها
app.get('/orders', async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*');

  if (error) {
    console.error('❌ خطا در دریافت سفارش‌ها:', error);
    return res.status(500).json({ error: 'خطا در دریافت سفارش‌ها', details: error.message });
  }

  res.json(data);
});

// روت تست اتصال Supabase
app.post('/test-supabase', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ user_id: 1, items: 'تست', total: 1000 }]);

  if (error) {
    console.error('❌ خطای تست اتصال Supabase:', error);
    return res.status(500).json({
      error: error.message,
      details: error.details,
      hint: error.hint,
    });
  }

  res.json({ message: 'اتصال موفق به Supabase ✅', data });
});

// پشتیبانی از SPA با مسیر wildcard
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// شروع سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

if (error) {
  console.error('❌ Supabase insert error:', error);
  return res.status(500).json({ error: error.message, details: error.details });
}
