import { Router } from "express";

import pool from "../Utils/Database.mjs";

const router = Router();

router.get('/', async (request, response) => {
    try {
        const res = await pool.query('Select * from PlayerStats order by strikerate desc');

        return response.status(200).send(res.rows);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;