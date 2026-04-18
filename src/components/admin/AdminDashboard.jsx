import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Button, 
    Paper, 
    IconButton, 
    Chip,
    Switch,
    Tooltip,
    Avatar,
    Fade
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
    Plus, 
    Edit, 
    Trash2, 
    ExternalLink, 
    RefreshCcw,
    LayoutDashboard,
    Users,
    Home
} from 'lucide-react';
import { db } from '../../utility/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PropertyForm from './PropertyForm';
import UserManagement from './UserManagement';
import { Tabs, Tab } from '@mui/material';

const AdminDashboard = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const navigate = useNavigate();

    // ... (rest of the handle functions remain same)
    const fetchProperties = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const props = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProperties(props);
        } catch (error) {
            console.error("Error fetching properties:", error);
            Swal.fire("Error", "No se pudieron cargar las propiedades", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#470000',
            cancelButtonColor: '#6e7881',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, "properties", id));
                Swal.fire("Borrado", "La propiedad ha sido eliminada.", "success");
                fetchProperties();
            } catch (error) {
                Swal.fire("Error", "No se pudo eliminar la propiedad", "error");
            }
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "properties", id), {
                isActive: !currentStatus
            });
            setProperties(properties.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
        } catch (error) {
            Swal.fire("Error", "No se pudo actualizar el estado", "error");
        }
    };

    const handleEdit = (property) => {
        setSelectedProperty(property);
        setOpenForm(true);
    };

    const columns = [
        { 
            field: 'media', 
            headerName: 'Imagen', 
            width: 80,
            renderCell: (params) => (
                <Avatar 
                    src={params.value && params.value[0]} 
                    variant="rounded" 
                    sx={{ width: 45, height: 45, mt: 0.5 }}
                />
            )
        },
        { field: 'neighborhood', headerName: 'Colonia', width: 180 },
        { field: 'city', headerName: 'Ciudad', width: 130 },
        { 
            field: 'price', 
            headerName: 'Precio', 
            width: 130,
            valueGetter: (params) => {
                return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(params);
            }
        },
        { field: 'type', headerName: 'Tipo', width: 110 },
        { 
            field: 'isActive', 
            headerName: 'Activo', 
            width: 100,
            renderCell: (params) => (
                <Switch 
                    checked={params.value} 
                    onChange={() => handleToggleActive(params.row.id, params.value)}
                    sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--accent)' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'var(--accent)' },
                    }}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 180,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ver en sitio">
                        <IconButton size="small" onClick={() => navigate(`/detalles/${params.row.id}`)} sx={{ color: 'var(--secondary)' }}>
                            <ExternalLink size={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEdit(params.row)} sx={{ color: 'var(--accent)' }}>
                            <Edit size={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleDelete(params.row.id)} sx={{ color: '#ff4444' }}>
                            <Trash2 size={18} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ pt: 15, pb: 10 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h3" fontWeight="900" sx={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LayoutDashboard size={40} /> Admin Panel
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.7 }}>
                        Control central de inventario y comunidad.
                    </Typography>
                </Box>
                
                <Tabs 
                    value={currentTab} 
                    onChange={(e, v) => setCurrentTab(v)}
                    sx={{
                        '& .MuiTabs-indicator': { bgcolor: 'var(--accent)', height: 3 },
                        '& .MuiTab-root': { 
                            color: 'var(--secondary)', 
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            minWidth: 150,
                            '&.Mui-selected': { color: 'var(--accent)' }
                        }
                    }}
                >
                    <Tab icon={<Home size={20} />} iconPosition="start" label="Propiedades" />
                    <Tab icon={<Users size={20} />} iconPosition="start" label="Usuarios" />
                </Tabs>
            </Box>

            {currentTab === 0 && (
                <Fade in={currentTab === 0}>
                    <Box>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button 
                                variant="outlined" 
                                startIcon={<RefreshCcw size={18} />} 
                                onClick={fetchProperties}
                                sx={{ borderColor: 'rgba(212, 175, 55, 0.4)', color: 'var(--secondary)' }}
                            >
                                Actualizar
                            </Button>
                            <Button 
                                variant="contained" 
                                startIcon={<Plus size={18} />} 
                                onClick={() => { setSelectedProperty(null); setOpenForm(true); }}
                                sx={{ bgcolor: 'var(--accent)', color: 'var(--primary)', fontWeight: 'bold' }}
                            >
                                Nueva Propiedad
                            </Button>
                        </Box>
                        <Paper elevation={4} sx={{ 
                            height: 700, 
                            width: '100%', 
                            borderRadius: 4, 
                            overflow: 'hidden',
                            bgcolor: '#1a0000',
                            border: '1px solid var(--accent)',
                            '& .MuiDataGrid-root': {
                                border: 'none',
                                color: 'var(--secondary)',
                                fontFamily: 'Outfit, sans-serif',
                                '& .MuiDataGrid-main': { bgcolor: '#1a0000' },
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: '#300000 !important',
                                    borderBottom: '2px solid var(--accent)',
                                    color: 'var(--accent) !important',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                                    color: 'var(--secondary) !important',
                                },
                                '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(212, 175, 55, 0.1) !important' },
                                '& .MuiDataGrid-footerContainer': { bgcolor: '#300000', borderTop: '2px solid var(--accent)' },
                                '& .MuiTablePagination-root': { color: 'var(--secondary)' },
                                '& .MuiIconButton-root': { color: 'var(--secondary)' }
                            }
                        }}>
                            <DataGrid
                                rows={properties}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10, 25, 50]}
                                loading={loading}
                                disableSelectionOnClick
                                rowHeight={70}
                            />
                        </Paper>
                    </Box>
                </Fade>
            )}

            {currentTab === 1 && (
                <Fade in={currentTab === 1}>
                    <Box>
                        <UserManagement />
                    </Box>
                </Fade>
            )}

            <PropertyForm 
                open={openForm} 
                onClose={() => setOpenForm(false)} 
                property={selectedProperty} 
                onSuccess={fetchProperties}
            />
        </Container>
    );
};

export default AdminDashboard;
