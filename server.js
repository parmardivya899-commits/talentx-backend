const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/proposals', (req, res) => {
    console.log("Proposal received:", req.body);
    res.status(200).json({ success: true, message: 'Proposal submitted successfully!' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});