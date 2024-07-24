import { Router } from "express";

import { validationCheck } from "../Utils/Middleware.mjs";
import pool from "../Utils/Database.mjs";

const router = Router();

router.get('/', validationCheck, async (request, response) => {
    try {
        const res = await pool.query('Select * from Tournaments where status = $1', ['Ongoing']);

        if (!res.rowCount)
            return response.status(200).send('No Ongoing Tournaments');

        return response.status(200).send(res.rows);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.post('/create', validationCheck, async (request, response) => {
    const { body: { name, start, end } } = request;

    if (!(name && start && end))
        return response.status(400).send('Enter\nName: <Name>\nStart: <Start Date>\nEnd: <End Date>');

    try {
        let res = await pool.query('Select * from Tournaments');

        const TournamentID = res.rowCount + 1;

        res = await pool.query('Insert into Tournaments values ($1, $2, $3, $4, $5, $6)',
            [TournamentID, name, start, end, 'Ongoing', 0]
        );

        return response.sendStatus(201);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;