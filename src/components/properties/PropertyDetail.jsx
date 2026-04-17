import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../utility/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
    Box, 
    Container, 
    Typography, 
    Grid, 
    Button, 
    Chip, 
    CircularProgress, 
    Dialog,
    Avatar,
    IconButton,
    Fab,
    Tooltip
} from '@mui/material';
import { 
    Bed, 
    Bath, 
    Maximize, 
    Layers,
    MapPin, 
    Calendar, 
    Video as VideoIcon, 
    ChevronLeft,
    Navigation as NavigationIcon
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, userData, isRealtor } = useAuth();
    
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullScreenImage, setFullScreenImage] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    useEffect(() => {
        const fetchProperty = async () => {
            const docRef = doc(db, "properties", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProperty({ id: docSnap.id, ...docSnap.data() });
            } else {
                Swal.fire("Error", "Propiedad no encontrada", "error");
                navigate('/productos');
            }
            setLoading(false);
        };
        fetchProperty();
    }, [id, navigate]);

    const handleOwnerInfo = async () => {
        const { value: password } = await Swal.fire({
            title: 'Ver Información del Propietario',
            input: 'password',
            inputLabel: 'Ingresa tu contraseña de asesor para confirmar',
            inputPlaceholder: 'Contraseña',
            showCancelButton: true,
        });

        if (password) {
            MySwal.fire({
                title: <strong>Datos del Propietario</strong>,
                html: (
                    <Box sx={{ textAlign: "left", p: 2 }}>
                        <Typography><strong>Nombre:</strong> {property.ownerName}</Typography>
                        <Typography><strong>Teléfono:</strong> {property.ownerPhone}</Typography>
                        <Box sx={{ mt: 2, p: 1, bgcolor: "#fffde7", borderRadius: 1 }}>
                            <Typography variant="caption">Esta ventana se cerrará automáticamente en 30 segundos.</Typography>
                        </Box>
                    </Box>
                ),
                timer: 30000,
                timerProgressBar: true,
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const handleAppointment = async () => {
        let name = "";
        let phone = "";

        if (!user || isRealtor) {
            const { value: formValues } = await Swal.fire({
                title: 'Agendar Cita',
                html:
                    '<input id="swal-input1" class="swal2-input" placeholder="Tu Nombre">' +
                    '<input id="swal-input2" class="swal2-input" placeholder="Tu Teléfono">',
                focusConfirm: false,
                preConfirm: () => {
                    return [
                        document.getElementById('swal-input1').value,
                        document.getElementById('swal-input2').value
                    ]
                }
            });
            if (formValues) {
                [name, phone] = formValues;
            }
        } else {
            name = userData.fullname;
            phone = userData.phoneNumber;
        }

        if (name && phone) {
            Swal.fire({
                title: 'Enviando solicitud...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Solicitud enviada',
                    text: `Nos comunicaremos contigo a la brevedad, ${name}.`
                });
            }, 2000);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}><CircularProgress /></Box>;
    if (!property) return null;

    const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '20px' };
    const center = { lat: property.latitude, lng: property.longitude };

    return (
        <Container maxWidth="lg" sx={{ pt: 15, pb: 15 }}>
            {/* Gallery Section */}
            <Box sx={{ mb: 6, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    style={{ height: '500px' }}
                >
                    {property.media.map((img, index) => (
                        <SwiperSlide key={index}>
                            <img 
                                src={img} 
                                alt={`Propiedad ${index}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                                onClick={() => setFullScreenImage(img)}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>

            <Grid container spacing={6}>
                {/* INFO COLUMN (Left) */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <Chip label={property.status} sx={{ bgcolor: 'var(--accent)', color: 'var(--primary)', fontWeight: 'bold' }} />
                            <Chip label={property.type.toUpperCase()} variant="outlined" sx={{ color: 'var(--secondary)', borderColor: 'var(--glass-border)' }} />
                        </Box>
                        
                        <Typography variant="h3" fontWeight="900" sx={{ color: 'var(--accent)', mb: 1 }}>{property.neighborhood}</Typography>
                        
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, opacity: 0.9, mb: 0.5 }}>
                            <MapPin size={20} color="var(--accent)" />
                            <Typography variant="h6">{property.address}, {property.city}</Typography>
                        </Box>
                        
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, opacity: 0.6, mb: 3, ml: 3.5 }}>
                            <NavigationIcon size={16} />
                            <Typography variant="body1">Zona {property.zone}</Typography>
                        </Box>

                        <Typography variant="h4" color="var(--accent)" fontWeight="bold" sx={{ mb: 4 }}>
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(property.price)}
                        </Typography>
                    </Box>

                    {/* Characteristics Grid */}
                    <Box sx={{ mb: 6, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 3, p: 3, borderRadius: 4 }} className="glass">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Bed color="var(--accent)" size={24} />
                            <Box>
                                <Typography variant="caption" sx={{ display: 'block', opacity: 0.6 }}>Recámaras</Typography>
                                <Typography fontWeight="bold">{property.beds}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Bath color="var(--accent)" size={24} />
                            <Box>
                                <Typography variant="caption" sx={{ display: 'block', opacity: 0.6 }}>Baños</Typography>
                                <Typography fontWeight="bold">{property.baths}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Maximize color="var(--accent)" size={24} />
                            <Box>
                                <Typography variant="caption" sx={{ display: 'block', opacity: 0.6 }}>Construcción</Typography>
                                <Typography fontWeight="bold">{property.builtArea} m²</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Layers color="var(--accent)" size={24} />
                            <Box>
                                <Typography variant="caption" sx={{ display: 'block', opacity: 0.6 }}>Terreno</Typography>
                                <Typography fontWeight="bold">{property.landArea} m²</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>Descripción</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.8 }}>{property.description}</Typography>
                    </Box>

                    {isRealtor && (
                        <Box sx={{ p: 3, borderRadius: 4, border: '1px solid var(--accent)', mb: 6 }} className="glass">
                            <Typography variant="subtitle1" color="var(--accent)" mb={2} fontWeight="bold">Exclusivo para Asesores</Typography>
                            <Button 
                                variant="outlined" 
                                onClick={handleOwnerInfo}
                                fullWidth
                                sx={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                            >
                                Ver Información del Propietario
                            </Button>
                        </Box>
                    )}
                </Grid>

                {/* MEDIA COLUMN (Right) */}
                <Grid item xs={12} md={6}>
                    {/* YouTube Video */}
                    {property.video && (
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", display: "flex", alignItems: "center", gap: 2 }}>
                                <VideoIcon color="red" /> Recorrido en Video
                            </Typography>
                            <Box sx={{ position: 'relative', pt: '56.25%', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                <iframe 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    src={`https://www.youtube.com/embed/${property.video.split('v=')[1]?.split('&')[0]}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </Box>
                        </Box>
                    )}

                    {/* Map */}
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>Ubicación</Typography>
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={15}
                                options={{
                                    styles: silverMapStyle
                                }}
                            >
                                <MarkerF position={center} />
                            </GoogleMap>
                        ) : <CircularProgress />}
                    </Box>
                </Grid>
            </Grid>

            {/* Floating Appointment Button */}
            <Tooltip title="Agendar Cita" placement="left">
                <Fab 
                    color="primary" 
                    aria-label="add" 
                    onClick={handleAppointment}
                    sx={{ 
                        position: 'fixed', 
                        bottom: 30, 
                        right: 30, 
                        bgcolor: 'var(--accent)', 
                        color: 'var(--primary)',
                        width: 70,
                        height: 70,
                        '&:hover': { bgcolor: '#b8952d' }
                    }}
                >
                    <Calendar size={32} />
                </Fab>
            </Tooltip>

            {/* Full Screen Image Dialog */}
            <Dialog fullScreen open={!!fullScreenImage} onClose={() => setFullScreenImage(null)}>
                <Box sx={{ bgcolor: 'black', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <IconButton 
                        onClick={() => setFullScreenImage(null)}
                        sx={{ position: 'absolute', top: 20, right: 20, color: 'white' }}
                    >
                        <ChevronLeft size={40} />
                    </IconButton>
                    <img src={fullScreenImage} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Full screen" />
                </Box>
            </Dialog>
        </Container>
    );
};

const silverMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road.highway", "elementType": "labels.icon", "stylers": [{ "visibility": "on" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

export default PropertyDetail;
