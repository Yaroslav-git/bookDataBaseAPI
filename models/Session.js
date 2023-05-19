/**
 * Модель для доступа к данным пользовательской сессии в базе данных sqlite
 */

import db from '../db/index.js';
import { createHash } from "crypto";

class Session {

    //время жизни пользовательской сессии по умолчанию - 24 часа
    SESSIONLENGTH = 1000 * 3600 * 24;

    constructor(db) {
        this.db = db;
    }

    /**
     * Получение данных пользовательской сессии по указанному идентификатору.
     * Возвращаеся id, login и имя пользователя, id, время начала и завершения сессии и признак валидности сессии
     *
     * @param sessionId
     * @returns {Promise}
     */
    getSessionData(sessionId) {

        let sql = `select 
              us.userId,
              us.sessionId, 
              us.sessionStart, 
              us.sessionEnd,
              ul.login as userLogin,
              ul.name as userName
            from user_sessions us
            join users ul on ul.id = us.userId
            where us.sessionId = $sessionId;`;

        return new Promise((resolve, reject) => {
            this.db.get(sql,
                { $sessionId: sessionId },
                (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    if (!row) {
                        reject('session not found');
                    }
                    else {
                        let sessionData = {
                            isValid: (row['sessionEnd'] && new Date() < row['sessionEnd']),
                            userId: row['userId'],
                            userLogin: row['userLogin'],
                            userName: row['userName'],
                            sessionId: row['sessionId'],
                            sessionStart: row['sessionStart'],
                            sessionEnd: row['sessionEnd']
                        };

                        resolve(sessionData);
                    }
                });
        });
    }

    /**
     * Создание новой пользовательской сессии - добавление записи в таблицу user_sessions
     *
     * @param sessionId
     * @param userId
     * @returns {Promise}
     */
    startSession(sessionId, userId) {

        let sessionStart = Number(new Date());
        let sessionEnd   = sessionStart + this.SESSIONLENGTH;

        let sql = `insert into user_sessions
        (
            userId,
            sessionId,
            sessionStart,
            sessionEnd
        )
        values
        (
            $userId,
            $sessionId,
            $sessionStart,
            $sessionEnd
        );`;

        return new Promise((resolve, reject) => {
            this.db.run(sql,
                {
                    $userId:        userId,
                    $sessionId:     sessionId,
                    $sessionStart:  sessionStart,
                    $sessionEnd:    sessionEnd
                },
                (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(true);
                });
        });
    }

    /**
     * Пролонгирование указанной пользовательской сессии -
     * обновление время завершения сессии (поле sessionEnd в таблице user_sessions).
     * Новое значение поля - текущее время + дефолтная длина сессии
     *
     * @param sessionId
     * @returns {Promise}
     */
    prolongSession(sessionId) {

        let sessionEnd = Number(new Date()) + this.SESSIONLENGTH;

        let sql = `update user_sessions 
        set sessionEnd = $sessionEnd
        where sessionId = $sessionId;`;

        return new Promise((resolve, reject) => {
            this.db.run(sql,
                {
                    $sessionEnd: sessionEnd,
                    $sessionId:  sessionId,
                },
                (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(true);
                });
        });
    }

    /**
     * Завершение указанной пользовательской сессии -
     * обновление время завершения сессии (поле sessionEnd в таблице user_sessions).
     * Новое значение поля - текущее время.
     *
     * @param sessionId
     * @returns {Promise}
     */
    closeSession(sessionId) {

        let sessionEnd = Number(new Date());

        let sql = `update user_sessions 
        set sessionEnd = $sessionEnd
        where sessionId = $sessionId;`;

        return new Promise((resolve, reject) => {
            this.db.run(sql,
                {
                    $sessionEnd: sessionEnd,
                    $sessionId:  sessionId,
                },
                (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(true);
                });
        });
    }

    /**
     * Удаление сессий с истёкшим сроком жизни - удаление из таблицы user_sessions всех записей,
     * для которых значение времени завершения сессии (sessionEnd) меньше текущего времени
     *
     * @returns {Promise}
     */
    removeInvalidSessions() {

        let currentTime = Number(new Date());
        let sql = `delete from user_sessions where sessionEnd < $currentTime;`;

        return new Promise((resolve, reject) => {
            this.db.run(sql,
                { $currentTime: currentTime },
                (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(true);
                });
        });
    }

    /**
     * Генерация уникального идентификатора сессии на основе логина пользователя и текущего времени
     *
     * @param login
     * @returns {*}
     */
    generateSessionId(login) {

        let curDate = Number(new Date());
        return createHash("sha256").update(login + curDate).digest("hex");
    }

}

export default new Session(db);