var SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;

var apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.API_KEY;

var partnerKey = defaultClient.authentications["partner-key"];
partnerKey.apiKey = process.env.API_KEY;

var api = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendEmail = () => {
  const sender = {
    email: "kk968346@gmail.com",
  };

  const reciver = [
    {
      email: "devarticles99@gmail.com",
    },
  ];

  api
    .sendTransacEmail({
      sender,
      to: reciver,
      subject: "test",
      textContent: "test",
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};
