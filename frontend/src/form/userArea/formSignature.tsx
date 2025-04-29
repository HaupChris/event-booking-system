import React from "react";
import SignaturePad from "../components/signature";
import { FormProps } from "./formContainer";
import { Box, Typography, Paper } from "@mui/material";

function FormSignature(props: FormProps) {
    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="body1" align={"justify"} paragraph>
                    Hiermit bestätige ich, dass ich auf eigene Gefahr am "Weiher Wald und Weltall-Wahn 2025" vom 29.08.2025 bis zum 01.09.2025 teilnehme.
                    Der Veranstalter haftet bei Personen-, Sach- und Vermögensschäden nicht für leichte Fahrlässigkeit. Dies gilt sowohl für eigene Handlungen, als auch für Handlungen
                    seiner Vertreter, Erfüllungsgehilfen oder Dritter, derer sich der Veranstalter im Zusammenhang mit der Durchführung der Veranstaltung bedient.
                </Typography>

                <Typography sx={{ p: 3 }} align="center">
                    Bitte unterschreibe hier:
                </Typography>

                <Box display="flex" justifyContent="center">
                    <SignaturePad
                        currentSignature={props.currentBooking.signature}
                        updateCurrentSignature={(signature: string) => props.updateBooking("signature", signature)}
                    />
                </Box>
            </Paper>
        </Box>
    )
}

export default FormSignature;