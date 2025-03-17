const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email{
    constructor(member, url){
        this.to = member.email;
        this.firstName = member.name.split(' ')[0];
        this.url = url;
        this.from = `Admin <${process.env.EMAIL_FROM}>`;
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production') return 1;
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    //Generic mehtod to send emails
    async send(template, subject){
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,
             {
                firstName: this.firstName,
                url: this.url,
                subject
            });
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.htmlToText(html)
        };
        const transporter = this.newTransport();
        await transporter.sendMail(mailOptions);
        console.log('Email sent');
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the ProjectX Family!');
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Reset your password,your reset token is valid for 10 minutes.');
    }
}

module.exports = Email;