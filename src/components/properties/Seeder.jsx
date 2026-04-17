import React, { useState } from 'react';
import { db } from '../../utility/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';

const Seeder = () => {
    const [loading, setLoading] = useState(false);

    const properties = [
        {
            ownerName: "Juan Pérez",
            ownerPhone: "555-0101",
            description: "Hermosa casa moderna con amplios espacios y mucha luz natural.",
            baths: 2.5,
            beds: 3,
            builtArea: 180.5,
            landArea: 250.0,
            address: "Av. Paseo de los Leones 123",
            latitude: 25.7275,
            longitude: -100.3847,
            city: "Monterrey",
            neighborhood: "Cumbres",
            zipcode: 64610,
            zone: "Poniente",
            media: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
            video: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
            price: 3500000,
            status: "Venta",
            type: "casa",
            isActive: true
        },
        {
            ownerName: "María García",
            ownerPhone: "555-0202",
            description: "Departamento céntrico cerca de parques y centros comerciales.",
            baths: 2.0,
            beds: 2,
            builtArea: 95.0,
            landArea: 95.0,
            address: "Calle Hidalgo 456",
            latitude: 19.4326,
            longitude: -99.1332,
            city: "CDMX",
            neighborhood: "Polanco",
            zipcode: 11560,
            zone: "Centro",
            media: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
            video: "",
            price: 4800000,
            status: "Venta",
            type: "departamento",
            isActive: true
        },
        {
            ownerName: "Roberto López",
            ownerPhone: "555-0303",
            description: "Terreno plano ideal para construcción residencial en zona de alta plusvalía.",
            baths: 0,
            beds: 0,
            builtArea: 0,
            landArea: 500.0,
            address: "Camino Real 789",
            latitude: 20.6719,
            longitude: -103.35,
            city: "Guadalajara",
            neighborhood: "Zapopan",
            zipcode: 45010,
            zone: "Norte",
            media: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"],
            video: "",
            price: 2200000,
            status: "Venta",
            type: "terreno",
            isActive: true
        },
        {
            ownerName: "Ana Martínez",
            ownerPhone: "555-0404",
            description: "Casa tradicional con jardín y terraza, excelente mantenimiento.",
            baths: 3.0,
            beds: 4,
            builtArea: 220.0,
            landArea: 300.0,
            address: "Sierra Madre 321",
            latitude: 25.6866,
            longitude: -100.3161,
            city: "Monterrey",
            neighborhood: "San Pedro",
            zipcode: 66220,
            zone: "Sur",
            media: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"],
            video: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
            price: 7500000,
            status: "Venta",
            type: "casa",
            isActive: true
        }
    ];

    const handleSeed = async () => {
        setLoading(true);
        try {
            const propsRef = collection(db, "properties");
            for (const prop of properties) {
                await addDoc(propsRef, {
                    ...prop,
                    createdAt: serverTimestamp(),
                    modifiedAt: serverTimestamp()
                });
            }
            Swal.fire("Éxito", "Propiedades de prueba creadas correctamente.", "success");
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudieron crear las propiedades.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container sx={{ pt: 15, textAlign: 'center' }}>
            <Box className="glass" sx={{ p: 5, borderRadius: 4 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>Sembrador de Datos</Typography>
                <Typography sx={{ mb: 5 }}>Haz clic abajo para poblar tu base de datos con 4 propiedades de prueba.</Typography>
                <Button 
                    variant="contained" 
                    onClick={handleSeed} 
                    disabled={loading}
                    sx={{ bgcolor: 'var(--accent)', color: 'var(--primary)' }}
                >
                    {loading ? <CircularProgress size={24} /> : "Generar Propiedades"}
                </Button>
            </Box>
        </Container>
    );
};

export default Seeder;
