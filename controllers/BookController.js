/**
 *  Класс-контроллер для доступа к книгам пользователя
 */

import BookService from '../services/BookService.js';

class BookController {

    /**
     * Получение списка книг указанного пользователя
     *
     * @param req
     * @param res
     * @returns {Promise.<void>}
     */
    async getAll(req, res) {

        try {
            const bookList = await BookService.getAll(req.params.userId);
            return res.json(bookList);

        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    /**
     * Получение указанной книги указанного пользователя
     *
     * @param req
     * @param res
     * @returns {Promise.<void>}
     */
    async getOne(req, res) {

        try {
            const book = await BookService.getOne(req.params.userId, req.params.bookId);

            if ( !book )
                res.status(404).send('book not found');

            return res.json(book);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    /**
     * Создание новой книги и добавление её к списку книг указанного пользователя
     * Проверяется соответствие указанного пользователя и текущего пользователя
     *
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async create(req, res) {

        if ( !req.sessionData || !req.sessionData['userId'] )
            return res.status(500).send('userId is required');

        // Добавление книги допустимо только в список текущего пользователя (того, к которому привязана пользовательская сессия)
        if ( +req.sessionData['userId'] !== +req.params.userId )
            return res.status(403).send('forbidden for current session user');

        try {
            const bookId = await BookService.addBook(req.params.userId, req.body);
            return res.status(201).json({bookId: bookId});
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    /**
     * Обновление указанной книги указанного пользователя
     * Проверяется соответствие указанного пользователя и текущего пользователя
     *
     * @param req
     * @param res
     * @returns {Promise.<void>}
     */
    async update(req, res) {

        if ( !req.sessionData || !req.sessionData['userId'] )
            return res.status(500).send('userId is required');

        // Допустимо обновление книги только из списка текущего пользователя (того, к которому привязана пользовательская сессия)
        if ( +req.sessionData['userId'] !== +req.params.userId )
            return res.status(403).send('forbidden for current session user');

        try {
            await BookService.update(req.params.userId, req.params.bookId, req.body);
            return res.json('book updated');
        } catch (err) {
            res.status((err.message === 'book not found' ? 404 : 500)).send(err.message);
        }
    }

    /**
     * Удаление указанной книги указанного пользователя
     * Проверяется соответствие указанного пользователя и текущего пользователя
     *
     * @param req
     * @param res
     * @returns {Promise.<void>}
     */
    async delete(req, res) {

        if ( !req.sessionData || !req.sessionData['userId'] )
            return res.status(500).send('userId is required');

        // Допустимо удаление книги только из списка текущего пользователя (того, к которому привязана пользовательская сессия)
        if ( +req.sessionData['userId'] !== +req.params.userId )
            return res.status(403).send('forbidden for current session user');

        try {
            let delRes = await BookService.delete(req.params.userId, req.params.bookId);

            if ( delRes )
                return res.json('book deleted');
            else
                return res.status(500).send('book deletion error');
        } catch (err) {
            res.status((err.message === 'book not found' ? 404 : 500)).send(err.message);
        }
    }
}

export default new BookController();