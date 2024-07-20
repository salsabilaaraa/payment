const express = require('express');
const path = require('path');
const otpGenerator = require('otp-generator');
const Midtrans = require('midtrans-client');

const app = express();
const PORT = 5000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Midtrans Snap API
const snap = new Midtrans.Snap({
    isProduction: false, // Set to true if using production environment
    serverKey: 'SB-Mid-server-wccXGCg-eO5XHjfA2Wog6Zoz' // Replace with your actual server key
});

// Sample ticket data
const tickets = [
    { id: 1, name: 'Reguler Ticket', price: 120000 },
    { id: 2, name: 'VIP Ticket', price: 180000 },
    { id: 3, name: 'VVIP Ticket', price: 220000 }
];
const fees = 20000;

// Serve the EJS file for the root URL
app.get('/', (req, res) => {
    res.render('form', { 
        tickets: tickets,
        fees: fees,
        total: 0,
        clientKey: 'SB-Mid-client-jURaIXO0d2-1fKos' // Replace with your actual client key
    });
});

// Handle payment request
app.post('/pay', async (req, res) => {
    console.log('POST /pay endpoint hit');
    
    const { Regular_Ticket, VIP_Ticket, VVIP_Ticket, Fees, gross_amount } = req.body;

    // Validate the request payload
    if (typeof Regular_Ticket !== 'number' || typeof VIP_Ticket !== 'number' || typeof VVIP_Ticket !== 'number') {
        console.log('Invalid request payload');
        return res.status(400).json({ error: 'Invalid request payload' });
    }

    const parameter = {
        "transaction_details": {
            "order_id": otpGenerator.generate(10, { upperCase: false, specialChars: false }),
            "gross_amount": gross_amount
        },
        "credit_card": {
            "secure": true
        }
    };

    console.log('Payload to Midtrans:', JSON.stringify(parameter, null, 2));

    try {
        const transaction = await snap.createTransaction(parameter);
        console.log('Transaction response:', transaction);
        res.json({ transactionToken: transaction.token });
    } catch (error) {
        console.error('Error creating transaction:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error creating transaction' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
