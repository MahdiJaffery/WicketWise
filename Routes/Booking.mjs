import { Router } from "express";
import { validationCheck } from "../Utils/Middleware.mjs";
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
    }
})

export default router;