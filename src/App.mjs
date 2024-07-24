import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import pool from '../Utils/Database.mjs';
import routeBookings from '../Routes/Booking.mjs'

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

app.use('/api/bookings', routeBookings);

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

app.post('/api/auth/register', async (request, response) => {
    let { body: { username, password } } = request;

    try {
        let Unique = false, modification = false;
        do {
            const res = await pool.query('Select * from Users where username = $1', [username]);

            if (res.rowCount === 0)
                Unique = true;
            else {
                const randomNumber = Math.floor(Math.random() * 100);
                username += randomNumber;
                modification = true;
            }
        } while (!Unique)

        if (modification)
            return response.status(400).send(`Username already Taken\nTry ${username}`);

        let res = await pool.query('Select * from Users');

        const UserId = res.rowCount + 1;

        res = await pool.query('Insert into Users (UserId, username, password) values ($1, $2, $3)',
            [UserId, username, password]
        );

        const User = { UserId, username, password };

        request.session.user = User;
        response.cookie('Cricket', 'Wicket', { maxAge: 6000 * 10 });
        return response.status(201).send(User);
    } catch (err) {
        console.log(err.message);
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on PORT : ${PORT}`);
})