import SignaturePad from "../components/signature";
import {FormProps} from "./formContainer";
import {Box, Typography} from "@mui/material";

function FormSignature(props: FormProps) {
	return (
		<Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
			<Typography>
				Hiermit bestätige ich, dass ich auf eigene Gefahr am "Weiher Wald und Wiesenwahn 2024" vom 29.08.2024 bis zum 01.09.2024 teilnehme.
				Der Veranstalter haftet bei Personen-, Sach- und Vermögensschäden nicht für leichte Fahrlässigkeit. Dies gilt sowohl für eigene Handlungen, als auch für Handlungen
				seiner Vertreter, Erfüllungsgehilfen oder Dritter, derer sich der Veranstalter im Zusammenhang mit der Durchführung der Veranstaltung bedient.
			</Typography>

			<Typography sx={{p: 3}}>
				Bitte unterschreibe hier:
			</Typography>
			<SignaturePad booking={props.currentBooking} updateBooking={props.updateBooking} />
		</Box>
	)
}

export default FormSignature;
