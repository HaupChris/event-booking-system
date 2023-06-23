import {Typography, Box, List, ListItem, ListItemText, Button} from '@mui/material';
import {Booking, FormContent, TimeSlot, WorkShift} from './interface';
import {jsPDF} from "jspdf";
import {Download} from "@mui/icons-material";
import "../css/formSummary.css";
import {useEffect} from "react";

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
	return array.find(item => item.id === id);
}

function getShiftAndTimeslot(work_shifts: WorkShift[], timeslot_id: number) {
	const shift = work_shifts.find(shift => shift.time_slots.find((slot: TimeSlot) => slot.id === timeslot_id));
	const timeslot = shift?.time_slots.find(slot => slot.id === timeslot_id);
	return {shift, timeslot};
}

interface IProps {
	booking: Booking;
	formContent: FormContent;
	setPdfSummary: (doc: jsPDF) => void;
	pdfSummary: jsPDF;
}

export function generateSummaryPDF(booking: Booking, formContent: FormContent): jsPDF {
	const ticket = findItemById(formContent.ticket_options, booking.ticket_id);
	const beverage = findItemById(formContent.beverage_options, booking.beverage_id);
	const shift_slot_1 = getShiftAndTimeslot(formContent.work_shifts, booking.timeslot_priority_1);
	const shift_slot_2 = getShiftAndTimeslot(formContent.work_shifts, booking.timeslot_priority_2);
	const shift_slot_3 = getShiftAndTimeslot(formContent.work_shifts, booking.timeslot_priority_3);
	const materials = booking.material_ids.map(id => findItemById(formContent.materials, id));
	const personalInfoKeys = ['first_name', 'last_name', 'email', 'phone'];
	const personalInfoValues = ['Vorname', 'Nachname', 'E-Mail', 'Telefon'];

	const doc = new jsPDF();
		let yPos = 10;

		doc.setFontSize(16);
		doc.text('Personal Information:', 10, yPos);
		yPos += 10;

		personalInfoKeys.forEach((key, index) => {
			doc.setFontSize(14);
			doc.text(`${personalInfoValues[index]}: ${booking[key as keyof Booking]}`, 10, yPos);
			yPos += 10;
		});

		doc.setFontSize(16);
		doc.text('Booking Details:', 10, yPos);
		yPos += 10;

		doc.setFontSize(14);
		doc.text(`Teilnahmeoption: ${ticket?.title} - ${ticket?.price}€`, 10, yPos);
		yPos += 10;

		doc.text(`Bier Flatrate: ${beverage !== undefined ? beverage.title + " - " + beverage.price + "€" : "None"}`, 10, yPos);
		yPos += 10;

		doc.text(`Ich bringe mit: ${materials.map(material => material?.title).join(", ")}`, 10, yPos);
		yPos += 10;
		doc.text("Festival Support nach Priorität: ", 10, yPos);
		yPos += 10;
		doc.text(`Höchste: ${shift_slot_1.shift?.title} - ${shift_slot_1.timeslot?.start_time} - ${shift_slot_1.timeslot?.end_time}`, 10, yPos);
		yPos += 10;
		if (shift_slot_2.shift !== undefined) {
			doc.text(`Mittlere: ${shift_slot_2.shift?.title} - ${shift_slot_2.timeslot?.start_time} - ${shift_slot_2.timeslot?.end_time}`, 10, yPos);
			yPos += 10;
		}
		if (shift_slot_3.shift !== undefined) {
			doc.text(`Notnagel: ${shift_slot_3.shift?.title} - ${shift_slot_3.timeslot?.start_time} - ${shift_slot_3.timeslot?.end_time}`, 10, yPos);
			yPos += 10;
		}

		doc.text("Supporter buddy: " + booking.supporter_buddy, 10, yPos);
		yPos += 10;

		doc.text("Deine gewählte Anzahl Schichten: " + booking.amount_shifts, 10, yPos);
		yPos += 10;

		doc.text("Dein Beitrag: " + booking.total_price + "€", 10, yPos);
		yPos += 10;

		doc.text("Zahlungsmethode: https://paypal.me/ChristianHauptmanny", 10, yPos);
		yPos += 10;

		const betreff = `WWWW: ${booking.last_name}, ${booking.first_name} - ${ticket?.title}, ${beverage?.title}`;
		doc.text("Betreff: " + betreff, 10, yPos);

		return doc;
}

