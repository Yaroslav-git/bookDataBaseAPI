/**
 * Модель для доступа к данным книг в базе данных sqlite
 */

import db from '../db/index.js'

class Book {

    constructor(db) {
        this.db = db;
    }

    /**
     * Получение списка (массива) всех книг из таблицы books, которые привязаны к пользователю с указанным идентификатором.
     * Данные по привязке книг к пользователям содержатся в таблице user_books
     *
     * @param userId
     * @returns {Promise}
     */
    getUserBookList(userId) {

        let sql = `SELECT DISTINCT
                b.id,
                b.titleOrig,
                b.titleRus,
                b.authorNameOrig,
                b.authorNameRus,
                b.publicationYear,
                b.coverImageLink,
                b.annotation,
                ub.readStatus,
                ub.assessment,
                ub.comment,
                ub.insertedAt,
                ub.updatedAt
            FROM books b
            JOIN user_books ub on ub.bookId = b.id
            WHERE ub.userId = $userId;`;

        return new Promise((resolve, reject) => {
            this.db.all(sql,
                { $userId: userId },
                (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                });
        });
    }

    /**
     * Получение из таблицы books данных книги с указанным идентификатором (bookId), которая привязана к указанному пользователю (userId)
     *
     * @param userId
     * @param bookId
     * @returns {Promise}
     */
    getUserBook(userId, bookId) {

        let sql = `SELECT DISTINCT
                b.id,
                b.titleOrig,
                b.titleRus,
                b.authorNameOrig,
                b.authorNameRus,
                b.publicationYear,
                b.coverImageLink,
                b.annotation,
                ub.readStatus,
                ub.assessment,
                ub.comment,
                ub.insertedAt,
                ub.updatedAt
            FROM books b
            JOIN user_books ub on ub.bookId = b.id
            WHERE ub.userId = $userId
                and b.id = $bookId;`;

        return new Promise((resolve, reject) => {
            this.db.get(sql,
                {
                    $userId: userId,
                    $bookId: bookId
                },
                (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row);
                });
        });

    }

    /**
     * Создание новой книги - добавление записи в таблицу books.
     * Возвращается идентификатор созданной книги
     *
     * @param bookData
     * @returns {Promise}
     */
    createBook(bookData) {
        
        let sqlInsert = `insert into books  
            ( 
                titleOrig, 
                titleRus, 
                authorNameOrig, 
                authorNameRus, 
                publicationYear, 
                coverImageLink, 
                annotation 
            ) 
            VALUES 
            ( 
                $titleOrig, 
                $titleRus, 
                $authorNameOrig, 
                $authorNameRus, 
                $publicationYear, 
                $coverImageLink, 
                $annotation 
            );`;

        let sqlGetId = `select seq as lastBookId from sqlite_sequence where name = 'books';`;
        
        return new Promise((resolve, reject) => {

            db.serialize(() => {

                db.run( sqlInsert,
                    {
                        $titleOrig: (bookData['titleOrig'] || null),
                        $titleRus: bookData['titleRus'],
                        $authorNameOrig: (bookData['authorNameOrig'] || null),
                        $authorNameRus: bookData['authorNameRus'],
                        $publicationYear: bookData['publicationYear'],
                        $coverImageLink: bookData['coverImageLink'],
                        $annotation: (bookData['annotation'] || null),
                    },
                    (err) => {
                        if (err) {
                            reject(err);
                        }
                    });

                db.get(sqlGetId,
                    (err, row) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(row['lastBookId']);
                    });
            });
        });
    }

    /**
     * Проверка привязки указанной книги к указанному пользователю - получение количества записей в таблице user_books
     *
     * @param bookId
     * @param userId
     * @returns {Promise}
     */
    checkUserBookBind(bookId, userId) {

        let sqlGetCount = `select count(*) as cnt from user_books where userId = $userId and bookId = $bookId;`;

        return new Promise((resolve, reject) => {

            db.get(sqlGetCount,
                {
                    $userId: userId,
                    $bookId: bookId
                },
                (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row['cnt']);
                });
        });
    }

    /**
     * Проверка существования (в таблице books) книги с указанным идентификатором
     *
     * @param bookId
     * @returns {Promise}
     */
    isBookExist(bookId) {

        let sqlGetCount = `select count(*) as cnt from books where id = $bookId;`;

        return new Promise((resolve, reject) => {

            db.get(sqlGetCount,
                { $bookId: bookId },
                (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    if (row['cnt'] && Number(row['cnt']) > 0)
                        resolve(true);
                    else
                        resolve(false);
                });
        });
    }

    /**
     * Привязка указанной книги (bookId) к указанному пользователю (userId) - добавление записи в таблицу user_books
     *
     * @param bookId
     * @param userId
     * @returns {Promise}
     */
    bindBookToUser(bookId, userId) {

        let sqlInsert = `insert into user_books
            (
                userId,
                bookId,
                insertedAt,
                updatedAt
            )
            VALUES 
            (
                $userId,
                $bookId,
                $insertedAt,
                $updatedAt
            );`;

        return new Promise((resolve, reject) => {
            db.run( sqlInsert,
                {
                    $userId: userId,
                    $bookId: bookId,
                    $insertedAt: new Date(),
                    $updatedAt: new Date()
                },
                (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                } );
        });
    }

    /**
     * Изменение данных по привязке указанной книги (bookId) к указанному пользователю (userId) в таблице user_books -
     * обновляются информация по статусу прочтения (поле "readStatus"), комментарию пользователя (поле "comment"),
     * оценке пользователя (поле "assessment") и времени изменения ("updatedAt")
     *
     * @param bookId
     * @param userId
     * @param bookData
     * @returns {Promise}
     */
    updateUserBookStatus(bookId, userId, bookData) {

        let sqlUpdate = `update user_books 
        set
            readStatus = $readStatus,
            assessment = $assessment,
            comment = $comment,
            updatedAt = $updatedAt
        where userId = $userId and bookId = $bookId;`;

        return new Promise((resolve, reject) => {
            db.run( sqlUpdate,
                {
                    $readStatus: bookData['readStatus'],
                    $assessment: bookData['assessment'],
                    $comment: bookData['comment'],
                    $updatedAt: new Date(),
                    $userId: userId,
                    $bookId: bookId
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
     * Изменеие данных (bookData) указанной книги (bookId) - обновление полей таблицы books
     * для записи с соответствующим значением поля "id"
     *
     * @param bookId
     * @param bookData
     * @returns {Promise}
     */
    updateBook(bookId, bookData) {

        let sqlUpdate = `update books 
        set
            titleOrig = $titleOrig,
            titleRus = $titleRus, 
            authorNameOrig = $authorNameOrig,
            authorNameRus = $authorNameRus, 
            publicationYear = $publicationYear, 
            coverImageLink = $coverImageLink,
            annotation = $annotation
        where id = $bookId;`;

        return new Promise((resolve, reject) => {
            db.run( sqlUpdate,
                {
                    $titleOrig: bookData['titleOrig'],
                    $titleRus:  bookData['titleRus'],
                    $authorNameOrig:  bookData['authorNameOrig'],
                    $authorNameRus:   bookData['authorNameRus'],
                    $publicationYear: bookData['publicationYear'],
                    $coverImageLink:  bookData['coverImageLink'],
                    $annotation:      bookData['annotation'],
                    $bookId:    bookId
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
     * Удаление указанной книги (bookId) - удаление из таблицы books записи с соответствующим значением поля "id"
     *
     * @param bookId
     * @returns {Promise}
     */
    removeBook(bookId) {

        let sqlDelete = `delete from books where id = $bookId;`;

        return new Promise((resolve, reject) => {
            db.run( sqlDelete,
                { $bookId: bookId },
                (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                });
        });
    }

}

export default new Book(db);