/**
 * Модель для доступа к данным пользователей в базе данных sqlite
 */

import db from '../db/index.js';
import { createHash } from "crypto";

class User {

    constructor(db) {
        this.db = db;
    }

    /**
     * Получение данных пользователя по указанным логину и паролю.
     * Если в теблице users есть запись с совпадающим значением поля "login", у которой значение поля "passwordHash"
     * равно хэшу переданного пароля, возвращается id, login и имя пользователя
     *
     * @param login
     * @param password
     * @returns {Promise}
     */
    getUserData(login, password) {

        let sql = `select 
          id, 
          name, 
          login, 
          passwordHash 
        from users 
        where "login" = $login;`;

        return new Promise((resolve, reject) => {
            this.db.get(sql,
                { $login: login },
                (err, row) => {
                    if (err) {
                        reject(err);
                    }

                    if ( !row ) {
                        reject('user not found');
                    } else {

                        let passwordHash = createHash("sha256").update(password).digest("hex");

                        if (row['passwordHash'] && row['passwordHash'] !== passwordHash)
                            reject('incorrect password');

                        let userData = {
                            id:     row['id'],
                            login:  row['login'],
                            name:   row['name'],
                        };

                        resolve(userData);
                    }
                });
        });
    }



}

export default new User(db);