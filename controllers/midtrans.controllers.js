const Midtrans = require('midtrans-client');
const otpGenerator = require('otp-generator');

let snap = new Midtrans.Snap({
    isProduction: false, 
    serverKey: 'SB-Mid-server-wccXGCg-eO5XHjfA2Wog6Zoz'
});

module.exports = {
    Midtrans: async (req, res) => {
        const { Regular_Ticket, VIP_Ticket, VVIP_Ticket, Fees, gross_amount } = req.body;

       
        if (Regular_Ticket == null || VIP_Ticket == null || VVIP_Ticket == null || Fees == null || gross_amount == null) {
            return res.status(400).json({ error: 'Invalid input values' });
        }

        let parameter = {
            "transaction_details": {
                "order_id": otpGenerator.generate(8), 
                "gross_amount": gross_amount
            },
            "credit_card": {
                "secure": true
            }
        };

        try {
            const transaction = await snap.createTransaction(parameter);
            let transactionToken = transaction.token;
            console.log('Transaction Token:', transactionToken);
            res.json({ transactionToken });
        } catch (error) {
            console.error('Error creating transaction:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};