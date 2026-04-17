import React from 'react'
import Character from '../../assets/character.png'
import Logo from '../../assets/logo.png'
import { motion } from 'framer-motion'

const Hero = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    return (
        <section className='min-h-screen flex items-center pt-24 pb-12 px-6'>
            <div className='max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>

                {/* Text Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className='order-2 md:order-1 flex flex-col items-center md:items-start text-center md:text-left'
                >
                    <motion.div variants={itemVariants} className='mb-8'>
                        <img src={Logo} alt="Logo" className='h-20 w-auto mb-6 block' />
                        <h1 className='text-4xl md:text-6xl font-black leading-tight text-white mb-4'>
                            Bienvenido a <span className='text-gradient'>TU HOGAR</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className='text-lg md:text-xl text-[var(--secondary)] opacity-90 max-w-xl leading-relaxed mb-10'
                    >
                        Tu hogar es un pilar fundamental en tu vida. Nosotros te ayudamos a encontrar un lugar para tu negocio que se sienta como estar en casa. Tanto si lo que quieres es comprar como vender, has llegado al lugar correcto.
                    </motion.p>

                    <motion.div variants={itemVariants} className='flex flex-wrap justify-center md:justify-start gap-6'>
                        <motion.a
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(212, 175, 55, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            className='bg-[var(--accent)] text-[var(--primary)] font-bold py-4 px-10 rounded-full inline-flex items-center justify-center gap-4 transition-all duration-300 whitespace-nowrap'
                            href="#"
                        >
                            Ubicación <i className="bi bi-geo-alt text-xl"></i>
                        </motion.a>

                        <motion.a
                            whileHover={{ scale: 1.05, color: '#D4AF37' }}
                            whileTap={{ scale: 0.95 }}
                            href="#"
                            className='text-white border-b-2 border-transparent hover:border-[var(--accent)] py-2 flex items-center gap-3 font-semibold transition-all duration-300'
                        >
                            Vender <i className="bi bi-coin text-xl"></i>
                        </motion.a>
                    </motion.div>
                </motion.div>

                {/* Image Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className='order-1 md:order-2 relative group'
                >
                    <div className='absolute -inset-4 bg-[var(--accent)] rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500'></div>
                    <img
                        src={Character}
                        alt="Imagen de presentadora"
                        className='relative z-10 w-full max-w-lg mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                    />
                </motion.div>

            </div>
        </section>
    )
}

export default Hero
