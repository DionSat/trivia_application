import React, { useState, useEffect } from 'react';
import { SocketContext } from '../contexts/Socket/index';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:80/leaderboard')
          .then(response => response.json())
          .then(data => {
            console.log(data);
            setLeaderboard(data);
          })
          .catch((error) => {
            console.error(error);
          });  
    }, []);

    const LeaderboardHeader = () => {
      return (
        <div className="leadheader">
            <h2>Leaderboard</h2>
        </div>
      )
    }

    const getByAccuracy = () => {
      fetch('http://127.0.0.1:80/leaderboard/accuracy')
          .then(response => response.json())
          .then(data => {
            console.log(data);
            setLeaderboard(data);
          })
          .catch((error) => {
            console.error(error);
          });  
    }

    const getByAnswers = () => {
      fetch('http://127.0.0.1:80/leaderboard/correct')
          .then(response => response.json())
          .then(data => {
            console.log(data);
            setLeaderboard(data);
          })
          .catch((error) => {
            console.error(error);
          });  
    }

    return (
      <>
          <div className='container'>
            <LeaderboardHeader />
            <table className="table table-striped" data-testid="leaderboard-table">
              <thead>
                <tr key="head">
                  <th>
                    <button className="btn shadow-none">
                      <h5>Rank</h5>
                    </button>
                  </th>
                  <th>
                    <button className="btn shadow-none">
                      <h5>Username</h5>
                    </button>
                  </th>
                  <th>
                    <button className="btn shadow-none" onClick={getByAnswers}>
                      <h5>Total Correct Answers</h5>
                    </button>
                  </th>
                  <th>
                    <button className="btn shadow-none" onClick={getByAccuracy}>
                      <h5>Accuracy</h5>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard && (
                  leaderboard.map((value, index) => (
                    <tr>
                        <td className="rank">
                          {value.id}
                        </td>
                        <td className="username">
                          {value.username}
                        </td>
                        <td className="correct-answers">
                          {value.answerscorrect}
                        </td>
                        <td className="accuracy">
                          {value.accuracy * 100 + '%'}
                        </td>
                    </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
      </>
    )
}

export default Leaderboard;