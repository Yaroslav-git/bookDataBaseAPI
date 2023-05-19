/**
 * Корневой скрипт приложения.
 * Модуль cookie-parser используется для передачи аутентификационного токена (sessionId) в cookie's
 * Перед выполнением каждого запроса (кроме залогинивания) проверяется валидность текущей пользовательской сессии
 * по идентификатору sessionId из cookie's - для этого используется функция из AuthMiddleware
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import booksRouter from './routes/booksRouter.js';
import authRouter from './routes/authRouter.js';
import ResponseSettings from './middleware/ResponseSettings.js';
import AuthMiddleware from './middleware/AuthMiddleware.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cookieParser());

/**
 * Добавление нужных заголовков для CORS-запросов
 */
if ( process.env.NODE_ENV === 'development' )
    app.use(ResponseSettings);

/**
 * Проверка аутентификации пользователя
 */
app.use(AuthMiddleware);

/**
 * Аутентификация (log in, log out, проверка валидности сессии)
 */
app.use('/auth', authRouter);

/**
 * CRUD запросы по книгам пользователя
 */
app.use('/users', booksRouter);


app.listen(PORT, () => console.log('SERVER STARTED ON PORT ' + PORT));