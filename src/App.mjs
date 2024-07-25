import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import pool from '../Utils/Database.mjs';
import routeBookings from '../Routes/Booking.mjs'
import routeGrounds from '../Routes/Grounds.mjs'
import routeTournaments from '../Routes/Tournaments.mjs'
import routeContact from '../Routes/ContactUs.mjs'
import routeStats from '../Routes/PlayerStats.mjs'
import { ValidateDatabase } from '../Utils/Middleware.mjs';

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
app.use('/api/grounds', routeGrounds);
app.use('/api/tournaments', routeTournaments);
app.use('/api/contactus', routeContact);
app.use('/api/playerstats', routeStats);

app.post('/api/auth', ValidateDatabase, async (request, response) => {
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

app.post('/api/auth/register', ValidateDatabase, async (request, response) => {
    let { body: { username, password, displayname, type } } = request;

    if (!(username && password && displayname))
        return response.status(400).send('Enter\nusername: your_username\npassword: your_password\ndisplayname: ypur_display_name');

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

        const userid = res.rowCount + 1;

        res = await pool.query('Insert into Users (userid, displayname, username, password, type) values ($1, $2, $3, $4, $5)',
            [userid, displayname, username, password, 'Player']
        );

        if (type)
            res = await pool.query('Update Users set type = $1 where userid = $2',
                [type, userid]
            );

        res = await pool.query('Insert into PlayerStats values ($1, $2, $3, $4, $5, $6)',
            [userid, displayname, 0, 0, 0, 0]
        );

        const User = { userid, displayname, username, password };

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