import React, { useState, useEffect } from 'react';
import { SocketContext } from '../contexts/Socket/index';
import '../assets/css/style.css';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import { ToastContainer } from 'react-bootstrap';
import Toasts from './Toast';

function Home() {
  const [clientState, setClientState] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [rooms, setRooms] = useState(null);
  const [socket, _] = React.useContext(SocketContext);
  const [ready, setReady] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const [lastAnsweredQuestionId, setLastAnsweredQuestionId] = useState(-1);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const [inLobby, setInLobby] = useState(false);
  const [show, setShow] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [gameFinished, setGameFinished] =  React.useState(false);

  const CheckScore = () => {
      return (
        <div className='main_container'>
          <h1 style={{ fontWeight: 'bold', color: 'black' }}>
            Latest Score Report
          </h1>
          <div>
            {results.map((player) => {
              return (
                <h3>
                  USER: {player.username} SCORED: {player.score} points out of
                  10.
                </h3>
              );
            })}
          </div>
        </div>
      );
  };

  useEffect(() => {
    socket.on('clientState', (data) => {
      setClientState(data);
      if (data == null || data.roomId == null) {
        setRoomState(null);
      }
    });
    socket.on('roomState', (data) => {
      console.log(data);
      console.log('Results: ' + results);
      setRoomState(data);
      if (data.players.every((element) => element.ready === true)) {
        setAllReady(true);
      }
    });

    socket.on('gameInProgress', () => {
      setShow(true);
      setMessage(`Cannot join, game already in progress`);
    });
  }, []);

  useEffect(() => {
    if (roomState) {
      if (roomState.gameOver === true) {
        setReady(false);
        setAllReady(false);
        setInLobby(true);
        if(clientState.ready) {
          setResults(roomState.players);
          setGameFinished(true);
        }
      }
    }
  }, [roomState]);

  const createRoom = () => {
    socket.emit(
      'createRoom',
      `room${Math.floor(Math.random() * 1000)}`,
      (response) => {
        if (response) {
          setAllReady(false);
          setGameFinished(false);
        }
        console.log(response);
      }
    );
    setInLobby(true);
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
      if (response) {
        setAllReady(false);
        setGameFinished(false);
      }
    });
    setInLobby(true);
    setRooms(null);
  };

  const leaveRoom = () => {
    socket.emit('leaveGame', (response) => {
      console.log(response);
    });
    setInLobby(false);
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

  const login = (username, password) => {
    setLoginFailed(false);
    socket.emit('login', username, password, (response) => {
      setLoginFailed(!response);
      console.log(response);
    });
  };

  const RenderClientState = () => {
    if (clientState == null) {
      return <p></p>;
    } else {
      return (
        <p style={{ marginTop: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>Hello:</span>{' '}
          {clientState.username}
          <br></br>
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
    if (clientState != null && clientState.roomId !== room.id && !roomState) {
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
                  {user.username}
                </p>
              );
            else
              return (
                <p className='userNotReady' key={value}>
                  {user.username}
                </p>
              );
          })}
        </div>
      );
    }
  };

  // wait for socket connection before displaying anything
  // maybe add a loading wheel?
  if (clientState == null) return <div></div>;

  // if not logged in then show login screen
  if (clientState.username == null)
    return (
      <div>
        <Navbar />

        <div className='main_container'>
          <b>
            <h2>Login</h2>
          </b>
          <input
            type='text'
            value={loginUsername}
            placeholder='username'
            onInput={(e) => setLoginUsername(e.target.value)}
          />
          <input
            type='password'
            value={loginPassword}
            placeholder='password'
            onInput={(e) => setLoginPassword(e.target.value)}
          />
          <button
            className='btn_go'
            type='button'
            disabled={
              loginUsername == null ||
              loginUsername == '' ||
              loginPassword == null ||
              loginPassword == ''
            }
            onClick={() => login(loginUsername, loginPassword)}>
            Login
          </button>
          {loginFailed && <h4 className='login-failed'>Login Failed</h4>}
        </div>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div className='main_container'>
        <ToastContainer
          className='position-absolute shrink-toast p-4'
          position='top-center'>
          <Toasts message={message} show={show} setShow={setShow} />
        </ToastContainer>
        <RenderClientState />
        {!roomState && (
          <p>
            <button className='btn_main' type='button' onClick={createRoom}>
              Create Room
            </button>
            <button className='btn_main' type='button' onClick={getRooms}>
              Get Rooms
            </button>
          </p>
        )}
        <div>
          {!clientState.ready && roomState && (
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
                      {o.username}: {o.score}
                    </div>
                  );
                })}
              </div>
              {roomState.gameOver && (
                <b>
                  <h2>Time is up, the Trivia Game is Over!</h2>
                </b>
              )}
              {!roomState.gameOver && (
                <div>
                  <b>
                    <h2>{Math.ceil(roomState.questionMsLeft / 1000)}</h2>
                  </b>
                  <p>Category: {roomState.category.title}</p>
                  <b>
                    #{roomState.questionId + 1}: {roomState.question}
                  </b>
                  <div>{roomState.answer}</div>
                  <div>
                    <input
                      type='text'
                      value={answerText}
                      disabled={lastAnsweredQuestionId == roomState.questionId}
                      onInput={(e) => setAnswerText(e.target.value)}
                    />
                    <button
                      className='btn_go'
                      type='button'
                      onClick={submitAnswer}>
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/*clientState.ready && roomState.gameOver && userResult()*/}
        </div>
        <div>
          <RenderRoomInfos />
          {!allReady && roomState && (
            <>
              <div>
                <button
                  className='btn_stop'
                  type='button'
                  onClick={() => leaveRoom()}>
                  Leave {roomState.name}
                </button>
              </div>
            </>
          )}
          <RenderLobbyState />
        </div>
      </div>
      {gameFinished && (
        <>
          <CheckScore />
        </>
      )}
    </div>
  );
}

export default Home;
