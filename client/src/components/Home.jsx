import React, { useState, useEffect } from 'react';
import { SocketContext } from '../contexts/Socket/index';

function Home() {
  const [clientState, setClientState] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [rooms, setRooms] = useState(null);
  const [socket, _] = React.useContext(SocketContext);
  const [ready, setReady] = useState(false);

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
    if (clientState != null && clientState.roomId == room.id) {
      return (
        <div>
          <button type='button' onClick={() => leaveRoom()}>
            Leave {room.name}
          </button>
        </div>
      );
    } else {
      return (
        <div>
          <button type='button' onClick={() => joinRoom(room)}>
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

  return (
    <div
      style={{
        backgroundColor: 'white',
        margin: 'auto',
        width: '50%',
        border: '6px solid blue',
        padding: '10px',
        textAlign: 'center',
      }}>
      <h1>Trivia</h1>
      <RenderClientState />
      <p>
        <button
          style={{
            backgroundColor: 'blue',
            fontWeight: 'bold',
            color: 'white',
            padding: '5px 15px',
            borderRadius: '5px',
            outline: '0',
            textTransform: 'uppercase',
            margin: '5px',
            cursor: 'pointer',
            boxShadow: '0px 2px 2px lightgray',
            transition: 'ease background-color 250ms',
          }}
          type='button'
          onClick={createRoom}>
          Create Room
        </button>
        <button
          style={{
            backgroundColor: 'blue',
            fontWeight: 'bold',
            color: 'white',
            padding: '5px 15px',
            borderRadius: '5px',
            outline: '0',
            textTransform: 'uppercase',
            margin: '5px',
            cursor: 'pointer',
            boxShadow: '0px 2px 2px lightgray',
            transition: 'ease background-color 250ms',
          }}
          type='button'
          onClick={getRooms}>
          Get Rooms
        </button>
      </p>
      <div>
        {!ready && roomState && (
          <div>
            <div>{roomState.name}</div>
            <div>
              <button type='button' onClick={() => setReady(true)}>
                Ready
              </button>
            </div>
          </div>
        )}
        {roomState && ready && (
          <div>
            <div>{roomState.name}</div>
            <b>{roomState.question}</b>
            <div>
              <input
                type='text'
                value={answerText}
                onInput={(e) => setAnswerText(e.target.value)}
              />
              <button type='button' onClick={submitAnswer}>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
      <div>
        <RenderRoomInfos />
      </div>
    </div>
  );
}

export default Home;