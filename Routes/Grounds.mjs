import { Router } from "express";

import pool from "../Utils/Database.mjs";
import { validationCheck } from "../Utils/Middleware.mjs";

const router = Router();

router.get('/', validationCheck, async (request, response) => {
    try {
        const res = await pool.query('Select * from Grounds where lastaudit is not null');

        return response.status(200).send(res.rows);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.post('/add', validationCheck, async (request, response) => {
    const { body: { name, location, price } } = request;

    if (!(name && location && price))
        return response.status(400).send('Enter\nName: <Name>,\nLocation: <Location>,\nPrice: <Price>');

    try {
        let res = await pool.query('Select * from Grounds where name = $1 and location = $2', [name, location]);

        if (res.rowCount !== 0)
            return response.status(400).send('Ground Already Exists in Database :)');

        res = await pool.query('Select * from Grounds');

        const GroundID = res.rowCount + 1;

        res = await pool.query('Insert into Grounds values ($1, $2, $3, $4, $5, $6, $7, null)', [GroundID, name, location,'U', price, 'U', 'U']);

        return response.status(201).send('Ground Added to Database :)');
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;