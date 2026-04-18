import React, { useState, useEffect } from 'react';
import { db } from '../../utility/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { 
    Box, 
    Container, 
    Grid, 
    Typography, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    CircularProgress,
    Fade
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { MapPin, ArrowUpDown } from 'lucide-react';

const PropertyList = () => {
    const [searchParams] = useSearchParams();
    const typeFilter = searchParams.get('type');
    
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter & Sort state
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [sortBy, setSortBy] = useState('neighborhood'); // default neighborhood

    useEffect(() => {
        setLoading(true);
        const q = typeFilter 
            ? query(collection(db, "properties"), where("type", "==", typeFilter), where("isActive", "==", true))
            : query(collection(db, "properties"), where("isActive", "==", true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const propsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProperties(propsData);
            
            // Extract unique cities
            const uniqueCities = [...new Set(propsData.map(p => p.city))].sort();
            setCities(uniqueCities);
            
            // Sync selectedCity with available cities
            if (uniqueCities.length > 0) {
                if (!selectedCity || !uniqueCities.includes(selectedCity)) {
                    setSelectedCity(uniqueCities[0]);
                }
            } else {
                setSelectedCity('');
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, [typeFilter]);

    useEffect(() => {
        let result = [...properties];

        // Filter by selected city
        if (selectedCity) {
            result = result.filter(p => p.city === selectedCity);
        }

        // Apply sorting
        result.sort((a, b) => {
            if (sortBy === 'price') {
                return a.price - b.price;
            } else {
                return a.neighborhood.localeCompare(b.neighborhood);
            }
        });

        setFilteredProperties(result);
    }, [properties, selectedCity, sortBy]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <CircularProgress sx={{ color: 'var(--accent)' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ pt: 18, pb: 10 }}>
            <Box sx={{ mb: 6, display: "flex", flexDirection: { xs: 'column', md: 'row' }, justifyContent: "space-between", alignItems: "center", gap: 3 }}>
                <Box>
                    <Typography variant="h3" fontWeight="900" sx={{ color: 'var(--accent)' }}>
                        {typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + 's' : 'Nuestras Propiedades'}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.7 }}>
                        Mostrando {filteredProperties.length} propiedades disponibles.
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, width: { xs: '100%', md: 'auto' } }}>
                    {/* City Filter */}
                    <FormControl variant="outlined" size="small" sx={selectStyle}>
                        <InputLabel>Ciudad</InputLabel>
                        <Select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            label="Ciudad"
                            startAdornment={<MapPin size={16} style={{ marginRight: 8, color: 'var(--accent)' }} />}
                        >
                            {cities.map(city => (
                                <MenuItem key={city} value={city}>{city}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Sorting */}
                    <FormControl variant="outlined" size="small" sx={selectStyle}>
                        <InputLabel>Ordenar por</InputLabel>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            label="Ordenar por"
                            startAdornment={<ArrowUpDown size={16} style={{ marginRight: 8, color: 'var(--accent)' }} />}
                        >
                            <MenuItem value="neighborhood">Colonia (A-Z)</MenuItem>
                            <MenuItem value="price">Precio (Menor a Mayor)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {filteredProperties.map((prop, index) => (
                    <Grid item xs={12} sm={6} md={4} key={prop.id}>
                        <Fade in={true} timeout={500 + index * 100}>
                            <Box>
                                <PropertyCard property={prop} />
                            </Box>
                        </Fade>
                    </Grid>
                ))}
                {filteredProperties.length === 0 && (
                    <Grid item xs={12}>
                        <Box textAlign="center" py={10} className="glass" borderRadius={4}>
                            <Typography variant="h6">No se encontraron propiedades en esta ubicación.</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

const selectStyle = {
    minWidth: 150,
    '& .MuiOutlinedInput-root': {
        color: 'var(--secondary)',
        borderRadius: '12px',
        bgcolor: 'var(--glass)',
        '& fieldset': { borderColor: 'var(--glass-border)' },
        '&:hover fieldset': { borderColor: 'var(--accent)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 232, 0.6)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent)' },
    '& .MuiSelect-icon': { color: 'var(--accent)' }
};

export default PropertyList;
