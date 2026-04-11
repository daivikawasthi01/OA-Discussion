require("dotenv").config();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const User = require("./models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://daivik12:BfT98dD0y3o2rL5D@cluster0.zox7b.mongodb.net/oadiscussion?retryWrites=true&w=majority&appName=Cluster0");
  const email = "test@example.com";
  const password = "Password123!";
  const hashed = await bcryptjs.hash(password, 10);
  
  await User.deleteOne({ email });
  await User.create({ email, password: hashed, isVerified: true });
  console.log("Created user: test@example.com / Password123!");
  process.exit(0);
}
run();
