import { Router } from "express";

import pool from "../Utils/Database.mjs";
import { checkAuthorisation, validationCheck } from "../Utils/Middleware.mjs";

const router = Router();

router.post('/uploadStats', validationCheck, checkAuthorisation, async (request, response) => {
    let { body: { userid, runsscored, ballsfaced } } = request;

    if (!(userid, runsscored, ballsfaced))
        return response.status(400).send('Enter\nuserid: <userid>\nrunsscored: <runsscored>\nballsfaced: <ballsfaced>');

    userid = parseInt(userid);
    runsscored = parseInt(runsscored);
    ballsfaced = parseInt(ballsfaced);

    try {
        let res = await pool.query('Update PlayerStats set matchesplayed = matchesplayed + 1, runsscored = runsscored + $1, ballsfaced = ballsfaced + $2 where userid = $3',
            [runsscored, ballsfaced, userid]
        );

        res = await pool.query('Select runsscored, ballsfaced from PlayerStats where userid = $1', [userid]);

        ballsfaced = res.rows[0].ballsfaced;
        runsscored = res.rows[0].runsscored;

        const StrikeRate = (runsscored / ballsfaced) * 100;

        res = await pool.query('Update PlayerStats set strikerate = $1 where userid = $2', [StrikeRate, userid]);

        return response.status(201).send('Stats Updated');
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;