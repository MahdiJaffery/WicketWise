import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { Router } from 'express';

import routeAbout from '../Routes/About.mjs'
import routeBookings from '../Routes/Booking.mjs'
import routeContact from '../Routes/ContactUs.mjs'
import routeFixtures from '../Routes/Fixtures.mjs'
import routeGrounds from '../Routes/Grounds.mjs'
import routeLeaderboard from '../Routes/Leaderboard.mjs'
import routeStats from '../Routes/PlayerStats.mjs'
import routeTournaments from '../Routes/Tournaments.mjs'
import routeUmpires from '../Routes/Umpire.mjs'

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

router.use(routeAbout);
router.use('/api/bookings', routeBookings);
router.use('/api/grounds', routeGrounds);
router.use('/api/tournaments', routeTournaments);
router.use('/api/contactus', routeContact);
router.use('/api/playerstats', routeStats);
router.use('/api/leaderboard', routeLeaderboard);
router.use('/api/fixtures', routeFixtures);
router.use('/api/umpire', routeUmpires);

export default router;