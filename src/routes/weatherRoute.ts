import { Router } from 'express';
import {getWeatherCity, getWeatherCode} from "../controllers/weatherController.js"
import { authGuard } from '../middlewares/authGuard.js';

//Cria uma instância do router do Express
const router = Router();

router.get('/:city', authGuard, getWeatherCity); //se tiver /api/weather/:city => a rota fica /api/weather/api/weather/Lisbon
router.get('/:code/weather', authGuard, getWeatherCode); //tem que se por o authGuard para proteger a rota ==> nao funciona


export default router;