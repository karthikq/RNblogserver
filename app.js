require("dotenv").config();
const express = require("express");
const Connection = require("./config/db");
const Mailer = require("./mail/Mailer");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
Connection();

app.use("/auth", require("./routes/authRoute"));
app.use("/post", require("./routes/postRoute"));
app.use("/user", require("./routes/userRoute"));

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;

  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log("server is running in PORT " + PORT);
});
