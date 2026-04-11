require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");

require("./config/passport");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

connectDB();

app.set("trust proxy", 1); // behind Vercel / Render proxy

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(passport.initialize());

app.use("/auth", require("./routes/auth.routes"));
app.use("/api/experience", require("./routes/experience.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/comments", require("./routes/comment.route"));
app.use("/api/push", require("./routes/push.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/sidebar", require("./routes/sidebar.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/shop", require("./routes/shop.routes"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
