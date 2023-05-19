/**
 *  Класс-контроллер для управления аутентификации пользователя
 */

import UserService from '../services/UserService.js';
import SessionService from '../services/SessionService.js';

class authController {

    /**
     * Вход (залогинивание) пользователя по указанным логину и паролю.
     * В случае успешного входа создаётся новая пользоваительская сессия, идентификатор которой передаётся в cookie
     *
     * @param req
     * @param res
     * @returns {Promise.<void>}
     */
    async login(req, res) {

        let {username, password} = req.body;
        let user, sessionId;

        // Проверка аутентификационных данных
        try {
            user = await UserService.getOne(username, password);
        } catch (err) {
            let code;
            switch (err.message) {
                case 'user not found':
                    code = 404;
                    break;
                case 'login is required':
                case 'password is required':
                    code = 400;
                    break;
                case 'incorrect password':
                    code = 401;
                    break;
                default:
                    code = 500;
                    break;
            }
            return res.status(code).send(err.message);
        }

        // Старт новой сессии
        try {
            sessionId = await SessionService.startUserSession(user['id'], user['login']);
        } catch (err) {
            return res.status(500).send(err.message);
        }

        // Удаление сессий с истёкшим сроком жизни
        try {
            await SessionService.removeInvalidSessions();
        } catch (err) {
            return res.status(500).send(err.message);
        }

        // Добавление данных сессии в cookie
        let expDate = new Date();
        expDate.setDate(expDate.getDate() + 1);
        res.cookie('sessionId', sessionId, {
            expires: expDate,
            httpOnly: true,
            sameSite: 'lax'
        });

        return res.json(user);
    }

    /**
     * Выход (разлогинивание) пользователя.
     * Завершение текущей пользовательской сессии
     *
     * @param req
     * @param res
     * @returns {Promise.<void>}
     */
    async logout(req, res) {

        let result, sessionId;

        if ( !req.sessionData || !req.sessionData['sessionId'] )
            return res.status(500).send('sessionId is required');

        try {
            result = await SessionService.closeSession(req.sessionData['sessionId']);
        } catch (err) {
            return res.status(500).send(err.message);
        }

        if ( !result )
            return res.status(500).send('logout error');

        return res.json('session closed');

    }

    /**
     * Получение данных текущей пользовательской сессии
     * Данные пользовательской сессии добавляются в request (по идентификатору сессии из cookie) в AuthMiddleware
     *
     * @param req
     * @param res
     * @returns {Promise.<void>}
     */
    async getSessionData(req, res) {

        if ( !req.sessionData || !req.sessionData['userId'] )
            return res.status(401).send('authentication required');

        return res.json(req.sessionData);
    }

}

export default new authController();