import React, { useState, useEffect } from 'react';
import { SocketContext } from '../contexts/Socket/index';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:4001/leaderboard')
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
    
    const ColumnHeader = ({
      onClick,
      onClickAll
    }) => (
      <div className="row colheader">
          <div className="col-xs-1">
            <h4>Rank</h4>
          </div>
          <div className="col-xs-5">
            <h4>Username</h4>
          </div>
          <div className="col-xs-3 recent">
            <h4>Total Correct Answers</h4>
          </div>
          <div className="col-xs-3 alltime">
            <h4>Accuracy</h4>
          </div>
        </div>
    );

    const User = () => {
      return(
          <>
            {
              leaderboard.map((value, index) => (
                  <div className="row users vcenter" key={index}>
                      <div className="col-xs-1 rank">
                        <h4> {value.id} </h4>
                      </div>
                      <div className="col-xs-1 username">
                        <h4> {value.username} </h4>
                      </div>
                      <div className="col-xs-1 correct-answers">
                        <h4> {value.answerscorrect} </h4>
                      </div>
                      <div className="col-xs-1 accuracy">
                        <h4> {value.accuracy} </h4>
                      </div>
                  </div>
                  )
              )
          }
        </>
      )
    }

    return (
      <>
        {leaderboard && (
          <div className="container">
              <LeaderboardHeader />
              <ColumnHeader />
              <User />
          </div>
        )}
      </>
    )
}

export default Leaderboard;