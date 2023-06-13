import React, {useEffect, useRef, useState} from "react";
import SignatureCanvas from "react-signature-canvas";
// import axios from "axios";
import ReactSignatureCanvas from "react-signature-canvas";
import '../../css/signature.css'

export function SignaturePad() {
	const sigRef = useRef();
	const [signature, setSignature] = useState(null);
	const handleSignatureEnd = () => {
		// @ts-ignore
		setSignature(sigRef.current.toDataURL());
	}
	const clearSignature = () => {
		// @ts-ignore
		sigRef.current.clear();
		setSignature(null);
	}

	useEffect(() => {
		console.log(signature);
	}, [signature]);

	return <div>
		<SignatureCanvas
			penColor="black"
			canvasProps={{className: 'signature-canvas'}}
				// @ts-ignore
			ref={sigRef}
			onEnd={handleSignatureEnd}
		/>
		<button onClick={clearSignature}>Clear</button>
	</div>

}

export default SignaturePad;
