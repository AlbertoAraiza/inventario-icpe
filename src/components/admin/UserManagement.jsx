import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    Avatar, 
    Switch, 
    IconButton, 
    Tooltip,
    Button,
    Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
    User, 
    UserPlus, 
    UserMinus, 
    RefreshCcw,
    ShieldCheck,
    Mail
} from 'lucide-react';
import { db } from '../../utility/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import Swal from 'sweetalert2';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const userList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
            Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleRole = async (id, currentRole) => {
        const newRole = currentRole === 'realtor' ? 'customer' : 'realtor';
        
        const result = await Swal.fire({
            title: '¿Cambiar rol?',
            text: `Vas a cambiar el rol a ${newRole === 'realtor' ? 'Asesor' : 'Cliente'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'var(--accent)',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await updateDoc(doc(db, "users", id), { role: newRole });
                setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
                Swal.fire("Actualizado", "El rol ha sido modificado.", "success");
            } catch (error) {
                Swal.fire("Error", "No se pudo actualizar el rol", "error");
            }
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "users", id), { isActive: !currentStatus });
            setUsers(users.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
        } catch (error) {
            Swal.fire("Error", "No se pudo actualizar el estado", "error");
        }
    };

    const columns = [
        { 
            field: 'profilePictureURL', 
            headerName: 'Usuario', 
            width: 80,
            renderCell: (params) => (
                <Avatar 
                    src={params.value} 
                    sx={{ width: 40, height: 40, mt: 0.5, border: '1px solid var(--accent)' }}
                >
                    <User size={20} />
                </Avatar>
            )
        },
        { field: 'fullname', headerName: 'Nombre Completo', width: 220 },
        { field: 'email', headerName: 'Email', width: 220 },
        { 
            field: 'role', 
            headerName: 'Rol', 
            width: 150,
            renderCell: (params) => (
                <Chip 
                    label={params.value === 'realtor' ? 'ASESOR' : 'CLIENTE'} 
                    size="small"
                    sx={{ 
                        bgcolor: params.value === 'realtor' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 232, 0.1)',
                        color: params.value === 'realtor' ? 'var(--accent)' : 'var(--secondary)',
                        fontWeight: 'bold',
                        border: '1px solid',
                        borderColor: params.value === 'realtor' ? 'var(--accent)' : 'transparent'
                    }}
                />
            )
        },
        { 
            field: 'actions_role', 
            headerName: '¿Es Asesor?', 
            width: 120,
            renderCell: (params) => (
                <Tooltip title={params.row.role === 'realtor' ? "Quitar rango de Asesor" : "Promover a Asesor"}>
                    <Switch 
                        checked={params.row.role === 'realtor'} 
                        onChange={() => handleToggleRole(params.row.id, params.row.role)}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--accent)' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'var(--accent)' },
                        }}
                    />
                </Tooltip>
            )
        },
        { 
            field: 'isActive', 
            headerName: 'Estado', 
            width: 100,
            renderCell: (params) => (
                <Tooltip title={params.value ? "Desactivar Cuenta" : "Activar Cuenta"}>
                    <Switch 
                        checked={params.value} 
                        onChange={() => handleToggleActive(params.row.id, params.value)}
                        color="success"
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    variant="outlined" 
                    startIcon={<RefreshCcw size={18} />} 
                    onClick={fetchUsers}
                    sx={{ borderColor: 'rgba(212, 175, 55, 0.4)', color: 'var(--secondary)' }}
                >
                    Refrescar Lista
                </Button>
            </Box>

            <Paper elevation={4} sx={{ 
                height: 600, 
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
                        display: 'flex',
                        alignItems: 'center',
                    },
                    '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(212, 175, 55, 0.1) !important' },
                    '& .MuiDataGrid-footerContainer': { bgcolor: '#300000', borderTop: '2px solid var(--accent)' },
                    '& .MuiTablePagination-root': { color: 'var(--secondary)' },
                    '& .MuiIconButton-root': { color: 'var(--secondary)' }
                }
            }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    loading={loading}
                    disableSelectionOnClick
                    rowHeight={60}
                />
            </Paper>
        </Box>
    );
};

export default UserManagement;
