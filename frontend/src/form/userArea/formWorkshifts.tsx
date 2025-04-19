import { FormProps } from "./formContainer";
import React, { useEffect, useState } from "react";
import WorkShift from "../components/workShift";
import {
  Box,
  ClickAwayListener,
  Divider,
  FormControl,
  IconButton,
  List,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import Avatar from "@mui/material/Avatar";
import { Info } from "@mui/icons-material";
import { PRIORITIES } from "./constants";

import '../../css/workShift.css';

import jellyfish_1 from "../../img/jellyfish_1.png";
import jellyfish_2 from "../../img/jellyfish_2.png";
import jellyfish_3 from "../../img/jellyfish_3.png";
import { TimeSlot } from "./interface";

const CustomDivider = styled(Divider)(({ theme }) => ({
  margin: "32px 0",
  width: "100%",
  borderColor: theme.palette.primary.main,
  borderWidth: "2px",
}));

function WorkShiftForm(props: FormProps) {
  const [availablePriorities, setAvailablePriorities] = useState<string[]>([
    PRIORITIES.FIRST,
    PRIORITIES.SECOND,
    PRIORITIES.THIRD,
    "",
  ]);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipNumShiftsOpen, setTooltipNumShiftsOpen] = useState(false);
  const [imageClass, setImageClass] = useState("jellyfish");
  const [supporterBuddyFirstName, setSupporterBuddyFirstName] = useState(props.currentBooking.supporter_buddy.split(" ")[0]);
  const [supporterBuddyLastName, setSupporterBuddyLastName] = useState(props.currentBooking.supporter_buddy.split(" ")[1] || "");

  useEffect(() => {
    console.log(supporterBuddyFirstName);
    console.log(supporterBuddyLastName);

    props.updateBooking("supporter_buddy", supporterBuddyFirstName + " " + supporterBuddyLastName);
  }, [supporterBuddyFirstName, supporterBuddyLastName]);

  useEffect(() => {
    updateAvailablePriorities();
  }, [
    props.currentBooking.timeslot_priority_1,
    props.currentBooking.timeslot_priority_2,
    props.currentBooking.timeslot_priority_3,
  ]);

  useEffect(() => {
    setImageClass("jellyfish gelatine");
    const timer = setTimeout(() => {
      setImageClass("jellyfish");
    }, 1000);
    return () => clearTimeout(timer);
  }, [props.currentBooking.amount_shifts]);

  function updateAvailablePriorities() {
    let availablePriorities = [
      PRIORITIES.FIRST,
      PRIORITIES.SECOND,
      PRIORITIES.THIRD,
    ];
    if (props.currentBooking.timeslot_priority_1 !== -1) {
      availablePriorities.splice(
        availablePriorities.indexOf(PRIORITIES.FIRST),
        1
      );
    }
    if (props.currentBooking.timeslot_priority_2 !== -1) {
      availablePriorities.splice(
        availablePriorities.indexOf(PRIORITIES.SECOND),
        1
      );
    }
    if (props.currentBooking.timeslot_priority_3 !== -1) {
      availablePriorities.splice(
        availablePriorities.indexOf(PRIORITIES.THIRD),
        1
      );
    }

    setAvailablePriorities(availablePriorities);
  }

  const renderJellyfishImage = () => {
    switch (props.currentBooking.amount_shifts) {
      case 1:
        return (
          <Avatar
            className={imageClass}
            sx={{ width: 56, height: 56 }}
            src={jellyfish_1}
            alt="Moderately Happy Jellyfish"
          />
        );
      case 2:
        return (
          <Avatar
            className={imageClass}
            sx={{ width: 56, height: 56 }}
            src={jellyfish_2}
            alt="Happy Jellyfish"
          />
        );
      case 3:
        return (
          <Avatar
            className={imageClass}
            sx={{ width: 56, height: 56 }}
            src={jellyfish_3}
            alt="Very Happy Jellyfish"
          />
        );
      default:
        return (
          <Avatar
            className={imageClass}
            sx={{ width: 56, height: 56 }}
            src={jellyfish_1}
            alt="Moderately Happy Jellyfish"
          />
        );
    }
  };

  const infoText = `Wir sind ein nicht kommerzielles Event. 
Jeder Teilnehmer*in übernimmt mindestens eine Schicht. Bitte gib uns drei Prioritäten: 
<ul>
<li><u>${PRIORITIES.FIRST}</u></li>
<li><u>${PRIORITIES.SECOND}</u> und</li>
<li> <u>${PRIORITIES.THIRD}</u></li>
</ul>

Nach der Anmeldungsphase planen wir die Schichten und versuchen, alle Vorlieben zu berücksichtigen.<br/><br/>
Solltest du mehr als eine Schicht übernehmen wollen, teile uns bitte die Anzahl mit. Vielen Dank für deine Unterstützung!`;

  const numShiftsHelperText = `Wähle, ob du eine, zwei oder drei Schichten übernehmen möchtest. Anhand deiner Prioritäten bekommst du dann mehrere Schichten zugeteilt.<br/><br/>`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "90vw",
      }}
    >
      <Typography variant="subtitle1" component="div" style={{paddingTop: "1em"}}>
        Wir freuen uns, wenn du uns bei einer Supportschicht unterstützen
        könntest! Wähle bitte <u>drei</u> Prioritäten aus:
        <ul>
          <li><u>{PRIORITIES.FIRST}</u>,</li>
          <li><u>{PRIORITIES.SECOND}</u> und</li>
          <li><u>{PRIORITIES.THIRD}</u>.</li>
        </ul>
        Links neben jeder Schicht stehen zwei Zahlen. Die erste zeigt, wie viele
        Astronaut:innen schon dabei, die zweite wie viele wir insgesamt brauchen.{" "}
        <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
          <span style={{ display: "inline-block", verticalAlign: "middle" }}>
            <Tooltip
              title={<span dangerouslySetInnerHTML={{ __html: infoText }} />}
              PopperProps={{
                disablePortal: true,
              }}
              onClose={() => setTooltipOpen(false)}
              open={tooltipOpen}
              disableFocusListener
              enterTouchDelay={0}
            >
              <IconButton
                color="secondary"
                onClick={() => setTooltipOpen(true)}
                style={{ padding: 0, marginLeft: 4, verticalAlign: "middle" }}
              >
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          </span>
        </ClickAwayListener>
      </Typography>

      <CustomDivider />

      <Typography variant="h6" align={"center"}>
        Wie viele Schichten möchtest du maximal übernehmen?{" "}
        <ClickAwayListener onClickAway={() => setTooltipNumShiftsOpen(false)}>
          <span style={{ display: "inline-block", verticalAlign: "middle" }}>
            <Tooltip
              title={
                <span dangerouslySetInnerHTML={{ __html: numShiftsHelperText }} />
              }
              PopperProps={{
                disablePortal: true,
              }}
              onClose={() => setTooltipNumShiftsOpen(false)}
              open={tooltipNumShiftsOpen}
              disableFocusListener
              enterTouchDelay={0}
            >
              <IconButton
                color="secondary"
                onClick={() => setTooltipNumShiftsOpen(true)}
                style={{ padding: 0, marginLeft: 4, verticalAlign: "middle" }}
              >
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          </span>
        </ClickAwayListener>
      </Typography>
      <FormControl
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "95%",
          marginTop: "16px",
          marginBottom: "8px",
        }}
      >
        <div style={{ paddingRight: "1em" }}>{renderJellyfishImage()}</div>
        <Select
          sx={{ ml: 1, minWidth: "70%" }}
          variant={"filled"}
          label="Anzahl Schichten"
          labelId="shift-select-label"
          id="shift-select"
          value={props.currentBooking.amount_shifts}
          onChange={(e) =>
            props.updateBooking("amount_shifts", e.target.value as number)
          }
        >
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
        </Select>
      </FormControl>

      <CustomDivider/>
      <Typography align={"center"} variant="h6">Mit wem möchtest du zusammen arbeiten?</Typography>
      <FormControl
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "90%",
          marginTop: "16px",
          marginBottom: "8px",
        }}
      >
        <TextField
          sx={{ mt: "8px", width: "90%" }}
          error={!!props.formValidation.supporter_buddy}
          variant="outlined"
          margin="normal"
          id="supporter-buddy"
          label="Vorname"
          name="first_name"
          value={supporterBuddyFirstName}
          onChange={(e) => setSupporterBuddyFirstName(e.target.value)}
        />
        <TextField
          sx={{ mt: "8px", width: "90%" }}
          error={!!props.formValidation.supporter_buddy}
          variant="outlined"
          margin="normal"
          id="supporter-buddy"
          label="Nachname"
          name="last_name"
          value={supporterBuddyLastName}
          onChange={(e) => setSupporterBuddyLastName(e.target.value)}
        />
      </FormControl>

      <CustomDivider/>
      <List>
        {props.formContent.work_shifts
          .sort((shift_a, shift_b) => {
            const shift_a_workers = shift_a.time_slots.reduce(
              (sum: number, timeslot: TimeSlot) =>
                sum + timeslot.num_needed - timeslot.num_booked,
              0
            );
            const shift_b_workers = shift_b.time_slots.reduce(
              (sum: number, timeslot: TimeSlot) =>
                sum + timeslot.num_needed - timeslot.num_booked,
              0
            );
            if (shift_a_workers > shift_b_workers) {
              return -1;
            }
            if (shift_a_workers < shift_b_workers) {
              return 1;
            }
            return 0;
          })
          .map((workShift, index) => (
            <React.Fragment key={workShift.id}>
              <WorkShift
                workShift={workShift}
                availablePriorities={availablePriorities}
                currentBooking={props.currentBooking}
                updateBooking={props.updateBooking}
              />
              <CustomDivider
                style={{
                  display: index >= props.formContent.work_shifts.length - 1 ? "None" : "",
                }}
              />
            </React.Fragment>
          ))}
      </List>
    </Box>
  );
}

export default WorkShiftForm;
