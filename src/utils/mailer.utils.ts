import nodemailer,{SendMailOptions} from 'nodemailer';
import {Request,Response} from 'express';
import { number, string } from 'zod';
import log from "./logger.utils.js";


const smtp={
  user:process.env.smtpUser as string,
    pass:process.env.smtpPass as string,
    host:process.env.smtpHost as string,
    port:parseInt(process.env.smtpPort as string),
    secure:(process.env.smtpSecure as string)==="true"
}

 // create reusable transporter object using the default SMTP transport
const transporter= nodemailer.createTransport({
    ...smtp,
    auth:{user:smtp.user,pass:smtp.pass}
});


 async function sendEmail(payload: SendMailOptions){

    transporter.sendMail(payload, (err, info) => {
        if (err) {
          log.error(err, "Error sending email");
          return;
        }
    
        log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      });
    }
      

export default sendEmail;
