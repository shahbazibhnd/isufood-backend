
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sample endpoint for order submission
app.post('/order', (req, res) => {
  const { user_id, items, total } = req.body;
  if (!user_id || !items || !total) {
    return res.status(400).json({ error: 'اطلاعات ناقص است' });
  }
  console.log('سفارش جدید دریافت شد:', req.body);
  return res.status(200).json({ success: true });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
