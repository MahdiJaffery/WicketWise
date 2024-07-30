import { Router } from "express";

import pool from "../Utils/Database.mjs";
import { checkAuthorisation, validationCheck } from "../Utils/Middleware.mjs";

const router = Router();

router.get('/audits', validationCheck, checkAuthorisation, async (request, response) => {
    try {
        let res = await pool.query('Select * from Grounds where lastaudit is null');

        return response.status(200).send(res.rows);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.post('/newaudit', validationCheck, checkAuthorisation, async (request, response) => {
    const { body: { groundid, pitch, equipment, uniforms, grade } } = request;

    if (!(groundid && pitch && equipment && uniforms && grade))
        return response.status(400).send('Enter\ngroundid: id\npitch: \n"string"\nequipment: yes/no\nuniforms: yes/no\ngrade: A-E');

    try {
        let res = await pool.query('Select * from Grounds where groundid = $1', [groundid]);

        if (!res.rowCount)
            return response.sendStatus(404);

        res = await pool.query('Update Grounds set pitch = $1, equipment = $2, uniforms = $3, grade = $4, lastaudit = current_date where groundid = $5',
            [pitch, equipment, uniforms, grade, groundid]
        );

        return response.status(201).send('Audit Completed');
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;