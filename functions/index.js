import { onCall, HttpsError } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendAppointmentEmail = onCall({ cors: true, invoker: "public" }, async (request) => {
    // Check authentication if needed (optional for public appointments)
    // const auth = request.auth;
    
    const { customerName, customerPhone, propertyAddress, propertyCity, propertyPrice } = request.data;

    if (!customerName || !customerPhone || !propertyAddress) {
        throw new HttpsError("invalid-argument", "Missing required information.");
    }

    const mailOptions = {
        from: `"Inmobiliaria ICPE" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL,
        subject: `Nueva Cita Agendada: ${propertyAddress}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-top: 10px solid #470000; border-radius: 8px;">
                <h2 style="color: #470000; text-align: center;">Nueva Solicitud de Cita</h2>
                <p>Has recibido una nueva solicitud de cita para una propiedad.</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                
                <h3 style="color: #D4AF37;">Información del Cliente</h3>
                <p><strong>Nombre:</strong> ${customerName}</p>
                <p><strong>Teléfono:</strong> ${customerPhone}</p>
                
                <h3 style="color: #D4AF37;">Información de la Propiedad</h3>
                <p><strong>Dirección:</strong> ${propertyAddress}</p>
                <p><strong>Ciudad:</strong> ${propertyCity}</p>
                <p><strong>Precio:</strong> ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(propertyPrice)}</p>
                
                <hr style="border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #777; text-align: center;">Este es un mensaje generado automáticamente desde el Sistema de Inventario ICPE.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: "Email sent successfully." };
    } catch (error) {
        logger.error("Error sending email:", error);
        throw new HttpsError("internal", "Unable to send email at this time.");
    }
});
