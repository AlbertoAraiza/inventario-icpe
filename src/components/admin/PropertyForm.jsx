import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    Grid, 
    MenuItem, 
    Box, 
    Typography,
    IconButton,
    CircularProgress,
    Stack
} from '@mui/material';
import { X, Upload, Home, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
import { db, storage } from '../../utility/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';

const PropertyForm = ({ open, onClose, property, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    
    const [formData, setFormData] = useState({
        ownerName: '',
        ownerPhone: '',
        description: '',
        baths: 0,
        beds: 0,
        builtArea: 0,
        landArea: 0,
        address: '',
        latitude: 0,
        longitude: 0,
        city: 'Guadalajara',
        neighborhood: '',
        zipcode: 0,
        zone: '',
        price: 0,
        status: 'Venta',
        type: 'casa',
        video: '',
        isActive: true
    });

    useEffect(() => {
        if (property) {
            setFormData({ ...property });
            setPreviews(property.media || []);
        } else {
            setFormData({
                ownerName: '',
                ownerPhone: '',
                description: '',
                baths: 0,
                beds: 0,
                builtArea: 0,
                landArea: 0,
                address: '',
                latitude: 0,
                longitude: 0,
                city: 'Guadalajara',
                neighborhood: '',
                zipcode: 0,
                zone: '',
                price: 0,
                status: 'Venta',
                type: 'casa',
                video: '',
                isActive: true
            });
            setFiles([]);
            setPreviews([]);
        }
    }, [property, open]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles([...files, ...selectedFiles]);
        
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);

        if (index < (property?.media?.length || 0)) {
            // It's an existing image
            const newMedia = [...formData.media];
            newMedia.splice(index, 1);
            setFormData({ ...formData, media: newMedia });
        } else {
            // It's a new file
            const fileIndex = index - (formData.media?.length || 0);
            const newFiles = [...files];
            newFiles.splice(fileIndex, 1);
            setFiles(newFiles);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let mediaUrls = property ? [...(formData.media || [])] : [];

            // Upload new images
            for (const file of files) {
                const storageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                mediaUrls.push(url);
            }

            const finalData = {
                ...formData,
                media: mediaUrls,
                modifiedAt: serverTimestamp(),
                price: Number(formData.price),
                beds: Number(formData.beds),
                baths: Number(formData.baths),
                builtArea: Number(formData.builtArea),
                landArea: Number(formData.landArea),
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                zipcode: Number(formData.zipcode)
            };

            if (property) {
                await updateDoc(doc(db, "properties", property.id), finalData);
                Swal.fire("Éxito", "Propiedad actualizada correctamente", "success");
            } else {
                await addDoc(collection(db, "properties"), {
                    ...finalData,
                    createdAt: serverTimestamp()
                });
                Swal.fire("Éxito", "Propiedad creada correctamente", "success");
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving property:", error);
            Swal.fire("Error", "No se pudo guardar la propiedad", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#1a0000', // Solid Dark Burgundy
                    backgroundImage: 'none',
                    border: '2px solid var(--accent)',
                    borderRadius: 4,
                    color: 'var(--secondary)',
                    boxShadow: '0 0 40px rgba(0,0,0,0.8)'
                }
            }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                    bgcolor: '#300000',
                    pb: 2
                }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Home size={24} /> {property ? 'Editar Propiedad' : 'Nueva Propiedad'}
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'var(--secondary)' }}><X /></IconButton>
                </DialogTitle>
                
                <DialogContent sx={{ py: 3, bgcolor: '#1a0000' }}>
                    <Grid container spacing={3}>
                        {/* Basic Info */}
                        <Grid item xs={12}><Typography variant="subtitle2" sx={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Información General</Typography></Grid>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth label="Nombre del Propietario" required
                                value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth label="Teléfono del Propietario" required
                                value={formData.ownerPhone} onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <TextField 
                                select fullWidth label="Tipo"
                                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                                sx={formFieldStyle}
                            >
                                <MenuItem value="casa">Casa</MenuItem>
                                <MenuItem value="departamento">Departamento</MenuItem>
                                <MenuItem value="terreno">Terreno</MenuItem>
                                <MenuItem value="local">Local</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField 
                                select fullWidth label="Estado"
                                value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                                sx={formFieldStyle}
                            >
                                <MenuItem value="Venta">Venta</MenuItem>
                                <MenuItem value="Renta">Renta</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField 
                                fullWidth label="Precio" type="number" required
                                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>

                        {/* Location */}
                        <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle2" sx={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Ubicación</Typography></Grid>
                        <Grid item xs={12} md={8}>
                            <TextField 
                                fullWidth label="Dirección Completa" required
                                value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField 
                                select fullWidth label="Ciudad"
                                value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                                sx={formFieldStyle}
                            >
                                <MenuItem value="Guadalajara">Guadalajara</MenuItem>
                                <MenuItem value="Monterrey">Monterrey</MenuItem>
                                <MenuItem value="Querétaro">Querétaro</MenuItem>
                                <MenuItem value="CDMX">CDMX</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField 
                                fullWidth label="Colonia" required
                                value={formData.neighborhood} onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField 
                                fullWidth label="Zona" required
                                value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField 
                                fullWidth label="Código Postal" type="number"
                                value={formData.zipcode} onChange={(e) => setFormData({...formData, zipcode: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth label="Latitud" type="number" step="any"
                                value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth label="Longitud" type="number" step="any"
                                value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>

                        {/* Features */}
                        <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle2" sx={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Características</Typography></Grid>
                        <Grid item xs={12} md={3}>
                            <TextField 
                                fullWidth label="Recámaras" type="number"
                                value={formData.beds} onChange={(e) => setFormData({...formData, beds: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField 
                                fullWidth label="Baños" type="number" step="0.5"
                                value={formData.baths} onChange={(e) => setFormData({...formData, baths: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField 
                                fullWidth label="M² Construcción" type="number"
                                value={formData.builtArea} onChange={(e) => setFormData({...formData, builtArea: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField 
                                fullWidth label="M² Terreno" type="number"
                                value={formData.landArea} onChange={(e) => setFormData({...formData, landArea: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth label="Descripción" multiline rows={4} required
                                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth label="URL de Video (YouTube)" placeholder="https://www.youtube.com/watch?v=..."
                                value={formData.video} onChange={(e) => setFormData({...formData, video: e.target.value})}
                                sx={formFieldStyle}
                            />
                        </Grid>

                        {/* Media */}
                        <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle2" sx={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Multimedia</Typography></Grid>
                        <Grid item xs={12}>
                            <Box 
                                sx={{ 
                                    border: '2px dashed rgba(212, 175, 55, 0.4)', 
                                    borderRadius: 4, 
                                    p: 4, 
                                    textAlign: 'center',
                                    bgcolor: 'rgba(212, 175, 55, 0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { 
                                        bgcolor: 'rgba(212, 175, 55, 0.1)',
                                        borderColor: 'var(--accent)'
                                    }
                                }}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <input 
                                    type="file" id="file-input" hidden multiple accept="image/*" 
                                    onChange={handleFileChange}
                                />
                                <Upload size={40} color="var(--accent)" style={{ marginBottom: 12 }} />
                                <Typography variant="h6" fontWeight="bold">Sube las fotos aquí</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.6 }}>Puedes seleccionar varias imágenes a la vez</Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', py: 2, '&::-webkit-scrollbar': { height: 6 } }}>
                                {previews.map((url, index) => (
                                    <Box key={index} sx={{ position: 'relative', minWidth: 120, height: 120 }}>
                                        <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(255,255,232,0.2)' }} />
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                            sx={{ 
                                                position: 'absolute', 
                                                top: -8, 
                                                right: -8, 
                                                bgcolor: '#ff4444', 
                                                color: 'white', 
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                                '&:hover': { bgcolor: '#cc0000' } 
                                            }}
                                        >
                                            <X size={14} />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                
                <DialogActions sx={{ p: 4, borderTop: '1px solid rgba(255,255,232,0.1)' }}>
                    <Button onClick={onClose} disabled={loading} sx={{ color: 'var(--secondary)', opacity: 0.7 }}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                        sx={{ 
                            bgcolor: 'var(--accent)', 
                            color: 'var(--primary)', 
                            fontWeight: 'bold',
                            px: 4,
                            py: 1,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#b8952d' }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : (property ? 'Guardar Cambios' : 'Crear Propiedad')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

const formFieldStyle = {
    '& .MuiOutlinedInput-root': {
        color: 'var(--secondary)',
        '& fieldset': { borderColor: 'rgba(255, 255, 232, 0.2)' },
        '&:hover fieldset': { borderColor: 'var(--accent)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 232, 0.6)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent)' },
    '& .MuiSelect-icon': { color: 'var(--accent)' }
};

export default PropertyForm;
