"use strict";
import nodemailer from "nodemailer";
import { FROM_EMAILADDRESS, FROM_EMAILPASSWORD, FROM_EMAILTITLE, FROM_EMAILSUBJECT } from "../constants"

export async function sendEmail(to: string, html: string) {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: FROM_EMAILADDRESS, // generated ethereal user
      pass: FROM_EMAILPASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: FROM_EMAILTITLE, // sender address
    to: to, // list of receivers
    subject: FROM_EMAILSUBJECT, // Subject line
    html
   });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}