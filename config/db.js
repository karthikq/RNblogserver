const { default: mongoose } = require("mongoose");

async function Connection() {
  try {
    await mongoose.connect(
      `mongodb+srv://testuser:${process.env.MONGO_PASS}@cluster0.44gx5.mongodb.net/reactnativeblog`
    );
    mongoose.set("strictQuery", true);
    mongoose.connection.on("connected", () => {
      console.log("Coonected to database");
    });
    mongoose.connection.on("connected", () => {
      throw Error("Error while connecting to databse");
    });
  } catch (error) {
    console.log(error);
    throw Error("Error while connecting to databse");
  }
}

module.exports = Connection;
