// frontend/src/form/artistArea/artistSignature.tsx

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SignaturePad from "../components/signature";
import { ArtistFormProps } from "./artistFormContainer";

function ArtistSignatureForm(props: ArtistFormProps) {
	return (
		<Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
			<Paper elevation={3} sx={{ p: 3 }}>
				<Typography variant="body1" align={"justify"} paragraph>
					Hiermit bestätige ich, dass ich als Künstler/in auf eigene Gefahr am "Weiher Wald und Weltallwahn 2025" vom 29.08.2025 bis zum 01.09.2025 teilnehme. <br/><br/>
					Der Veranstalter haftet bei Personen-, Sach- und Vermögensschäden nicht für leichte Fahrlässigkeit. Dies gilt sowohl für eigene Handlungen, als auch für Handlungen
					seiner Vertreter, Erfüllungsgehilfen oder Dritter, derer sich der Veranstalter im Zusammenhang mit der Durchführung der Veranstaltung bedient.
				</Typography>

				<Typography sx={{ p: 3 }}>
					Bitte unterschreibe hier:
				</Typography>
				<SignaturePad
					currentSignature={props.currentBooking.signature}
					updateCurrentSignature={(signature: string) => props.updateBooking("signature", signature)}
				/>
			</Paper>
		</Box>
	);
}

export default ArtistSignatureForm;