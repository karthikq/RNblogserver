const { Expo } = require("expo-server-sdk");
exports.notification = async (title, body, image, deviceToken) => {
  let expo = new Expo({ accessToken: process.env.EXPO_TOKEN });
  let messages = [];
  let somePushTokens =
    typeof deviceToken === "string" ? [deviceToken] : deviceToken;
  console.log(somePushTokens);
  for (let pushToken of somePushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.log("errpr");
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: { imageUrl: image ? image : "" },
      priority: "high",
      channelId: "default",
    });
  }
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

exports.sendtomany = async (title, body, image, userTokens) => {};
