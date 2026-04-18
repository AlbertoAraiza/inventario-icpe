import React, { useState } from 'react';
import { 
    Box, 
    Container, 
    Paper, 
    Tabs, 
    Tab, 
    TextField, 
    Button, 
    Typography, 
    Avatar, 
    IconButton,
    InputAdornment,
    CircularProgress,
    Fade
} from '@mui/material';
import { 
    Mail, 
    Lock, 
    User, 
    Phone, 
    Camera, 
    Eye, 
    EyeOff,
    LogIn
} from 'lucide-react';
import { auth, db, storage } from '../../utility/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Auth = () => {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const navigate = useNavigate();

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const handlePhotoChange = (e) => {
        if (e.target.files[0]) {
            setPhoto(e.target.files[0]);
            setPhotoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (tab === 0) { // Login
                await signInWithEmailAndPassword(auth, email, password);
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: 'Has iniciado sesión correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/');
            } else { // Register
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                let photoURL = "";
                if (photo) {
                    const storageRef = ref(storage, `profiles/${user.uid}`);
                    await uploadBytes(storageRef, photo);
                    photoURL = await getDownloadURL(storageRef);
                }

                await setDoc(doc(db, 'users', user.uid), {
                    fullname,
                    phoneNumber,
                    profilePictureURL: photoURL,
                    role: 'customer',
                    email: email,
                    createdAt: serverTimestamp(),
                    modifiedAt: serverTimestamp(),
                    isActive: true
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Registro exitoso',
                    text: 'Tu cuenta ha sido creada.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/');
            }
        } catch (error) {
            let message = "Ocurrió un error inesperado.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = "Correo o contraseña incorrectos.";
            } else if (error.code === 'auth/email-already-in-use') {
                message = "Este correo ya está registrado.";
            } else if (error.code === 'auth/weak-password') {
                message = "La contraseña debe tener al menos 6 caracteres.";
            }
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            Swal.fire('Atención', 'Ingresa tu correo primero.', 'info');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            Swal.fire('Enviado', 'Se ha enviado un correo para restablecer tu contraseña.', 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo enviar el correo.', 'error');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ pt: 15, pb: 10 }}>
            <Fade in={true} timeout={800}>
                <Paper className="glass" sx={{ 
                    p: 4, 
                    borderRadius: 4, 
                    color: 'var(--secondary)',
                    bgcolor: 'rgba(71, 0, 0, 0.85)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'var(--accent)', mb: 2, width: 56, height: 56 }}>
                            <LogIn color="var(--primary)" />
                        </Avatar>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {tab === 0 ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                            {tab === 0 ? 'Bienvenido de nuevo a Inmobiliaria ICPE' : 'Únete a nuestra comunidad inmobiliaria'}
                        </Typography>
                    </Box>

                    <Tabs 
                        value={tab} 
                        onChange={handleTabChange} 
                        variant="fullWidth" 
                        sx={{ 
                            mb: 4,
                            '& .MuiTabs-indicator': { bgcolor: 'var(--accent)' },
                            '& .MuiTab-root': { color: 'var(--secondary)', opacity: 0.7 },
                            '& .Mui-selected': { color: 'var(--accent) !important', opacity: 1, fontWeight: 'bold' }
                        }}
                    >
                        <Tab label="Entrar" />
                        <Tab label="Registrar" />
                    </Tabs>

                    <form onSubmit={handleAuth}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {tab === 1 && (
                                <>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
                                        <Box sx={{ position: "relative" }}>
                                            <Avatar 
                                                src={photoPreview} 
                                                sx={{ width: 100, height: 100, border: '3px solid var(--accent)' }}
                                            />
                                            <IconButton 
                                                component="label" 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    bottom: 0, 
                                                    right: 0, 
                                                    bgcolor: 'var(--accent)',
                                                    '&:hover': { bgcolor: '#b8952d' }
                                                }}
                                            >
                                                <input hidden accept="image/*" type="file" onChange={handlePhotoChange} />
                                                <Camera size={18} color="var(--primary)" />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="caption" sx={{ mt: 1, opacity: 0.85 }}>Foto de perfil</Typography>
                                    </Box>

                                    <TextField
                                        required
                                        fullWidth
                                        label="Nombre Completo"
                                        variant="outlined"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <User size={20} color="var(--accent)" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={textFieldStyle}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        label="Teléfono"
                                        variant="outlined"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Phone size={20} color="var(--accent)" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={textFieldStyle}
                                    />
                                </>
                            )}

                            <TextField
                                required
                                fullWidth
                                label="Correo Electrónico"
                                variant="outlined"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Mail size={20} color="var(--accent)" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                            />

                            <TextField
                                required
                                fullWidth
                                label="Contraseña"
                                variant="outlined"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock size={20} color="var(--accent)" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <EyeOff size={20} color="var(--secondary)" /> : <Eye size={20} color="var(--secondary)" />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={textFieldStyle}
                            />

                            {tab === 0 && (
                                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button 
                                        onClick={handleResetPassword}
                                        sx={{ color: 'var(--accent)', textTransform: 'none', fontSize: '0.8rem' }}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Button>
                                </Box>
                            )}

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{ 
                                    mt: 2, 
                                    py: 1.5, 
                                    bgcolor: 'var(--accent)', 
                                    color: 'var(--primary)',
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    '&:hover': { bgcolor: '#b8952d' }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : (tab === 0 ? 'Iniciar Sesión' : 'Registrarse')}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Fade>
        </Container>
    );
};

const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
        color: 'var(--secondary)',
        '& fieldset': { borderColor: 'rgba(255, 255, 232, 0.4)' },
        '&:hover fieldset': { borderColor: 'var(--accent)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 232, 0.9)', fontWeight: 500 },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent)' },
};

export default Auth;
