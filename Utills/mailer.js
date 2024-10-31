import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.PASS_MAIL,
        pass: process.env.PASS_KEY
    },
});


const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.PASS_MAIL,
        to,
        subject,
        text
    };
    return transporter.sendMail(mailOptions)
};

export default sendEmail;