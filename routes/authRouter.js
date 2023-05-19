/**
 * Роутер для запросов по аутентификации.
 */
import Router from 'express'
import AuthController from '../controllers/AuthController.js';

const authRouter = new Router();

// Получение информации по состоянию пользовательской сессии
authRouter.get('/session', AuthController.getSessionData);
// Залогинивание пользователя, старт новой пользовательской сессии
authRouter.post('/login', AuthController.login);
// Разлогинивание пользователя, завершение текущей пользовательской сессии
authRouter.post('/logout', AuthController.logout);

export default authRouter;
