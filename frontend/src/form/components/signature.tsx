import React, {useRef, useEffect, useState} from 'react';
import {Box, Button} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import '../../css/signature.css';
import CustomSignaturePad from "./customSignaturePad";
import {spaceTheme} from "../../App";


interface IProps {
	updateCurrentSignature: (signature: string) => void;
	currentSignature: string
}

export function SignaturePad(props: IProps) {
    const sigRef = useRef<SignatureCanvas | null>(null);
    const [signature, setSignature] = useState<string | null>(null);

    // Draw existing signature when the component mounts
    useEffect(() => {
        if (!props.currentSignature) return;
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
        img.src = props.currentSignature;
    }, [props.currentSignature]);

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

    
    const handleSignatureEnd = (signatureURL: string) => {
        props.updateCurrentSignature(signatureURL);
    }

    const clearSignature = () => {
        props.updateCurrentSignature("");
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <CustomSignaturePad
                penColor={spaceTheme.palette.primary.main}
                existingSignature={props.currentSignature}
                onEnd={(signatureURL) => handleSignatureEnd(signatureURL)}
                clearOnResize={false}
            />
            <Button color={"primary"} onClick={clearSignature}>Löschen</Button>
        </Box>
    );
}

export default SignaturePad;