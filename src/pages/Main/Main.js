import { useState, useEffect, useRef } from 'react';
import socket from '../../socket'
import ACTIONS from '../../socket/actions';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';
import './main.css'
import Header from '../Header/header';

function Main() {
    let navigate = useNavigate();
    const [rooms, updateRooms] = useState([]);
    const [room_id, setRoomId] = useState("");
    const rootNode = useRef();


    useEffect(() => {
        socket.on(ACTIONS.SHARE_ROOMS, ({ rooms = [] } = {}) => {
            if (rootNode.current) {
                updateRooms(rooms);
            }
        });
    }, []);

    return (
        <div>
            <Header/>
            <div ref={rootNode}>
                <ul>
                    <input type='text' value={room_id} onChange={(e) => setRoomId(e.target.value)} placeholder='room id' />
                    <button className='btn' onClick={() => {
                        navigate(`/room/${room_id}`);
                    }}>JOIN ROOM</button>
                </ul>
                <button className='btn' onClick={() => {
                    navigate(`/room/${v4()}`);
                }}>
                    Create New Room
                </button>
            </div>
        </div>
    )
}
export default Main;