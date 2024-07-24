import { Router } from "express";

import { parseId, validationCheck } from "../Utils/Middleware.mjs";
import pool from "../Utils/Database.mjs";

const router = Router();

router.get('/', validationCheck, async (request, response) => {
    const { user: { userid } } = request.session;

    try {
        const query = 'Update Bookings set status = $1 where dateof::date < current_date or (dateof::date < current_date and Extract(hour from dateof) + durationinhours <= Extract(hour from current_time))';
        let res = pool.query(query, ['Invalid']);

        res = await pool.query('Select * from Bookings where UserId = $1 and status = $2', [userid, 'Valid']);

        return response.status(200).send({ message: 'Current Bookings', data: res.rows });
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.post('/makeBooking', validationCheck, async (request, response) => {
    const { session: { user: { userid } }, body: { ground, duration, date } } = request;
    let groundId = 0, bookingId = 0;

    if (!(ground && duration && date))
        return response.status(400).send('Enter \nGround: <Ground Name>, \nDuration: <Hours>,\nDate: <Year-Month-Day Time>');

    try {
        let res = await pool.query('Select GroundId from Grounds where name = $1', [ground]);

        groundId = res.rows[0].groundid;

        if (groundId === 0)
            return response.status(404).send('Ground Not Found');

        res = await pool.query('Select * from Bookings');

        bookingId = res.rowCount + 1;

        res = await pool.query('Insert into Bookings values ($1, $2, $3, $4, $5, $6)', [bookingId, userid, groundId, duration, date, 'Valid']);

        return response.status(201).send({ message: 'Booking Successful', BookingID: { bookingId } });
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.delete('/remove/:id', validationCheck, parseId, async (request, response) => {
    const { parsedId } = request;
    console.log(parsedId);
    try {
        let res = await pool.query('Select * from Bookings where bookingid = $1 and status = $2', [parsedId, 'Valid']);

        if (res.rowCount === 0) return response.status(404).send('Booking Not Found');

        res = await pool.query('Update Bookings set status = $1 where bookingid =  $2', ['Invalid', parsedId]);

        return response.status(200).send('Booking Nullified :(');
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;