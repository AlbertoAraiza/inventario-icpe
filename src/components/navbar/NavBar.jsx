import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from "../../assets/logo.png"
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { auth } from '../../utility/firebase'
import { signOut } from 'firebase/auth'

const navbarLinks = [
    { id: 1, title: "Inicio", link: "/" },
    { id: 2, title: "Nosotros", link: "#" },
    { id: 3, title: "Contacto", link: "#" },
    { id: 4, title: "Soporte", link: "#" },
];

const productSubLinks = [
    { title: "Casas/departamentos", type: "casa" },
    { title: "Terrenos", type: "terreno" },
    { title: "Otros", type: "otro" },
];

const navBarSocialnetworks = [
    { id: 1, title: "Facebook", link: "https://www.facebook.com", icon: "bi bi-facebook" },
    { id: 2, title: "Instagram", link: "https://www.instagram.com", icon: "bi bi-instagram" },
    { id: 3, title: "X", link: "https://www.x.com", icon: "bi bi-twitter-x" }
];

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const { user, userData, isRealtor } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300 rounded-2xl ${
                scrolled ? 'glass py-3 shadow-2xl' : 'bg-transparent py-5'
            }`}
        >
            <div className='flex justify-between items-center sm:px-12 px-6'>
                {/* Logo Container */}
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/')}
                    className='flex items-center gap-2 cursor-pointer'
                >
                    <img src={Logo} alt="Logo" className='h-10 w-auto object-contain' />
                    <span className='text-xl font-bold tracking-tight hidden sm:block'>Inmobiliaria ICPE</span>
                </motion.div>

                {/* Desktop Menu */}
                <div className='hidden md:block'>
                    <ul className='flex items-center'>
                        <li>
                            <Link to="/" className='text-sm font-medium hover:text-[var(--accent)] transition-colors duration-300 px-4'>Inicio</Link>
                        </li>
                        <span className="text-[var(--glass-border)] opacity-30 select-none">|</span>
                        
                        {/* Products Dropdown */}
                        <li className='relative' 
                            onMouseEnter={() => setProductsOpen(true)}
                            onMouseLeave={() => setProductsOpen(false)}
                        >
                            <button className='flex items-center text-sm font-medium hover:text-[var(--accent)] transition-colors duration-300 px-4 cursor-pointer'>
                                Productos <i className={`bi bi-chevron-down ml-1 text-[10px] transition-transform ${productsOpen ? 'rotate-180' : ''}`}></i>
                            </button>
                            <AnimatePresence>
                                {productsOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className='absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 glass rounded-xl overflow-hidden shadow-xl py-2'
                                    >
                                        {productSubLinks.map((sub) => (
                                            <Link 
                                                key={sub.type}
                                                to={`/productos?type=${sub.type}`}
                                                className='block px-4 py-2 text-sm hover:bg-[var(--accent-muted)] transition-colors'
                                            >
                                                {sub.title}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </li>
                        <span className="text-[var(--glass-border)] opacity-30 select-none">|</span>

                        {navbarLinks.slice(1).map((link, index) => (
                            <React.Fragment key={link.id}>
                                <li>
                                    <motion.a 
                                        whileHover={{ y: -2 }}
                                        className='text-sm font-medium hover:text-[var(--accent)] transition-colors duration-300 px-4' 
                                        href={link.link}
                                    >
                                        {link.title}
                                    </motion.a>
                                </li>
                                <span className="text-[var(--glass-border)] opacity-30 select-none">|</span>
                            </React.Fragment>
                        ))}

                        {/* Admin Link (Realtor only) */}
                        {isRealtor && (
                            <li>
                                <Link 
                                    to="/admin" 
                                    className='text-sm font-bold text-[var(--accent)] hover:brightness-110 transition-colors px-4'
                                >
                                    ADMINISTRAR
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Social & Auth & Mobile Toggle */}
                <div className='flex items-center space-x-2'>
                    {/* Auth Section */}
                    <div className='hidden md:flex items-center mr-4'>
                        {user ? (
                            <div className='relative'
                                onMouseEnter={() => setProfileOpen(true)}
                                onMouseLeave={() => setProfileOpen(false)}
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    className='flex items-center gap-2 cursor-pointer bg-[var(--accent-muted)] px-3 py-1 rounded-full'
                                >
                                    {userData?.profilePictureURL ? (
                                        <img src={userData.profilePictureURL} alt="Profile" className='w-6 h-6 rounded-full object-cover' />
                                    ) : (
                                        <i className="bi bi-person-circle text-xl"></i>
                                    )}
                                    <span className='text-xs font-semibold'>{userData?.fullname?.split(' ')[0] || 'Perfil'}</span>
                                </motion.div>
                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className='absolute top-full right-0 mt-2 w-40 glass rounded-xl overflow-hidden shadow-xl py-2'
                                        >
                                            <button 
                                                onClick={handleLogout}
                                                className='w-full text-left px-4 py-2 text-sm hover:bg-red-500/20 transition-colors text-red-400'
                                            >
                                                Cerrar Sesión
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/auth')}
                                className='bg-[var(--accent)] text-[var(--primary)] text-xs font-bold py-2 px-6 rounded-full transition-all'
                            >
                                Iniciar Sesión
                            </motion.button>
                        )}
                    </div>

                    <div className='hidden md:flex items-center'>
                        {navBarSocialnetworks.map((social, index) => (
                            <React.Fragment key={social.id}>
                                <motion.a 
                                    whileHover={{ scale: 1.2, color: '#D4AF37' }}
                                    className='text-lg px-2' 
                                    href={social.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <i className={social.icon}></i>
                                </motion.a>
                            </React.Fragment>
                        ))}
                    </div>

                    <button onClick={toggleMenu} className='md:hidden p-2 text-[var(--secondary)]'>
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='md:hidden glass mt-4 rounded-xl overflow-hidden px-6 py-4 mx-4'
                    >
                        <ul className='flex flex-col space-y-4'>
                            <li><Link to="/" onClick={toggleMenu} className='text-lg font-medium block'>Inicio</Link></li>
                            <li className='border-t border-[var(--glass-border)] pt-4'>
                                <span className='text-sm opacity-50 block mb-2 font-bold'>PRODUCTOS</span>
                                <div className='grid grid-cols-1 gap-2 pl-2'>
                                    {productSubLinks.map(sub => (
                                        <Link key={sub.type} to={`/productos?type=${sub.type}`} onClick={toggleMenu} className='text-sm'>{sub.title}</Link>
                                    ))}
                                </div>
                            </li>
                            {navbarLinks.slice(1).map((link) => (
                                <li key={link.id}>
                                    <a className='text-lg font-medium block' href={link.link} onClick={toggleMenu}>
                                        {link.title}
                                    </a>
                                </li>
                            ))}
                            {isRealtor && (
                                <li className='border-t border-[var(--glass-border)] pt-4'>
                                    <Link to="/admin" onClick={toggleMenu} className='text-lg font-bold text-[var(--accent)]'>
                                        ADMINISTRAR
                                    </Link>
                                </li>
                            )}
                        </ul>
                        
                        <div className='mt-6 pt-6 border-t border-[var(--glass-border)]'>
                            {!user ? (
                                <button 
                                    onClick={() => { navigate('/auth'); toggleMenu(); }}
                                    className='w-full bg-[var(--accent)] text-[var(--primary)] font-bold py-3 rounded-xl mb-6'
                                >
                                    Iniciar Sesión
                                </button>
                            ) : (
                                <div className='flex items-center justify-between mb-6'>
                                    <div className='flex items-center gap-3'>
                                        <i className="bi bi-person-circle text-2xl"></i>
                                        <span className='font-bold'>{userData?.fullname || 'Usuario'}</span>
                                    </div>
                                    <button onClick={handleLogout} className='text-red-400 text-sm'>Cerrar Sesión</button>
                                </div>
                            )}

                            <div className='flex justify-center space-x-8'>
                                {navBarSocialnetworks.map((social) => (
                                    <a key={social.id} href={social.link} onClick={toggleMenu}>
                                        <i className={`${social.icon} text-2xl`}></i>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}

export default NavBar
