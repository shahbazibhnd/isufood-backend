// server.js
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err.stack);
});

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role)
    return res.status(400).json({ error: 'اطلاعات ناقص' });

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('role', role);

  if (existing.length > 0)
    return res.status(400).json({ error: 'کاربر تکراری' });

  const { error } = await supabase
    .from('users')
    .insert([{ username, password, role }]);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: 'ثبت‌نام موفق' });
});

app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .eq('role', role);

  if (error) return res.status(500).json({ error: error.message });
  if (data.length === 0)
    return res.status(400).json({ error: 'نام کاربری یا رمز اشتباه است' });

  await supabase.from('login_logs').insert([{
    username,
    role,
    action: 'login',
    time: new Date()
  }]);

  res.json({ user: data[0] });
});

app.post('/api/order', upload.single('receipt'), async (req, res) => {
  const { user, foodDesc, address } = req.body;
  const file = req.file;

  if (!user || !foodDesc || !address || !file)
    return res.status(400).json({ error: 'اطلاعات ناقص' });

  const ext = file.originalname.split('.').pop();
  const fileName = `receipt-${uuidv4()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) return res.status(500).json({ error: 'خطا در آپلود رسید' });

  const receiptUrl = `${process.env.SUPABASE_URL.replace('.co', '')}.co/storage/v1/object/public/receipts/${fileName}`;

  const { error: insertError } = await supabase.from('orders').insert([{
    user,
    foodDesc,
    address,
    status: 'paid',
    receipt_url: receiptUrl,
    created_at: new Date(),
  }]);

  if (insertError) return res.status(500).json({ error: insertError.message });

  res.json({ message: 'سفارش ثبت شد' });
});

app.get('/api/orders', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.patch('/api/order/:id/confirm', async (req, res) => {
  const id = req.params.id;

  const { error } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: 'وضعیت پرداخت تایید شد' });
});

app.patch('/api/order/:id/accept', async (req, res) => {
  const id = req.params.id;
  const { courier } = req.body;

  if (!courier)
    return res.status(400).json({ error: 'نام پیک ارسال نشده' });

  const { error } = await supabase
    .from('orders')
    .update({ status: 'accepted', courier })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: 'سفارش توسط پیک تایید شد' });
});

app.get('/api/export', async (req, res) => {
  const [users, orders, logs] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('orders').select('*'),
    supabase.from('login_logs').select('*'),
  ]);

  res.json({
    users: users.data,
    orders: orders.data,
    login_logs: logs.data,
  });
});



app.post('/api/save-all-data', async (req, res) => {
  const allData = req.body;
  // اگر شناسه کاربر داری از هدر یا توکن بگیری، مثلا:
  // const userId = req.headers['x-user-id'] || null;

  try {
    const { error } = await supabase
      .from('local_storage_data')
      .insert([{ 
        user_id: allData.username || 'ناشناس',
        data: allData
      }]);

    if (error) throw error;

    res.json({ success: true, message: 'داده‌ها ذخیره شدند' });
  } catch (err) {
    console.error('خطا در ذخیره داده‌ها:', err.message);
    res.status(500).json({ error: 'خطا در ذخیره داده‌ها' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
