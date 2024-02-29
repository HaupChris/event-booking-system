import React, {useRef, useEffect} from 'react';

interface SignaturePadProps {
	onEnd?: (dataURL: string) => void;
	penColor?: string;
	clearOnResize?: boolean;
	existingSignature?: string;
}

function CustomSignaturePad(props: SignaturePadProps) {
	const penColor = props.penColor || 'black';
	const clearOnResize = props.clearOnResize || false;

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	let ctx: CanvasRenderingContext2D | undefined | null = undefined;
	const drawing = useRef(false);

	const handleStart = (clientX: number, clientY: number) => {
		if (!canvasRef.current) return;
		const rect = canvasRef.current.getBoundingClientRect();
		const x = (clientX - rect.left) * (canvasRef.current.width / rect.width);
		const y = (clientY - rect.top) * (canvasRef.current.height / rect.height);
		drawing.current = true;
		// onBegin?.();
		ctx?.moveTo(x, y);
	};

	const handleMove = (clientX: number, clientY: number) => {
		if (!drawing.current) return;
		if (!canvasRef.current) return;
		const rect = canvasRef.current.getBoundingClientRect();
		const x = (clientX - rect.left) * (canvasRef.current.width / rect.width);
		const y = (clientY - rect.top) * (canvasRef.current.height / rect.height);
		ctx?.lineTo(x, y);
		ctx?.stroke();
	};


	const handleEnd = () => {
		console.log("handleEnd");
		drawing.current = false;
		if (!ctx || !canvasRef.current || typeof props.onEnd !== 'function') return;
		const dataURL = canvasRef.current.toDataURL();
		console.log(dataURL);
		props.onEnd(dataURL);
	};

	// Draw existing signature when the component mounts
	useEffect(() => {
		const canvas = canvasRef.current;
		ctx = canvas?.getContext('2d');
		if (!ctx) return;

		// Clear the canvas
		const width = canvas ? canvas.width : 0;
		const height = canvas ? canvas.height : 0;
		ctx.clearRect(0, 0, width, height);

		// Start a new path
		ctx.beginPath();

		if (!props.existingSignature) return; // Don't try to draw if the signature is empty

		// Draw the image
		const img = new Image();
		img.onload = () => {
			ctx?.drawImage(img, 0, 0);
		};
		img.src = props.existingSignature;
	}, [props.existingSignature]);


	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.strokeStyle = penColor;
		ctx.lineJoin = "round";
		ctx.lineWidth = 2;

		// Handle normal mouse events
		const handleMouseDown = (event: MouseEvent) => {
			drawing.current = true;
			handleStart(event.clientX, event.clientY);
		};

		const handleMouseMove = (event: MouseEvent) => {
			if (!drawing.current) return;
			handleMove(event.clientX, event.clientY);
		};

		canvas.addEventListener("mousedown", handleMouseDown);
		canvas.addEventListener("mousemove", handleMouseMove);
		canvas.addEventListener("mouseup", handleEnd);
		canvas.addEventListener("mouseleave", handleEnd);

		// Handle touch events
		const handleTouchStart = (event: TouchEvent) => {
			const touch = event.touches[0];
			handleStart(touch.clientX, touch.clientY);
			event.preventDefault();
		};

		const handleTouchMove = (event: TouchEvent) => {
			const touch = event.touches[0];
			handleMove(touch.clientX, touch.clientY);
			event.preventDefault();
		};

		canvas.addEventListener("touchstart", handleTouchStart, {passive: false});
		canvas.addEventListener("touchmove", handleTouchMove, {passive: false});
		canvas.addEventListener("touchend", handleEnd);

		// Handle window resize
		if (clearOnResize) {
			window.addEventListener("resize", () => {
				canvas.width = canvas.clientWidth;
				canvas.height = canvas.clientHeight;
				ctx?.clearRect(0, 0, canvas.width, canvas.height);
			});
		}

		// Clean up on unmount
		return () => {
			canvas.removeEventListener("mousedown", handleMouseDown);
			canvas.removeEventListener("mousemove", handleMouseMove);
			canvas.removeEventListener("mouseup", handleEnd);
			canvas.removeEventListener("mouseleave", handleEnd);

			canvas.removeEventListener("touchstart", handleTouchStart);
			canvas.removeEventListener("touchmove", handleTouchMove);
			canvas.removeEventListener("touchend", handleEnd);

			if (clearOnResize) {
				window.removeEventListener("resize", handleEnd);
			}
		};
	}, [props.onEnd, penColor, clearOnResize]);


	return (
		<canvas
			ref={canvasRef}
			style={{
				touchAction: "none",
				width: '300px',
				height: '200px',
				border: '1px solid #eac764',
				borderRadius: '10px'
			}} // To ensure that page scrolling is not triggered by touch events on the canvas
			width={300}
			height={200}
		/>
	);
};

export default CustomSignaturePad;
