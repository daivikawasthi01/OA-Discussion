require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // Find user by email pattern
  const user = await User.findOne({
    email: { $regex: /^daivik\.awasthi\.ug23@/i }
  });

  if (!user) {
    console.log("User not found");
    process.exit(1);
  }

  // Update points and name
  user.points = 220;
  user.name = "Curator";
  await user.save();

  console.log(`Updated user: ${user.email} - Name: ${user.name}, Points: ${user.points}`);
  process.exit(0);
}

run();