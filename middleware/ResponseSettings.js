/**
 * Middleware для добавления в ответ заголовков, необходимых для работы CORS-запросов в development-режиме
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
export default async function(req, res, next) {

    if (req.method === "OPTIONS") {
        res.set({
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'PUT,POST,DELETE',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
    }
    else {
        res.set({
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Credentials': 'true',
        });
    }

    next();
}