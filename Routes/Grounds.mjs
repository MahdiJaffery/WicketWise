import { Router } from "express";

import pool from "../Utils/Database.mjs";
import { validationCheck } from "../Utils/Middleware.mjs";

const router = Router();

router.get('/', validationCheck, async (request, response) => {
    try {
        const res = await pool.query('Select * from Grounds');

        return response.status(200).send(res.rows);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;