function FormSummary(props: IProps) {
	const {
		ticket_id,
		beverage_id,
		timeslot_priority_1,
		timeslot_priority_2,
		timeslot_priority_3,
		material_ids,
		supporter_buddy,
		amount_shifts,
		total_price,

	} = props.booking;
	const ticket = findItemById(props.formContent.ticket_options, ticket_id);
	const beverage = findItemById(props.formContent.beverage_options, beverage_id);
	const shift_slot_1 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_1);
	const shift_slot_2 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_2);
	const shift_slot_3 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_3);
	const materials = material_ids.map(id => findItemById(props.formContent.materials, id));
	const personalInfoKeys = ['first_name', 'last_name', 'email', 'phone'];
	const personalInfoValues = ['Vorname', 'Nachname', 'E-Mail', 'Telefon'];

	useEffect(() => {
		props.setPdfSummary(generateSummaryPDF(props.booking, props.formContent));
	}, [])



	const saveSummary = () => {
		props.pdfSummary.save('booking-summary.pdf');
	}

	return (
		<Box sx={{mt: 3, p: 2, borderRadius: '5px'}}>
			<Button onClick={saveSummary} variant="contained" color="primary">
				Zusammenfassung als PDF herunterladen <Download/>
			</Button>
			<Typography variant="h6" component="div" sx={{mb: 1}}>
				Persönliche Informationen
			</Typography>
			<List dense={true} className={"summary-list-personal"}>

				{/* Personal Details */}
				{Object.keys(props.booking).map((key, index) => {
					if (personalInfoKeys.includes(key)) {
						return (
							<ListItem key={index}>
								<ListItemText
									primary={<Typography variant="subtitle1" component="div">
										<strong>{personalInfoValues[index]}: </strong>{props.booking[key as keyof Booking]}
									</Typography>}
								/>
							</ListItem>
						)
					}
					return null;
				})}
			</List>
			<Typography variant="h6" component="div" sx={{mt: 2, mb: 1}}>
				Buchungsdetails
			</Typography>
			<List className={"summary-list-booking"} dense={true}>

				<ListItem>
					<ListItemText
						primary={<Typography variant="subtitle1" component="div"><strong>Teilnahmeoption:</strong></Typography>}
						secondary={<Typography variant="body1"
											   component="div">{ticket?.title} - {ticket?.price}€</Typography>}
					/>
				</ListItem>
				<ListItem>
					<ListItemText
						primary={<Typography variant="subtitle1"
											 component="div"><strong>Bierflatrate:</strong></Typography>}
						secondary={<Typography variant="body1"
											   component="div">{beverage !== undefined ? beverage.title + " - " + beverage.price + "€" : "Keine"}</Typography>}
					/>
				</ListItem>
				<ListItem>
					<ListItemText
						primary={<Typography variant="subtitle1" component="div"><strong>Support
							Prioritäten:</strong></Typography>}
						secondary={
							<Typography variant="body1" component="div">
								{(shift_slot_1 !== undefined && shift_slot_1.shift !== undefined && shift_slot_1.timeslot !== undefined) ?
									("Höchste: " + shift_slot_1.shift.title + ", " + shift_slot_1.timeslot.title + " " + shift_slot_1.timeslot.start_time + " - " + shift_slot_1.timeslot.end_time)
									: ""}
								<br/>
								{(shift_slot_2 !== undefined && shift_slot_2.shift !== undefined && shift_slot_2.timeslot !== undefined) ?
									("Mittlere: " + shift_slot_2.shift.title + ", " + shift_slot_2.timeslot.title + " " + shift_slot_2.timeslot.start_time + " - " + shift_slot_2.timeslot.end_time)
									: ""}
								<br/>
								{(shift_slot_3 !== undefined && shift_slot_3.shift !== undefined && shift_slot_3.timeslot !== undefined) ?
									("Notnagel: " + shift_slot_3.shift.title + ", " + shift_slot_3.timeslot.title + " " + shift_slot_3.timeslot.start_time + " - " + shift_slot_3.timeslot.end_time)
									: ""}
							</Typography>}
					/>
				</ListItem>
				<ListItem>
					<Typography>Supporter Buddy: {supporter_buddy}
					<br/>
					Deine Anzahl Schichten: {amount_shifts}</Typography>
				</ListItem>
				<ListItem>
					<ListItemText
						primary={<Typography variant="subtitle1"
											 component="div"><strong>Ich bringe mit:</strong></Typography>}
						secondary={
							<Typography variant="body1" component="div">
								{materials.map(material => material?.title).join(', ')}
							</Typography>}
					/>
				</ListItem>
			</List>
			<List>
				<ListItem>
					<ListItemText
						primary={<Typography variant="h6" component="div" color="primary">
							<strong>Dein Beitrag: {total_price}€</strong>
						</Typography>}
					/>
				</ListItem>
			</List>
		</Box>
	)
		;
}

export default FormSummary;
