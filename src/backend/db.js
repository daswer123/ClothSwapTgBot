import Database from 'better-sqlite3';

// Подключиться к базе данных SQLite
let db = new Database('users.db', { fileMustExist: false });
console.log('Connected to the test SQLite database.');

// Создать таблицу sessions, если она не существует
db.exec('CREATE TABLE IF NOT EXISTS sessions(id text PRIMARY KEY, session text)');
console.log('Session table ready.');

// Таблица пользователей
db.exec(`
  CREATE TABLE IF NOT EXISTS users(
    userId TEXT PRIMARY KEY,
    username TEXT
  )
`);
console.log('Users table ready.');

export default db

// Functions

// Sessions funcs
// Функция для получения сессии из бд
export function getSessionFromDatabase(userId) {
    userId = Math.floor(userId);
    const row = db.prepare('SELECT session FROM sessions WHERE id = ?').get(userId);
    return row ? JSON.parse(row.session) : null;
}

// Функция для сохранения сессии в бд
export function saveSessionToDatabase(userId, session) {
    userId = Math.floor(userId);
    db.prepare('INSERT OR REPLACE INTO sessions(id, session) VALUES(?, ?)').run(userId, JSON.stringify(session));
}


// Users funcs
// Функция для получения пользователя из базы данных
export function getUserFromDatabase(userId) {
    userId = Math.floor(userId);
    const row = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
    return row ? row : null;
}
// Функция для сохранения пользователя в базу данных
export function saveUserToDatabase(userId, username) {
    userId = Math.floor(userId);
    db.prepare('INSERT OR REPLACE INTO users(userId, username) VALUES(?, ?)').run(userId, username);
}

export function getAllUsersFromDatabase() {
    const rows = db.prepare('SELECT userId FROM users').all();
    return rows ? rows.map(row => row.userId) : [];
}