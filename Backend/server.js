
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const documentRoutes = require("./routes/documentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const profileRoutes = require("./routes/profileRoutes");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
    console.log("HIT:", req.method, req.originalUrl);
    next();
});

app.get("/", (req, res) => {
    res.send("Bike Management Backend is Running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/profile", profileRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
