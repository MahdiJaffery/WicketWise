import { Router } from "express";

const router = Router();

router.get('/about', (req, res) => {
    return res.status(200).send('About Us...');
})

export default router;