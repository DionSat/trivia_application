import React, { useState, useEffect } from 'react';
import { SocketContext } from '../contexts/Socket/index';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:4001/leaderboard')
          .then(response => response.json())
          .then(data => {
            console.log(data);
          })
          .catch((error) => {
            console.error(error);
          });  
    }, []);

    console.log(leaderboard);

    return (
        <div>

        </div>
    );
}

export default Leaderboard;