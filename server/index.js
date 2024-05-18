if (!process.env.NODE_ENV) {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const rateLimiter = require('./common/rate-limiter');
const DBManager = require('./common/db-manager');
const router = require('./routes');
DBManager.connectToMongo().catch(() => {
});

app.use(express.json());
app.use(rateLimiter);

app.use('/', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
