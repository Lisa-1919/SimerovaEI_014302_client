import { useParams, useNavigate } from "react-router";
import useWebRTC, { LOCAL_VIDEO } from "../../hooks/useWebRTC";
import './room.css';
import { useCallback, useState } from 'react';

function layout(clientsNumber = 1) {
    const pairs = Array.from({ length: clientsNumber })
        .reduce((acc, next, index, arr) => {
            if (index % 2 === 0) {
                acc.push(arr.slice(index, index + 2));
            }

            return acc;
        }, []);

    const rowsNumber = pairs.length;
    const height = `${100 / rowsNumber}%`;

    return pairs.map((row, index, arr) => {

        if (index === arr.length - 1 && row.length === 1) {
            return [{
                width: '100%',
                height,
            }];
        }

        return row.map(() => ({
            width: '50%',
            height,
        }));
    }).flat();
}

export default function Room() {
    let navigate = useNavigate();
    const { id: roomID } = useParams();
    const { clients, provideMediaRef, handleLeave } = useWebRTC(roomID);
    const videoLayout = layout(clients.length);
    const [isCameraOn, setCameraOn] = useState(true);
    const [isMicrophoneOn, setMicrophoneOn] = useState(true);

    const handleProvideMediaRef = useCallback((clientID, instance) => {
        provideMediaRef(clientID, instance);
    }, [provideMediaRef]);

    const handleExitRoom = () => {
        handleLeave();
        navigate('/home');
    };

    const handleToggleCamera = () => {
        setCameraOn(prevState => !prevState);
    };

    const handleToggleMicrophone = () => {
        setMicrophoneOn(prevState => !prevState);
    };

    return (
        <div>
            {clients.map((clientID, index) => {
                return (
                    <div key={clientID} style={videoLayout[index]} id={clientID}>
                        <video
                            width='100%'
                            height='100%'
                            ref={instance => {
                                handleProvideMediaRef(clientID, instance);
                            }}
                            autoPlay
                            playsInline
                            muted={clientID === LOCAL_VIDEO}
                        />
                        {clientID === LOCAL_VIDEO && (
                            <div>
                                <button onClick={handleExitRoom}>
                                    Выйти из комнаты
                                </button>
                                <button onClick={handleToggleCamera}>
                                    {isCameraOn ? 'Выключить камеру' : 'Включить камеру'}
                                </button>
                                <button onClick={handleToggleMicrophone}>
                                    {isMicrophoneOn ? 'Выключить микрофон' : 'Включить микрофон'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}