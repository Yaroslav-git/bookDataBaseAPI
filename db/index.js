import sqlite from 'sqlite3';

const db = new sqlite.Database("./src/bookdb.db");

export default db;
