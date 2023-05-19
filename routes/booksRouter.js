/**
 * Роутер для CRUD запросов по книгам пользователя.
 * Обрабатываются запросы по адресу вида /users/:userId/books/(:bookId)
*/
import Router from 'express'
import BookController from '../controllers/BookController.js';

const booksRouter = new Router();

// Получение списка книг пользователя
booksRouter.get('/:userId/books', BookController.getAll);
// Получение определённой книги пользователя
booksRouter.get('/:userId/books/:bookId', BookController.getOne);
// Добавление новой книги для пользователя
booksRouter.post('/:userId/books/', BookController.create);
// Обновление определённой книги пользователя
booksRouter.put('/:userId/books/:bookId', BookController.update);
// Удаление определённой книги пользователя
booksRouter.delete('/:userId/books/:bookId', BookController.delete);

export default booksRouter;
