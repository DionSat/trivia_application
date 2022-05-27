const { pool } = require("./db");

const getLeaderboard = (request, response) => {
    pool.query('SELECT * FROM leaderboard', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}

const getLeaderboardByAccuracy = (request, response) => {
    pool.query('SELECT * FROM leaderboard ORDER BY accuracy DESC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}

const getLeaderboardByTotal = (request, response) => {
    pool.query('SELECT * FROM leaderboard ORDER BY answerscorrect DESC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}

const getUser = (user) => {
    pool.query('SELECT * FROM leaderboard WHERE username = $1', [user], (error, results) => {
        if (error) {
            throw error
        }
        return results.rows;
    })
}

const createUser = (username) => {
    pool.query('INSERT INTO leaderboard (id, username, answerscorrect, accuracy) VALUES ($1, $2, $3, $4)', [name, email], (error, results) => {
        if (error) {
            throw error
        }
        console.log(`User added with ID: ${result.insertId}`);
    })
}

const updateLeaderboard = (request, response) => {
    pool.query(
      'UPDATE leaderboard SET name = $1, email = $2 WHERE id = $3',
      [name, email, id],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`User modified with ID: ${id}`)
      }
    )
}

module.exports = {
    getLeaderboard,
    getUser,
    createUser,
    updateLeaderboard,
    getLeaderboardByAccuracy,
    getLeaderboardByTotal
}