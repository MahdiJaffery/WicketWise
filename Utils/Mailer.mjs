import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mahdijaffri5@gmail.com',
        pass: 'awsl yuih zgqy vpnv'
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        let info = await transporter.sendMail({
            from: '"WicketWise"',
            to,
            subject,
            text,
            html
        })
    } catch (err) {
        console.log(err.message);
    }
}

export default sendEmail;