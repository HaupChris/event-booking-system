import React, {useRef, useEffect, useState} from 'react';
import {Box, Button, Typography} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import {Booking} from "../interface";
import '../../css/signature.css';
import CustomSignaturePad from "./customSignaturePad";

interface IProps {
	updateBooking: (key: keyof Booking, value: any) => void;
	booking: Booking;
}

export function SignaturePad(props: IProps) {
    const sigRef = useRef<SignatureCanvas | null>(null);
    const [signature, setSignature] = useState<string | null>(null);

    // Draw existing signature when the component mounts
    useEffect(() => {
        if (!props.booking.signature) return;
        const canvas = sigRef.current?.getCanvas();
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.onload = () => {
			const width = canvas ? canvas.width : 0;
			const height = canvas ? canvas.height : 0;
            ctx.clearRect(0, 0, width, height);  // Clear the canvas
            ctx.drawImage(img, 0, 0);  // Draw the image
        };
        img.src = props.booking.signature;
    }, [props.booking.signature]);

    useEffect(() => {
        const canvas = sigRef.current?.getCanvas();
        if (!canvas) return;

        const preventScroll = (event: TouchEvent) => {
            event.preventDefault();
        };

        canvas.addEventListener('touchstart', preventScroll);
        canvas.addEventListener('touchmove', preventScroll);

        // Clean up the event listeners when the component unmounts
        return () => {
            canvas.removeEventListener('touchstart', preventScroll);
            canvas.removeEventListener('touchmove', preventScroll);
        };
    }, [sigRef]);

    const preventScroll = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
    };

    // const handleSignatureEnd = (event: MouseEvent) => {
    //     // preventScroll(event);
    //     if (!sigRef.current) return;
    //     const signatureDataURL = sigRef.current.toDataURL();
    //     props.updateBooking("signature", signatureDataURL);
    // };

    const handleSignatureEnd = (signatureURL: string) => {
        props.updateBooking("signature", signatureURL);
    }

    const clearSignature = () => {
        props.updateBooking("signature", "");
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
            {/*<SignatureCanvas*/}
            {/*    penColor="#eac764"*/}
            {/*    canvasProps={{className: 'signature-canvas'}}*/}
            {/*    ref={sigRef}*/}
            {/*    onEnd={(event) => handleSignatureEnd(event)}*/}
            {/*    on*/}
            {/*    clearOnResize={false}*/}

            {/*    // onBegin={preventScroll}*/}

            {/*/>*/}
            <CustomSignaturePad
                penColor="#eac764"
                existingSignature={props.booking.signature}
                onEnd={(signatureURL) => handleSignatureEnd(signatureURL)}
                clearOnResize={false}
            />
            <Button onClick={clearSignature}>Löschen</Button>
        </Box>
    );
}

export default SignaturePad;