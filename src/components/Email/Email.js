
import * as React from 'react';
import { Html } from '@react-email/html';
import { Button } from '@react-email/button';

export function Email(props) {
const { url } = props.url;
const { roomID } = props.roomID;
return (
    <Html lang="en">
    <Button href={url}>Join to the room: {roomID}</Button>
    </Html>
    );
}