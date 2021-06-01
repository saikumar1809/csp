/* eslint-disable lines-between-class-members */
//const { getMaxListeners } = require('node:process');
const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split("")[0];
    this.url = url;
    this.from = `Team carrer sathi program<${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV.includes("production")) {
      //Send grid

      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.Email_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      //activate to gmail "less secure app " option 500 emails per day if we use GMAIL
    });
  }
  async send(template, subject) {
    //Send the actual email
    //1)Render Html for email based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      //html:
    };

    //3) create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("Welcome", "Welcome to the CSP Family!");
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token is valid for only 10 min"
    );
  }
};
