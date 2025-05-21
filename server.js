// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to register a user
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const { user, error } = await supabase.auth.signUp({ email, password });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'User registered successfully!', user });
});

// Endpoint to log in a user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { user, error } = await supabase.auth.signIn({ email, password });
    
    if (error) return res.status(401).json({ error: error.message });
    res.json({ message: 'User logged in successfully!', user });
});

// Endpoint to place an order
app.post('/order', async (req, res) => {
    const { userId, orderDetails } = req.body;
    const { data, error } = await supabase
        .from('orders')
        .insert([{ user_id: userId, details: orderDetails }]);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Order placed successfully!', order: data });
});

// Endpoint to get user orders
app.get('/orders/:userId', async (req, res) => {
    const { userId } = req.params;
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId);
    
    if (error) return res.status(404).json({ error: error.message });
    res.json({ orders: data });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
