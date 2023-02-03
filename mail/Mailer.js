const nodemailer = require("nodemailer");

const Mailer = (senderEmail, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    priority: "high",
  });

  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: senderEmail,
    subject: "Reset Password request",
    html: `<table style="width: 600px; text-align: left">
     <tbody>
       <tr>
         <td style="width: 600px; text-align: left">
           <div style="text-align: right">
             <img
               src="https://i.ibb.co/Zg1hjXM/92615-forgot-password-password-reset.gif"
               alt="err"
               style="width: 120px; height: 120px"
               height="120px"
               width="100px"
             />
           </div>
           <div>
             <p
               style="
                 color: rgb(11, 6, 75);
                 font-size: 28px;
                 font-family: sans-serif;
                 font-weight: 600;
                 margin-bottom: 12px;
                 margin-top: 0;
               "
             >
               Reset Password OTP
             </p>
             <p
               style="
                 color: rgb(0, 0, 0);
                 font-size: 22px;
                 font-family: system-ui, -apple-system, BlinkMacSystemFont,
                   'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
                   'Helvetica Neue', sans-serif;
                 font-weight: 500;
                 margin-top: 0;
                 margin-bottom: 1px;
               "
             >
               Your One Time Password(OTP) is
               <span style="font-weight: 600">${token}</span>
             </p>
             <p
               style="
                 color: rgb(0, 0, 0);
                 font-size: 18px;
                 font-family: system-ui, -apple-system, BlinkMacSystemFont,
                   'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
                   'Helvetica Neue', sans-serif;
                 font-weight: 400;
                 margin-top: 0;
               "
             >
               The OTP will expire in ten minutes if not used.
             </p>
             <p
               style="
                 margin-top:20px;
                 font-family: system-ui, -apple-system, BlinkMacSystemFont,
                   'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
                   'Helvetica Neue', sans-serif;
                 font-weight: 600;
                 font-size: 18px;
               "
             >
               Thank You
             </p>
           </div>
         </td>
       </tr>
     </tbody>`,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
      throw new Error(err.message);
    } else {
      console.log(info);
      return info.response;
    }
  });
};
module.exports = Mailer;
