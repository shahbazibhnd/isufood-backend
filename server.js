const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// اتصال به دیتابیس لوکال (بعداً اصلاح می‌کنیم به MongoDB Atlas)
mongoose.connect('mongodb://localhost/isufood', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// مدل سفارش
const Order = mongoose.model('Order', {
  name: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
});

// دریافت سفارش از سمت کاربر
app.post('/api/orders', async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.status(200).json({ message: 'سفارش ذخیره شد' });
});

// شروع سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
