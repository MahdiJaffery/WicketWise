import { Router } from "express";

import pool from "../Utils/Database.mjs";
import { checkAdmin, validationCheck } from "../Utils/Middleware.mjs";

const router = Router();

router.get('/myStats', validationCheck, async (request, response) => {
    const { session: { user: { userid } } } = request;
    console.log(userid);
    try {
        let res = await pool.query('Select * from PlayerStats where userid = $1',
            [userid]
        );

        return response.status(200).send(res.rows[0]);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.get('/', validationCheck, checkAdmin, async (request, response) => {
    try {
        const res = await pool.query('Select * from PlayerStats');

        return response.status(200).send(res.rows);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;