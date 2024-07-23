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

app.post('/api/auth', async (request, response) => {
    const { body: { username, password } } = request;

    try {
        const res = await pool.query('Select * from Users where username = $1', [username]);

        if (res.rowCount === 0)
            return response.status(401).send('Invalid Username');
        if (res.rows[0].password !== password)
            return response.status(401).send('Incorrect Password');

        const User = res.rows[0];

        request.session.user = User;
        response.cookie('Cricket', 'Wicket', { maxAge: 60000 * 10 });
        return response.status(200).send(User);
    } catch (err) {
        console.log(err.message);
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on PORT : ${PORT}`);
})