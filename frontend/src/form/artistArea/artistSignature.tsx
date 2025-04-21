// frontend/src/form/artistArea/artistSignature.tsx

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SignaturePad from "../components/signature";
import { ArtistFormProps } from "./artistFormContainer";

function ArtistSignatureForm(props: ArtistFormProps) {
	return (
		<Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
			<Paper elevation={3} sx={{ p: 3 }}>
				<Typography variant="body1" paragraph>
					Hiermit bestätige ich, dass ich als Künstler/in auf eigene Gefahr am "Weiher Wald und Wiesenwahn 2024" vom 29.08.2024 bis zum 01.09.2024 teilnehme.
					Der Veranstalter haftet bei Personen-, Sach- und Vermögensschäden nicht für leichte Fahrlässigkeit. Dies gilt sowohl für eigene Handlungen, als auch für Handlungen
					seiner Vertreter, Erfüllungsgehilfen oder Dritter, derer sich der Veranstalter im Zusammenhang mit der Durchführung der Veranstaltung bedient.
				</Typography>

				<Typography sx={{ p: 3 }}>
					Bitte unterschreibe hier:
				</Typography>
				<SignaturePad
					booking={props.currentBooking}
					updateBooking={props.updateBooking}
				/>
			</Paper>
		</Box>
	);
}

export default ArtistSignatureForm;