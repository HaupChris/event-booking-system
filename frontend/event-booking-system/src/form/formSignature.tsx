import SignaturePad from "./components/signature";
import {FormProps} from "./formContainer";

export function FormSignature(props: FormProps) {
	return (
		<div>
			<h1>FormSignature</h1>
			<SignaturePad />
		</div>
	)
}