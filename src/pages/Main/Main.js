import { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';
import Header from '../../components/Header/header';
import { useTranslation } from "react-i18next";
import './main.scss';
import AuthService from '../../services/auth.server';
import Photo from '../../components/Photo/Photo';
import CallHistory from '../../components/CallHistory/CallHistory';
import { ThemeContext, themes } from '../../contexts/ThemeContext';
import Toggle from '../../components/Toggle/Toggle';

function Main() {
    let navigate = useNavigate();
    const [room_id, setRoomId] = useState("");
    const rootNode = useRef();
    const { t } = useTranslation();
    const user = AuthService.getCurrentUser();
    return (
        <div>
            <Header />
            <div className='main'>
                <div className='user-info'>
                    <Photo userImageUrl={user.imageUrl} />
                    <div className='text'>
                        <p className='username'>{user.username}</p>
                        <p className='email'>{user.email}</p>
                    </div>
                </div>
                <div className='room_actions'>
                    <div ref={rootNode}>
                        <div className='join'>
                            <input type='text' value={room_id} onChange={(e) => setRoomId(e.target.value)} placeholder={t("room_id")}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        navigate(`/room/${room_id}`);
                                    }
                                }}
                                className="input" />
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
                <CallHistory calls={user.callHistoryList} className='call-history'/>
            </div>
        </div>
    )
}
export default Main;