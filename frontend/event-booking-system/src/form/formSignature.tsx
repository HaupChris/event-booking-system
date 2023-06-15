import SignaturePad from "./components/signature";
import {FormProps} from "./formContainer";
import {Box, Typography} from "@mui/material";

export function FormSignature(props: FormProps) {
	return (
		<Box sx={{display: 'flex', 'flex-direction': 'column', 'align-items': 'center', 'justify-content': 'center', }}>
			<Typography>
				Hiermit bestätige ich, dass ich auf eigene Gefahr am "Weiher Wald und Wiesenwahn 2023" vom 24.08.2023 bis zum 27.08.2023 teilnehme.
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