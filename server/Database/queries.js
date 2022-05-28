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

const createUser = (name, correct, total) => {
    let accuracy = (correct / total).toFixed(2);
    pool.query('INSERT INTO leaderboard (username, answerscorrect, totalanswered, accuracy) VALUES ($1, $2, $3, $4)', [name, correct, total, accuracy], (error, results) => {
        if (error) {
            throw error
        }
        console.log(`User ${name} added`);
    })
}

const updateLeaderboard = (name, count_correct, total_questions) => {
    let total = 0;
    let correct = 0;
    let accuracy = 0.00;
    pool.query('SELECT * FROM leaderboard WHERE username = $1', [name], (error, results) => {
        if (error) {
            throw error;
        }
        //if user not in leaderboard
        if (results.rows.length === 0) {
            createUser(name, count_correct, total_questions);
        }
        //if user in the table
        else {
            total = results.rows[0].totalanswered + total_questions;
            correct = results.rows[0].answerscorrect + count_correct;
            accuracy = (correct / total).toFixed(2);
            pool.query(
                'UPDATE leaderboard SET totalanswered = $1, answerscorrect = $2, accuracy = $3 WHERE username = $4',
                [total, correct, accuracy, name],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                    console.log(`User ${name} successfully updated on leaderboard`);
                
            })
        }
    })
}

module.exports = {
    getLeaderboard,
    getUser,
    createUser,
    updateLeaderboard,
    getLeaderboardByAccuracy,
    getLeaderboardByTotal
}