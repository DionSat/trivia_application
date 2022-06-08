import React, { useState, useEffect } from 'react';
import { SocketContext } from '../contexts/Socket/index';
import Navbar from './navbar';
import '../assets/css/navbar.css';
import '../assets/css/leaderboard.css';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState(null);

    useEffect(() => {
        fetch('http://localhost:80/leaderboard')
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
      <div
        className='leadheader'
        style={{ backgroundColor: 'blue', color: 'white' }}>
        <h2>Leaderboard</h2>
      </div>
    );
  };

    const getByAccuracy = () => {
      fetch('http://localhost:80/leaderboard/accuracy')
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
      fetch('http://localhost:80/leaderboard/correct')
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
      <Navbar />
      <div className='container outer-container'>
        <LeaderboardHeader />
        <table
          className='table table-striped table-container'
          data-testid='leaderboard-table'>
          <thead>
            <tr key='head'>
              <th>
                <button className='btn shadow-none'>
                  <h5>Rank</h5>
                </button>
              </th>
              <th>
                <button className='btn shadow-none'>
                  <h5>Username</h5>
                </button>
              </th>
              <th>
                <button className='btn shadow-none' onClick={getByAnswers}>
                  <h5>Total Correct Answers</h5>
                </button>
              </th>
              <th>
                <button className='btn shadow-none' onClick={getByAccuracy}>
                  <h5>Accuracy</h5>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard &&
              leaderboard.map((value, index) => (
                <tr>
                  <td className='rank'>{index + 1}</td>
                  <td className='username'>{value[1]}</td>
                  <td className='correct-answers'>{value[2]}</td>
                  <td className='accuracy'>{value[4] * 100 + '%'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Leaderboard;
