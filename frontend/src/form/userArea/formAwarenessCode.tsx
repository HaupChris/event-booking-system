import {Box, List, ListItem, ListItemText, Typography} from "@mui/material";


function FormAwarnessCode() {
  const items = [
    { title: 'Unsere tanzfreudige Gemeinschaft', text: 'Wir feiern in einer Umgebung, in der jeder Mensch frei von jeglichem Rassismus, Sexismus, Ableismus und Queerfeindlichkeit, sowie Gewalt sein kann. Jede Person, die sich nicht an diesen Grundsatz hält, können wir auf unserem Festival nicht willkommen heißen.' },
    { title: 'Gemeinsam und rücksichtsvoll feiern', text: 'Wir hoffen, dass alle unsere Gäste achtsam und respektvoll miteinander umgehen. Bitte sei dir deiner eigenen (Konsum-)Grenzen bewusst und respektiere auch die Grenzen der anderen Festivalbesucher:innen.' },
    { title: 'Unser Sound ist ein Sound der Solidarität', text: 'In unserer Gemeinschaft feiern wir Diversität und stellen uns gegen Diskriminierung, indem wir eine Bühne für vielfältige Perspektiven bieten und uns solidarisch mit denen zeigen, die Diskriminierung erfahren.' },
    { title: 'Einverständnis ist unerlässlich', text: 'Jeder Mensch hat das Recht, seine eigenen Grenzen zu setzen. Bei uns gilt: Nur ein eindeutiges "Ja" ist ein "Ja". Alles andere bedeutet "Nein".' },
    { title: 'Fotos nur mit Herzschlag und Zustimmung', text: 'Bitte denk daran, beim Fotografieren auf die Gefühle der anderen zu achten. Ohne ausdrückliche Zustimmung wird kein Foto gemacht oder geteilt. Wir bitten dich, diese Regel zu respektieren.' }
  ];

  return (
    <Box sx={{mt: 3, p: 2, borderRadius: '5px'}}>
      <List>
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={<Typography variant="subtitle1" color={"secondary"} component="div"><strong>{item.title}</strong></Typography>}
              secondary={<Typography variant="body1" component="div">{item.text}</Typography>}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default FormAwarnessCode;
