/**
 *  Middleware для проверки валидности пользовательской сессии.
 *  Идентификатор пользовательской сессии (sessionId) хранится в cookie.
 *  При отсутствии sessionId, отсутсвии информации по указанной сессии или завершении времени жизни сессии возвращается статус 401
 *  При наличии информации по указанной валидной сессии, её параметры (id, login, name пользователя и пр.) добавляются в request
 */

import SessionService from '../services/SessionService.js';

export default async function(req, res, next) {

    // При залогинивании пользователя и предварительных запросах проверка сессии проводиться не должна
    if ( req.path !== '/auth/login' && req.method !== "OPTIONS") {

        let sessionId = req.cookies.sessionId;
        let sessionData;

        if (!sessionId)
            return res.status(401).send('authentication required');

        try {
            sessionData = await SessionService.getOne(sessionId);
        } catch (err) {
            if (err.message === 'session not found')
                return res.status(401).send('authentication required');

            return res.status(500).send('get session data error');
        }

        if (!sessionData['isValid'])
            return res.status(401).send('authentication required');

        try {
            await SessionService.prolongSession(sessionId);
        } catch (err) {
            return res.status(500).send(err.message);
        }

        req.sessionData = sessionData;
    }

    next();
}