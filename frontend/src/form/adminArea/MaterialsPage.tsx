import React, {useState} from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Modal,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Button,
    Tabs,
    Tab,
} from '@mui/material';
import {useFetchData} from './useFetchData'; // Adjust the path as needed
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ListItemButton from "@mui/material/ListItemButton";

const MaterialsPage: React.FC = () => {
    const {bookings, formContent} = useFetchData();
    const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
    const [openMaterialModal, setOpenMaterialModal] = useState(false);
    const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
    const [materialSortOrder, setMaterialSortOrder] = useState<'asc' | 'desc'>('asc');
    const [peopleSortOrder, setPeopleSortOrder] = useState<'asc' | 'desc'>('asc');
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

    const handleOpenMaterialModal = (materialId: number) => {
        setSelectedMaterial(materialId);
        setOpenMaterialModal(true);
    };

    const handleCloseMaterialModal = () => {
        setOpenMaterialModal(false);
        setSelectedMaterial(null);
    };

    const getOptionTitle = (id: number, options: { id: number; title: string }[]) => {
        const option = options.find(option => option.id === id);
        return option ? option.title : 'Unknown';
    };

    const getUsersForMaterial = (materialId: number) => {
        return bookings.filter(booking => booking.material_ids.includes(materialId)).map(booking => ({
            first_name: booking.first_name,
            last_name: booking.last_name
        }));
    };

    const getMaterialCount = (materialId: number) => {
        return bookings.reduce((count, booking) => {
            return count + (booking.material_ids.includes(materialId) ? 1 : 0);
        }, 0);
    };

    const getMaterialsForUser = (user: { first_name: string, last_name: string }) => {
        const userBookings = bookings.filter(booking => booking.first_name === user.first_name && booking.last_name === user.last_name);
        const materialIds = userBookings.flatMap(booking => booking.material_ids);
        return formContent.materials.filter(material => materialIds.includes(material.id));
    };

    const togglePersonExpanded = (personName: string) => {
        setExpandedPerson(expandedPerson === personName ? null : personName);
    };

    const sortedMaterials = [...formContent.materials].sort((a, b) => {
        const progressA = getMaterialCount(a.id) / a.num_needed;
        const progressB = getMaterialCount(b.id) / b.num_needed;
        return materialSortOrder === 'asc' ? progressA - progressB : progressB - progressA;
    });

    return (
        <Box>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab label="Material Overview" sx={{ fontWeight: 'bold' }} />
                <Tab label="People Overview" sx={{ fontWeight: 'bold'}}/>
            </Tabs>
            {tabValue === 0 && (
                <>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setMaterialSortOrder(materialSortOrder === 'asc' ? 'desc' : 'asc')}
                            startIcon={materialSortOrder === 'asc' ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                        >
                            {materialSortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>
                    </Box>
                    <TableContainer component={Paper} sx={{marginBottom: 4}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Material</TableCell>
                                    <TableCell>Progress</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedMaterials.map((material) => {
                                    const bookedCount = getMaterialCount(material.id);
                                    const progress = (bookedCount / material.num_needed) * 100;
                                    return (
                                        <TableRow key={material.id}>
                                            <TableCell>{material.title}</TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Box width="100%" mr={1}>
                                                        <LinearProgress variant="determinate" value={progress}/>
                                                    </Box>
                                                    <Box minWidth={35}>
                                                        <Typography variant="body2"
                                                                    color="textSecondary">{`${bookedCount}/${material.num_needed}`}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleOpenMaterialModal(material.id)}>
                                                    <MoreHorizIcon/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
            {tabValue === 1 && (
                <>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setPeopleSortOrder(peopleSortOrder === 'asc' ? 'desc' : 'asc')}
                            startIcon={peopleSortOrder === 'asc' ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                        >
                            {peopleSortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>
                    </Box>
                    <List sx={{backgroundColor: "white"}}>
                        {bookings.sort((a, b) => peopleSortOrder == "asc" ? a.first_name.localeCompare(b.first_name) : b.first_name.localeCompare(a.first_name))
                            .map((booking, index) => {
                                const personName = `${booking.first_name} ${booking.last_name}`;
                                return <>
                                    <ListItemButton sx={{backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent'}}
                                                    onClick={() => togglePersonExpanded(personName)}>
                                        <ListItemText primary={personName}/>
                                        {expandedPerson === personName ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                                    </ListItemButton>
                                    <Collapse in={expandedPerson === personName} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {getMaterialsForUser(booking).map(material => (
                                                <ListItem key={material.id} sx={{pl: 4}}>
                                                    <ListItemText primary={material.title}/>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                </>;
                            })}
                    </List>
                </>
            )}

            <Modal open={openMaterialModal} onClose={handleCloseMaterialModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '90vw', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 2
                }}>
                    <IconButton onClick={handleCloseMaterialModal} sx={{position: 'absolute', top: 8, right: 8}}>
                        <CloseIcon/>
                    </IconButton>
                    {selectedMaterial !== null && (
                        <Box>
                            <Typography sx={{width: "90%"}} variant="h6" gutterBottom>
                                People bringing {getOptionTitle(selectedMaterial, formContent.materials)}
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>First Name</TableCell>
                                        <TableCell>Last Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getUsersForMaterial(selectedMaterial).map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{user.first_name}</TableCell>
                                            <TableCell>{user.last_name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default MaterialsPage;
