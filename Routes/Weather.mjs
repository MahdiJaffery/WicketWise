import { Router } from "express";

const router = Router();

async function getWeather(city) {
    const apiKey = 'd95ca0e6b89da19dee88e30429cd04fb';
    const City = city;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${City}&appid=${apiKey}`;

    try {
        const result = await fetch(url);
        const data = await result.json();
       
        return data;
    } catch (err) {
        console.log(err.message);
    }
}

router.get('/', async (request, response) => {
    const { body: { city } } = request;

    if (!city)
        return response.status(400).send('Enter \ncity: your_city');

    try {
        const data = await getWeather(city);
        const Weather = { ...data.weather, ...data.main };

        return response.status(200).send(Weather);
    } catch (err) {
        console.log(err.message);
        return response.sendStatus(500);
    }
})

export default router;