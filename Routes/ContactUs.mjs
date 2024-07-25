import { Router } from "express";

import pool from "../Utils/Database.mjs";
import { validationCheck } from "../Utils/Middleware.mjs";

const router = Router();

router.post('/', validationCheck, async (request, response) => {
    const { body: { message } } = request;

    if (!message)
        return response.status(400).send('Enter\nmessage: <your_message>');

    try {
        let res = await pool.query('Select * from ContactUs');

        const FeedbackId = res.rowCount + 1;
        const { user: { userid, username } } = request.session;

        res = await pool.query('Insert into ContactUs values ($1, $2, $3, current_date, $4)',
            [FeedbackId, userid, username, message]
        );

        return response.status(201).send('Feedback Submitted');
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;