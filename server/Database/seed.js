const { pool } = require("./db");

async function seed() {
    const testUser1 = [1, 'testUser1', 0, 0]
    const testUser2 = [2, 'testUser2', 0, 0]
    try {
        const res = await pool.query(
        "INSERT INTO leaderboard (id, username, totalanswerscorrect, accuracy) VALUES ($1, $2, $3, $4)",
        testUser1
        );
        console.log(`Added test users`);
        pool.end();
    } catch (error) {
        console.error(error)
    }
}

seed();