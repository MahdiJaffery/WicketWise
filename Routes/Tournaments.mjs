import { Router } from "express";

import { validationCheck } from "../Utils/Middleware.mjs";
import pool from "../Utils/Database.mjs";

const router = Router();

async function checkUser(id) {
    let res = await pool.query('Select * from Users where userid = $1', [id]);
    console.log(res.rows);
    console.log(res.rowCount);
    if (!res.rowCount)
        return false;
    return true;
}

router.get('/', validationCheck, async (request, response) => {
    const { query: { filter } } = request;

    try {
        let res = await pool.query('Select status from Tournaments where status = $1', [filter]);

        if (res.rowCount)
            res = await pool.query('Select * from Tournaments where status = $1', [filter]);
        else
            res = await pool.query('Select * from Tournaments where status = $1', ['Ongoing']);

        if (!res.rowCount)
            return response.status(200).send('No Ongoing Tournaments');

        return response.status(200).send(res.rows);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.post('/create', validationCheck, async (request, response) => {
    const { body: { name, location, start, end } } = request;

    if (!(name && start && end && location))
        return response.status(400).send('Enter\nName: <Name>\nStart: <Start Date>\nEnd: <End Date>');

    try {
        let res = await pool.query('Select * from Tournaments where tournamentname = $1 and startdate = $2 and enddate = $3', [name, start, end]);

        if (res.rowCount)
            return response.status(400).send('Tournament already exists');

        res = await pool.query('Select * from Grounds where location = $1 and lastaudit is not null', [location]);

        if (!res.rowCount)
            return response.status(404).send('No Availible Locations');

        res = await pool.query('Select * from Tournaments');

        const TournamentID = res.rowCount + 1;
        const Sponsors = ['Pepsi', 'Nestle', 'KFC', 'Habib Bank Ltd.', 'Golootlo'];

        res = await pool.query('Insert into Tournaments values ($1, $2, $3, $4, $5, $6, $7, $8)',
            [TournamentID, name, location, start, end, 'Ongoing', 0, Sponsors[Math.floor(Math.random() * 10 % Sponsors.length)]]
        );

        res = await pool.query('Update Tournaments set status = $1 where startdate > current_date', ['Pending']);

        res = await pool.query('Update Tournaments set status = $1 where enddate < current_date', ['Ended']);

        return response.sendStatus(201);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.get('/pitchReport', validationCheck, async (request, response) => {
    const { body: { tournamentid } } = request;

    try {
        let res = await pool.query('Select * from Tournaments where tournamentid = $1', [tournamentid]);

        if (!res.rowCount)
            return response.status(404);

        const testDate = res.rows[0].startdate;

        res = await pool.query('Select $1 - current_date as days', [testDate]);

        const Pitches = ['Green Pitch', 'Flat Track Pitch', 'Dry Pitch', 'Wet Pitch', 'Dusty Pitch', 'Dead Pitch'];

        if (res.rows[0].days <= 1)
            return response.status(200).send(Pitches[Math.floor(Math.random() * 10 % 6)]);
        return response.status(400).send('Too early for pitch reports');
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.post('/register', validationCheck, async (request, response) => {
    const { body: { captainid, captainname, tournamentid, teamname, members } } = request;

    if (await checkUser(captainid) === false)
        return response.status(400).send('Invalid Captain ID');

    try {
        let res = await pool.query('Select * from Tournaments where Tournamentid = $1 and status <> $2', [tournamentid, 'Ended']);

        if (!res.rowCount)
            return response.status(404).send('Tournament Not Found');

        res = await pool.query('Select * from Teams');

        const teamId = res.rowCount + 1;

        res = await pool.query('Insert into Teams values ($1, $2, $3, $4, $5, $6, $7)',
            [teamId, captainid, captainname, tournamentid, teamname, members, 'Registered']
        );

        return response.status(201).send(`Team Registered\nRegisteration ID: ${teamId}`);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

router.delete('/:teamid', validationCheck, async (request, response) => {
    let { params: { teamid } } = request;
    teamid = parseInt(teamid);

    if (isNaN(teamid)) return response.sendStatus(400);

    if (!teamid)
        return response.status(400).send('Enter\nteamid: <teamid>');

    try {
        let res = await pool.query('Select * from Teams where teamid = $1 and status = $2', [teamid, 'Registered']);

        if (!res.rowCount)
            return response.status(200).send('Team Not Registered');

        res = await pool.query('Update Teams set status = $1 where teamid = $2', ['Revoked', teamid]);

        res = await pool.query('Update Tournaments set teamsrgd = teamsrgd - 1 where tournamentid in (Select tournamentid from Teams where teamid = $1)', [teamid]);

        return response.status(201).send('Registeration Revoked');
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;