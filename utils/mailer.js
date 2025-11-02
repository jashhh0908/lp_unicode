import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config()
const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    service: "gmail",
    port: 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const mail = async (to, subject, html) => {
    const receiver = ({
        from: `Unicode Mentee <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    }) 
    transporter.sendMail(receiver, (error) => {
        if(error)
            throw(error);
        console.log("Email sent: ", receiver.to);
        response.end();
    })
};

export default mail;