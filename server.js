const express = require('express');
const app = express();
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());

connectDB();

app.use(express.json({extended: true}));

app.get('/', (req, res) => res.send('API Running'));

app.use('/api/user', require('./Routes/Api/user'));
app.use('/api/auth', require('./Routes/Api/auth'));
app.use('/api/posts', require('./Routes/Api/posts'));
app.use('/api/profile', require('./Routes/Api/profile'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));