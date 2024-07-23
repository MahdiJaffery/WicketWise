import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import pool from '../Utils/Database.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'Wicket',
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 10
    }
}))

app.listen(PORT, () => {
    console.log(`Server listening on PORT : ${PORT}`);
})