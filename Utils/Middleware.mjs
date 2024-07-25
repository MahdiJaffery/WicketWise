import pool from "./Database.mjs";

export const validationCheck = (request, response, next) => {
    request.sessionStore.get(request.sessionID, (err, session) => {
        // console.log(session);
    })

    if (request.session.user)
        next();
    else
        return response.sendStatus(401);
}

export const parseId = (request, response, next) => {
    const { params: { id } } = request;
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) return response.sendStatus(400);

    request.parsedId = parsedId;
    next();
}

export const ValidateDatabase = async (request, response, next) => {
    try {
        const query = 'Update Bookings set status = $1 where dateof::date < current_date or (dateof::date < current_date and Extract(hour from dateof) + durationinhours <= Extract(hour from current_time))';

        let res = await pool.query(query, ['Invalid']);

        res = await pool.query('Update Tournaments set status = $1 where endDate <= current_date', ['Ended']);

        res = await pool.query('Delete from Teams where tournamentid in (Select TournamentId from Tournaments where status = $1)', ['Ended']);
        
        res = await pool.query('Update Tournaments set status = $1 where startdate > current_date', ['Pending']);

        res = await pool.query('Update Tournaments set status = $1 where startdate <= current_date and enddate >= current_date', ['Ongoing']);

        next();
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
}

export const checkAdmin = async (request, response, next) => {
    const { session: { user: { userid } } } = request;

    try {
        const res = await pool.query('Select * from Users where userid = $1', [userid]);

        if (res.rows[0].type === 'admin')
            next();
        else
            return response.sendStatus(401);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
}

export const checkAuthorisation = async (request, response, next) => {
    const { session: { user: { userid } } } = request;

    try {
        const res = await pool.query('Select * from Users where userid = $1', [userid]);

        if (res.rows[0].type === 'admin' || res.rows[0].type === 'umpire')
            next();
        else
            return response.sendStatus(401);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
}