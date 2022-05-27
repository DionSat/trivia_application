import React, { useState, useEffect } from 'react';
import { SocketContext } from '../contexts/Socket/index';
import '../assets/css/style.css';

function Home() {
  const [clientState, setClientState] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [rooms, setRooms] = useState(null);
  const [socket, _] = React.useContext(SocketContext);
  const [ready, setReady] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const [lastAnsweredQuestionId, setLastAnsweredQuestionId] = useState(-1);

  useEffect(() => {
    socket.on('clientState', (data) => {
      setClientState(data);
      if (data == null || data.roomId == null) {
        setRoomState(null);
      }
    });
    socket.on('roomState', (data) => {
      console.log(data);
      setRoomState(data);
      if (data.players.every((element) => element.ready === true)) {
        setAllReady(true);
      }
    });
  }, []);

  const createRoom = () => {
    socket.emit(
      'createRoom',
      `room${Math.floor(Math.random() * 1000)}`,
      (response) => {
        console.log(response);
      }
    );
  };

  const getRooms = () => {
    socket.emit('getRoomNames', (response) => {
      setRooms(response);
    });
  };

  const joinRoom = (room) => {
    setLastAnsweredQuestionId(-1);
    socket.emit('joinGame', room.id, (response) => {
      console.log(response);
    });
  };

  const leaveRoom = () => {
    socket.emit('leaveGame', (response) => {
      console.log(response);
    });
  };

  const submitAnswer = () => {
    socket.emit('answer', answerText, (response) => {
      if (response) {
        // correct
      } else {
        // incorrect
      }

      console.log(response);
    });
    setAnswerText('');
    if (roomState) {
      setLastAnsweredQuestionId(roomState.questionId);
    }
  };

  const readyUp = () => {
    setReady(true);
    socket.emit('ready', true, (response) => {
      console.log(response);
    });
  };

  // const RenderRoomState = () => {
  //     if (roomState == null) {
  //         return (<div></div>);
  //     } else {
  //         return (
  //             <div>
  //                 <div>{roomState.name}</div>
  //                 <b>{roomState.question}</b>
  //                 <div>
  //                     <input type="text" value={answerText} onInput={(e) => setAnswerText(e.target.value)} />
  //                     <button type="button" onClick={submitAnswer}>Submit</button>
  //                 </div>
  //             </div>
  //         );
  //     }
  // };

  const RenderClientState = () => {
    if (clientState == null) {
      return <p></p>;
    } else {
      return (
        <p>
          <span style={{ fontWeight: 'bold' }}>Hello:</span>{' '}
          {clientState.username},<br></br>
          <span style={{ fontWeight: 'bold' }}>It's:</span>{' '}
          <time dateTime={clientState.date}>{clientState.date}</time>
          <br></br>
          <span style={{ fontWeight: 'bold' }}>Room ID:</span>{' '}
          {clientState.roomId}
        </p>
      );
    }
  };

  const RenderJoinRoom = (params) => {
    let { room } = params;
    if (clientState != null && clientState.roomId === room.id) {
      return (
        <div>
          <button
            className='btn_stop'
            type='button'
            onClick={() => leaveRoom()}>
            Leave {room.name}
          </button>
        </div>
      );
    } else {
      return (
        <div>
          <button
            className='btn_secondary'
            type='button'
            onClick={() => joinRoom(room)}>
            Join {room.name}
          </button>
        </div>
      );
    }
  };

  const RenderRoomInfos = () => {
    if (rooms == null) {
      return <p></p>;
    } else {
      return (
        <div>
          {rooms.map(function (o, i) {
            return <RenderJoinRoom room={o} key={i} />;
          })}
        </div>
      );
    }
  };

  const RenderLobbyState = () => {
    if (!roomState) {
      return <p></p>;
    } else {
      return (
        <div>
          {roomState.players.map((user, value) => {
            if (user.ready === true)
              return (
                <p className='userReady' key={value}>
                  {user.name}
                </p>
              );
            else
              return (
                <p className='userNotReady' key={value}>
                  {user.name}
                </p>
              );
          })}
        </div>
      );
    }

    // roomState.players.map(function(index, value){
    //   return (
    //     <p key={value}>{index.name}</p>
    //   )
    // })
  };

  return (
    <div className='main_container'>
      <h1>Trivia</h1>
      <RenderClientState />
      <p>
        <button className='btn_main' type='button' onClick={createRoom}>
          Create Room
        </button>
        <button className='btn_main' type='button' onClick={getRooms}>
          Get Rooms
        </button>
      </p>
      <div>
        {!ready && roomState && (
          <div>
            <div>{roomState.name}</div>
            <div>
              <button className='btn_go' type='button' onClick={readyUp}>
                Ready
              </button>
            </div>
          </div>
        )}
        {roomState && allReady && (
          <div>
            <div>{roomState.name}</div>
            <div>
              {roomState.players.map((o, i) => {
                return (
                  <div>
                    {o.name}: {o.score}
                  </div>
                );
              })}
            </div>
            {roomState.gameOver && (
              <b>
                <h2>Game Over!</h2>
              </b>
            )}
            {!roomState.gameOver && (
              <div>
                <b><h2>{Math.ceil(roomState.questionMsLeft / 1000)}</h2></b>
                <b>#{roomState.questionId+1}: {roomState.question}</b>
                <div>{roomState.answer}</div>
                <div>
                  <input
                    type='text'
                    value={answerText}
                    disabled={lastAnsweredQuestionId == roomState.questionId}
                    onInput={(e) => setAnswerText(e.target.value)}
                  />
                  <button className='btn_go' type='button' onClick={submitAnswer}>
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <RenderRoomInfos />
        <RenderLobbyState />
      </div>
    </div>
  );
}

export default Home;
