import nodemailer from "nodemailer";

// Configure email transport
const transporter = nodemailer.createTransport({
    service: "Gmail", // or use your email provider (e.g., Outlook, Yahoo)
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or App Password
    },
});

// Function to send emails
export const sendEmail = async (to: string[], subject: string, text: string) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to, // Array of student emails
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log("📩 Email sent successfully!");
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};
