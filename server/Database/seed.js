const { pool } = require("./db");

const query = `
    DROP TABLE IF EXISTS leaderboard;

    CREATE TABLE leaderboard (
        id INTEGER NOT NULL,
        username VARCHAR(255),
        answerscorrect INTEGER NOT NULL,
        accuracy DECIMAL(5,2) CHECK (accuracy <= 1),
        PRIMARY KEY (id)
    );`;

const query2 = `
    INSERT INTO leaderboard VALUES (1, 'testUser1', 0, 0);
    INSERT INTO leaderboard VALUES (2, 'testUser2', 0, 0);
    `;

const appendTable = async (query) => {
    try {
        await pool.query(query);  // sends queries
        console.log("Appended New Table");
        return true;
    } catch (error) {
        console.error(error.stack);
        return false;
    }
};

const seed = async () => {
    appendTable(query);
    try {
        const res = await pool.query(query2);
        console.log(`Added test users`);
    } catch (error) {
        console.error(error)
    } finally {
        await pool.end();         // closes connection
    }
}

seed();