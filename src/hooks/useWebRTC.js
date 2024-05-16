import { useCallback, useEffect, useRef, useState } from "react";
import freeice from "freeice";
import socket from "../socket";
import ACTIONS from "../socket/actions";
import useStateWithCallback from "./useStateWithCallback";
import i18n from "../18n";
import axios from 'axios';
import RecordRTC from 'recordrtc';

const translateMessage = async (text, translationLanguage) => {
    try {
        const response = await axios.post('http://localhost:5000/translate-message', {
            text,
            translationLanguage,
        });
        return response.data.translatedMessage;
    } catch (error) {
        return text;
    }
};

export const LOCAL_VIDEO = 'LOCAL_VIDEO';
export default function useWebRTC(roomID) {
    const [clients, updateClients] = useStateWithCallback([]);
    const [isCameraOn, setCameraOn] = useState(true);
    const [isMicrophoneOn, setMicrophoneOn] = useState(true);
    const [messages, setMessages] = useState([]);
    const translationLanguage= useState(i18n.language);
    const [secondParticipantInfo, setSecondParticipantInfo] = useState(null);
    const addNewClient = useCallback((newClient, cb) => {
        updateClients(list => {
            if (!list.includes(newClient)) {
                return [...list, newClient]
            }

            return list;
        }, cb);
    }, [clients, updateClients]);

    const peerConnections = useRef({});
    const localMediaStream = useRef(null);
    const peerMediaElements = useRef({
        [LOCAL_VIDEO]: null,
    });

    const toggleCamera = useCallback(() => {
        setCameraOn(prevState => {
            const videoTrack = localMediaStream.current.getVideoTracks()[0];
            videoTrack.enabled = !prevState;
            return !prevState;
        });
    }, []);

    const toggleMicrophone = useCallback(() => {
        setMicrophoneOn(prevState => {
            const audioTrack = localMediaStream.current.getAudioTracks()[0];
            audioTrack.enabled = !prevState;
            return !prevState;
        });
    }, []);

    const sendMessage = useCallback(async (message) => {
        Object.keys(peerConnections.current).forEach((peerID) => {
            const dataChannel = peerConnections.current[peerID].dataChannel;
            if (dataChannel) {
                dataChannel.send(JSON.stringify(message));
            }
        });
        setMessages((prevMessages) => [...prevMessages, message]);
    }, []);

    const handleIncomingMessage = useCallback(async (message) => {
        const messageJSON = JSON.parse(message);
        const translatedMessage = await translateMessage(messageJSON.text, translationLanguage);
        if (translatedMessage) {
            messageJSON.text = translatedMessage;
            setMessages(prevMessages => [...prevMessages, messageJSON]);
        }
    }, [translationLanguage]);


    useEffect(() => {
        async function handleNewPeer({ peerID, createOffer }) {
            if (peerID in peerConnections.current) {
                return console.warn(`Already connected to peer ${peerID}`);
            }

            peerConnections.current[peerID] = new RTCPeerConnection({
                iceServers: freeice(),
            });

            peerConnections.current[peerID].onicecandidate = event => {
                if (event.candidate) {
                    socket.emit(ACTIONS.RELAY_ICE, {
                        peerID,
                        iceCandidate: event.candidate,
                    });
                }
            }
            const dataChannel = peerConnections.current[peerID].createDataChannel('chat');
            peerConnections.current[peerID].dataChannel = dataChannel;

            dataChannel.onopen = () => {
                console.log('Data channel is open');
            };

            dataChannel.onmessage = (event) => {
                handleIncomingMessage(event.data);
            };
            peerConnections.current[peerID].ondatachannel = (event) => {
                const receiveChannel = event.channel;
                receiveChannel.onmessage = (event) => {
                    handleIncomingMessage(event.data);
                };
            };
            let tracksNumber = 0;

            let recorder;
            let recordingInterval;
            let incomingStream = null;
            
            function startRecording(stream) {
                let audioStream = new MediaStream(stream.getAudioTracks());
                incomingStream = audioStream;
                recorder = RecordRTC(incomingStream, {type:'audio', recorderType: RecordRTC.StereoAudioRecorder});
                recorder.startRecording();
                recordingInterval = setInterval(stopRecording, 10000);
            }
            
            async function stopRecording() {
                recorder.stopRecording(async function() {
                    let blob = recorder.getBlob();
                    let formData = new FormData();
                    formData.append('audio', blob);
                    formData.append('translationLanguage', translationLanguage);
                    const response = await fetch('http://localhost:5000/generate-subtitles', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    console.log(data.subtitles);
                    startRecording(incomingStream);
                });
            }
            peerConnections.current[peerID].ontrack = ({ streams: [remoteStream] }) => {
                tracksNumber++
                if (tracksNumber === 2) {
                    tracksNumber = 0;
                    addNewClient(peerID, () => {
                        if (peerMediaElements.current[peerID]) {
                            peerMediaElements.current[peerID].srcObject = remoteStream;
                        } else {
                            let settled = false;
                            const interval = setInterval(() => {
                                if (peerMediaElements.current[peerID]) {
                                    peerMediaElements.current[peerID].srcObject = remoteStream;
                                    settled = true;
                                }

                                if (settled) {
                                    clearInterval(interval);
                                }
                            }, 1000);
                        }
                    });

                }
                console.log(remoteStream.getAudioTracks());
                startRecording(remoteStream);
            }
            localMediaStream.current.getTracks().forEach(track => {
                peerConnections.current[peerID].addTrack(track, localMediaStream.current);
            });
            if (createOffer) {
                const offer = await peerConnections.current[peerID].createOffer();
                await peerConnections.current[peerID].setLocalDescription(offer);
                socket.emit(ACTIONS.RELAY_SDP, {
                    peerID,
                    sessionDescription: offer,
                });
                setSecondParticipantInfo(peerID);
            }
        }
        socket.on(ACTIONS.ADD_PEER, handleNewPeer);
        return () => {
            socket.off(ACTIONS.ADD_PEER);
        }
    }, []);

    useEffect(() => {
        async function setRemoteMedia({ peerID, sessionDescription: remoteDescription }) {
            await peerConnections.current[peerID]?.setRemoteDescription(
                new RTCSessionDescription(remoteDescription)
            );
            if (remoteDescription.type === 'offer') {
                const answer = await peerConnections.current[peerID].createAnswer();
                await peerConnections.current[peerID].setLocalDescription(answer);
                socket.emit(ACTIONS.RELAY_SDP, {
                    peerID,
                    sessionDescription: answer,
                });
            }
        }
        socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia)
        return () => {
            socket.off(ACTIONS.SESSION_DESCRIPTION);
        }
    }, []);

    useEffect(() => {
        socket.on(ACTIONS.ICE_CANDIDATE, ({ peerID, iceCandidate }) => {
            peerConnections.current[peerID]?.addIceCandidate(
                new RTCIceCandidate(iceCandidate)
            );
        });

        return () => {
            socket.off(ACTIONS.ICE_CANDIDATE);
        }
    }, []);

    useEffect(() => {
        const handleRemovePeer = ({ peerID }) => {
            if (peerConnections.current[peerID]) {
                peerConnections.current[peerID].close();
            }
            delete peerConnections.current[peerID];
            delete peerMediaElements.current[peerID]
            updateClients(list => list.filter(c => c !== peerID));
        };

        socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
        return () => {
            socket.off(ACTIONS.REMOVE_PEER);
        }
    }, []);

    useEffect(() => {
        async function startCapture() {
            try {
                localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: {
                        width: 1200,
                        height: 720
                    }
                });

            } catch (err) {
                console.error("Error capturing local stream", err);
                return;
            }
            addNewClient(LOCAL_VIDEO, () => {
                const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];
                if (localVideoElement) {
                    localVideoElement.volume = 0;
                    localVideoElement.srcObject = localMediaStream.current;
                }
            });
        }

        startCapture()
            .then(() => socket.emit(ACTIONS.JOIN, { room: roomID }))
            .catch(e => console.error('Error getting userMedia:', e));

        return () => {
            if (localMediaStream.current) {
                localMediaStream.current.getTracks().forEach(track => track.stop());
                socket.emit(ACTIONS.LEAVE);
            }
        };
    }, [roomID]);

    const provideMediaRef = useCallback((id, node) => {
        peerMediaElements.current[id] = node;
    }, []);

    const handleLeave = useCallback(() => {
        if (localMediaStream.current) {
            localMediaStream.current.getTracks().forEach(track => track.stop());
        }
        socket.emit(ACTIONS.LEAVE);
    }, []);

    useEffect(() => {
        socket.on(ACTIONS.RECEIVE_MESSAGE, handleIncomingMessage);

        return () => {
            socket.off(ACTIONS.RECEIVE_MESSAGE);
        }
    }, []);

    return {
        clients,
        provideMediaRef,
        handleLeave,
        toggleCamera,
        toggleMicrophone,
        messages,
        sendMessage,
    };
}