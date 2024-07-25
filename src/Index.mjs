import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { Router } from 'express';

import pool from '../Utils/Database.mjs';
import routeBookings from '../Routes/Booking.mjs'
import routeGrounds from '../Routes/Grounds.mjs'
import routeTournaments from '../Routes/Tournaments.mjs'
import routeContact from '../Routes/ContactUs.mjs'
import routeStats from '../Routes/PlayerStats.mjs'
import routeMatches from '../Routes/Matches.mjs'
import routeLeaderboard from '../Routes/Leaderboard.mjs'

const router = Router();

router.use(express.json());
router.use(cookieParser());
router.use(session({
    secret: 'Wicket',
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 10
    }
}))

router.use('/api/bookings', routeBookings);
router.use('/api/grounds', routeGrounds);
router.use('/api/tournaments', routeTournaments);
router.use('/api/contactus', routeContact);
router.use('/api/playerstats', routeStats);
router.use('/api/matches', routeMatches);
router.use('/api/leaderboard', routeLeaderboard);

export default router;