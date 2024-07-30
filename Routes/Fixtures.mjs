import { Router } from "express";

import pool from "../Utils/Database.mjs";
import { checkAuthorisation, validationCheck } from "../Utils/Middleware.mjs";

const router = Router();

router.get('/:id', validationCheck, checkAuthorisation, async (request, response) => {
    const { params: { id } } = request;
    const tournamentid = parseInt(id);

    if (isNaN(tournamentid)) return response.sendStatus(400);

    let res = await pool.query('Select * from Tournaments where tournamentid = $1', [tournamentid]);
    
    if (!res.rowCount) return response.status(404).send('Tournament Not Found');

    if (!tournamentid)
        return response.status(400).send('Enter\ntournamentid: tournamentid');

    let Teams = [], Fixtures = [];
    try {
        res = await pool.query('Select * from Teams where status = $1 and tournamentid = $2', ['Registered', parseInt(tournamentid)]);

        if (res.rowCount < 2)
            return response.status(404).send('Insufficient Teams Registered for This Tournament');

        for (let i = 0; i < res.rowCount; i++)
            Teams.push(res.rows[i].teamname);

        let matchCount = 0;
        for (let i = 0; i < Teams.length; i++)
            for (let j = i + 1; j < Teams.length; j++)
                Fixtures.push(`Match ${++matchCount}:     ${Teams[i]}   vs   ${Teams[j]}`);

        return response.status(200).send(Fixtures);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;