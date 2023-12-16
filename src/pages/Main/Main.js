import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';
import Header from '../../components/Header/header';
import { useTranslation } from "react-i18next";
import './main.css';
import authServer from '../../services/auth.server';
import Photo from '../../components/Photo/Photo';



function Main() {
    let navigate = useNavigate();
    const [room_id, setRoomId] = useState("");
    const rootNode = useRef();
    const { t } = useTranslation();
    const user = authServer.getCurrentUser();

    return (
        <div>
            <Header />
            <div className='main'>
                {/* <div className='user-info'>
                    <Photo />
                    <div className='text'>
                        <p className='user-data-text'>{user.username}</p>
                        <p className='user-data-text'>{user.email}</p>
                    </div>
                </div> */}

                <div className='room_actions'>

                    <div ref={rootNode}>
                        <div className='join'>
                            <input type='text' value={room_id} onChange={(e) => setRoomId(e.target.value)} placeholder={t("room_id")} />
                            <button className='btn' onClick={() => {
                                navigate(`/room/${room_id}`);
                            }}>{t("join_room")}</button>
                        </div>
                        <div className='create'>
                            <button className='btn' onClick={() => {
                                navigate(`/room/${v4()}`);
                            }}>
                                {t("create_room")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Main;