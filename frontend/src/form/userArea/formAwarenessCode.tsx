import React from "react";
import { Box, List, ListItem, ListItemText, Typography, Paper } from "@mui/material";

function FormAwarnessCode() {
  const items = [
    { title: 'Unsere tanzfreudige Gemeinschaft', text: 'Wir feiern in einer Umgebung, in der jeder Mensch frei von jeglichem Rassismus, Sexismus, Ableismus und Queerfeindlichkeit, sowie Gewalt sein kann. Jede Person, die sich nicht an diesen Grundsatz hält, können wir auf unserem Festival nicht willkommen heißen.' },
    { title: 'Gemeinsam und rücksichtsvoll feiern', text: 'Wir hoffen, dass alle unsere Gäste achtsam und respektvoll miteinander umgehen. Bitte sei dir deiner eigenen (Konsum-)Grenzen bewusst und respektiere auch die Grenzen der anderen Festivalbesucher:innen.' },
    { title: 'Unser Sound ist ein Sound der Solidarität', text: 'In unserer Gemeinschaft feiern wir Diversität und stellen uns gegen Diskriminierung, indem wir eine Bühne für vielfältige Perspektiven bieten und uns solidarisch mit denen zeigen, die Diskriminierung erfahren.' },
    { title: 'Einverständnis ist unerlässlich', text: 'Jeder Mensch hat das Recht, seine eigenen Grenzen zu setzen. Bei uns gilt: Nur ein eindeutiges "Ja" ist ein "Ja". Alles andere bedeutet "Nein".' },
    { title: 'Fotos nur mit Herzschlag und Zustimmung', text: 'Bitte denk daran, beim Fotografieren auf die Gefühle der anderen zu achten. Ohne ausdrückliche Zustimmung wird kein Foto gemacht oder geteilt. Wir bitten dich, diese Regel zu respektieren.' }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Unser Bewusstseins-Code für ein gelungenes Festival
        </Typography>

        <List>
          {items.map((item, index) => (
            <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
              <ListItemText
                primary={<Typography variant="h6" color="secondary" component="div" align="center" sx={{ paddingBottom: "0.5em" }}><strong>{item.title}</strong></Typography>}
                secondary={<Typography variant="body1" component="div" align="justify">{item.text}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default FormAwarnessCode;