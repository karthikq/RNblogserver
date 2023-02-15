const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
var serviceAccount = require("./fgdfgs-98a02-firebase-adminsdk-i16ux-ea322c9743.json");

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.notification = async (title, body, image, deviceToken) => {
  try {
    console.log("sd");

    const message = {
      token: [deviceToken],

      notification: {
        title: title,
        body: body,
        imageUrl: image
          ? image
          : "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?cs=srgb&dl=pexels-pixabay-268533.jpg&fm=jpg",
      },
    };

    const status = await admin.messaging().sendMulticast(message);
    console.log(status);
  } catch (error) {
    console.log(error);
  }
};

exports.sendtomany = async (title, body, image, userTokens) => {
  const message = {
    tokens: userTokens,
    notification: {
      title: "Basic Notification",
      body: "This is a basic notification sent from the server!",
      imageUrl:
        "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?cs=srgb&dl=pexels-pixabay-268533.jpg&fm=jpg",
    },
  };

  const status = await admin.messaging().sendMulticast(message);
};
