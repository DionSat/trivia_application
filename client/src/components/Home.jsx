import React, { useState, useEffect } from "react";
import { SocketContext } from "../contexts/Socket/index"

function Home() {
    const [ clientState, setClientState ] = useState(null);
    const [ roomState, setRoomState ] = useState(null);
    const [ rooms, setRooms ] = useState(null);
    const [ socket, _ ] = React.useContext(SocketContext)

    useEffect(() => {
        socket.on("clientState", data => {
            setClientState(data);
            if (data == null || data.roomId == null) {
                setRoomState(null);
            }
        });
        socket.on("roomState", data => {
            console.log(data);
            setRoomState(data);
        });
    }, []);

    const createRoom = () => {
        socket.emit('createRoom', `room${Math.floor(Math.random() * 1000)}`, (response) => {
            console.log(response);
        });
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

    const RenderRoomState = () => {
        if (roomState == null) {
            return (<div></div>);
        } else {
            return (
                <div>
                    <div>{roomState.name}</div>
                    <div>{roomState.question.value}</div>
                    <div>{roomState.question.choices.map((v,i) => <div style={{paddingLeft: 10}}>{v}</div>)}</div>
                </div>
            );
        }
    };

    const RenderClientState = () => {
        if (clientState == null) {
            return (<p></p>);
        } else {
            return (
                <p>
                    Hello {clientState.username},
                    <br></br>
                    It's <time dateTime={clientState.date}>{clientState.date}</time>
                    <br></br>
                    Room Id: {clientState.roomId}
                </p>
            )
        }
    };

    const RenderJoinRoom = (params) => {
        let { room } = params;
        if (clientState != null && clientState.roomId == room.id) {
            return (
                <div>
                    <button type="button" onClick={() => leaveRoom()}>Leave {room.name}</button>
                </div>
            );
        } else {
            return (
                <div>
                    <button type="button" onClick={() => joinRoom(room)}>Join {room.name}</button>
                </div>
            );
        }
    };

    const RenderRoomInfos = () => {
        if (rooms == null) {
            return (<p></p>);
        } else {
            return (
                <div>
                    { rooms.map(function(o, i) { return <RenderJoinRoom room={o} key={i}/>; }) }
                </div>
            )
        }
    };

    return (
        <div>
            <RenderClientState/>
            <p>
                <button type="button" onClick={createRoom}>Create Room</button>
                <button type="button" onClick={getRooms}>Get Rooms</button>
            </p>
            <div>
                <RenderRoomState />
            </div>
            <div>
                <RenderRoomInfos />
            </div>
        </div>
    );
}

export default Home;