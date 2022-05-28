const { pool } = require("./db");

const query = `
    DROP TABLE IF EXISTS leaderboard;

    CREATE TABLE leaderboard (
        id INT GENERATED ALWAYS AS IDENTITY,
        username VARCHAR(255),
        answerscorrect INTEGER NOT NULL,
        totalanswered INTEGER NOT NULL,
        accuracy DECIMAL(5,2) CHECK (accuracy <= 1),
        PRIMARY KEY (id)
    );`;

const query2 = `
    INSERT INTO leaderboard (username, answerscorrect, totalanswered, accuracy) VALUES ('testUser1', 10, 10, 0);
    INSERT INTO leaderboard (username, answerscorrect, totalanswered, accuracy) VALUES ('testUser2', 1, 10, .1);
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
    await appendTable(query);
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