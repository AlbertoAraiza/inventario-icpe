import React from 'react';
import { 
    Card, 
    CardMedia, 
    CardContent, 
    Typography, 
    Box, 
    Chip,
    Button,
    CardActionArea
} from '@mui/material';
import { 
    MapPin, 
    ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();
    
    // Format price to MXN
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <Card className="glass" sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid var(--glass-border)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                '& .MuiCardMedia-root': { scale: '1.05' }
            }
        }}>
            <CardActionArea onClick={() => navigate(`/detalles/${property.id}`)}>
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                        component="img"
                        height="240"
                        image={property.media[0]}
                        alt={property.neighborhood}
                        sx={{ transition: 'scale 0.5s ease' }}
                    />
                    <Box sx={{ 
                        position: 'absolute', 
                        top: 15, 
                        right: 15, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1 
                    }}>
                        <Chip 
                            label={property.type.toUpperCase()} 
                            sx={{ 
                                bgcolor: 'var(--accent)', 
                                color: 'var(--primary)', 
                                fontWeight: 'bold',
                                fontSize: '0.7rem' 
                            }} 
                        />
                        <Chip 
                            label={property.status} 
                            variant="outlined"
                            sx={{ 
                                bgcolor: 'rgba(0,0,0,0.6)', 
                                color: 'white', 
                                border: 'none',
                                backdropFilter: 'blur(4px)',
                                fontSize: '0.7rem'
                            }} 
                        />
                    </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography gutterBottom variant="h5" component="div" fontWeight="bold" sx={{ color: 'var(--accent)' }}>
                        {formatPrice(property.price)}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2} sx={{ opacity: 0.8 }}>
                        <MapPin size={16} color="var(--accent)" />
                        <Typography variant="body2">
                            {property.neighborhood}, {property.city}
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mt={3} pt={2} sx={{ borderTop: '1px solid var(--glass-border)' }}>
                        <Box textAlign="center">
                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>Habs</Typography>
                            <Typography variant="body2" fontWeight="bold">{property.beds}</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>Baños</Typography>
                            <Typography variant="body2" fontWeight="bold">{property.baths}</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>Area</Typography>
                            <Typography variant="body2" fontWeight="bold">{property.builtArea}m²</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default PropertyCard;
