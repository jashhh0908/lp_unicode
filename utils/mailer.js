import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    secure: true,
    service: "gmail",
    port: 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendMail = async (to, subject, html, text) => {
    const receiver = ({
        from: `Unicode Mentee <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text
    }) 
    transporter.sendMail(receiver, (error) => {
        if(error)
            throw(error);
        console.log("success!");
        response.end();
    })
};

export default sendMail;