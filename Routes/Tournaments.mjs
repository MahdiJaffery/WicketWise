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

router.post('/register', validationCheck, async (request, response) => {
    const { body: { teamname, memberCount, tourneyName } } = request;

    if (!(teamname && memberCount && tourneyName) || (memberCount > 5 && memberCount < 1))
        return response.status(400).send('Enter\nteamname: <Team Name>\nmemberCount: <Team Member Count 1 <= count <= 5>\ntourneyName: <Tournament Name>');

    try {
        let res = await pool.query('Select * from Teams where TeamName = $1', [teamname]);

        if (res.rowCount)
            return response.status(400).send('Team already Registered');

        res = await pool.query('Select * from Teams');

        const TeamID = res.rowCount + 1;

        res = await pool.query('Select * from Tournaments where TournamentName = $1 and status = $2', [tourneyName, 'Ongoing']);

        if (!res.rowCount)
            return response.status(400).send('Tournament Not Found');

        const TourneyID = res.rows[0].tournamentid;

        res = await pool.query('Insert into Teams values ($1, $2, $3, $4, $5)',
            [TeamID, TourneyID, teamname, memberCount, 'Registered']
        );

        res = await pool.query('Update Tournaments set TeamsRgd = TeamsRgd + 1 where TournamentId = $1', [TourneyID]);

        return response.status(201).send({ msg: 'Registered Team for Tournament', teamid: TeamID });
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.post('/cancelReg', validationCheck, async (request, response) => {
    let { body: { teamid } } = request;
    teamid = parseInt(teamid);

    if (isNaN(teamid)) return response.sendStatus(400);

    if (!teamid)
        return response.status(400).send('Enter\nteamid: <teamid>');

    try {
        let res = await pool.query('Select * from Teams where teamid = $1 and status = $2', [teamid, 'Registered']);

        if (!res.rowCount)
            return response.status(200).send('Team Not Registered');

        res = await pool.query('Update Teams set status = $1 where teamid = $2', ['Revoked', teamid]);

        return response.status(201).send('Registeration Revoked');
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;