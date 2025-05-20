const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.static('public'));

// تست اتصال
app.get('/', (req, res) => {
  res.send('سرور ISUFood با Supabase اجرا شد ✅');
});

// ثبت سفارش غذا
app.post('/order', async (req, res) => {
  const { user_id, items, total } = req.body;
  if (!user_id || !items || !total) {
    return res.status(400).json({ error: 'اطلاعات ناقص است' });
  }
  const { data, error } = await supabase.from('orders').insert([{ user_id, items, total }]);
  if (error) return res.status(500).json({ error: 'خطا در ثبت سفارش' });
  res.status(201).json({ message: 'سفارش ثبت شد ✅', data });
});

// گرفتن لیست سفارشات
app.get('/orders', async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) return res.status(500).json({ error: 'خطا در دریافت سفارش‌ها' });
  res.json(data);
});

// مسیر SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));