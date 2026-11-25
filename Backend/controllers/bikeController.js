
const Bike = require("../models/Bike");

const addBike = async (req, res) => {
    try {
        const {
            userId,
            bikeName,
            brand,
            model,
            registrationNumber,
            fuelType,
            purchaseDate
        } = req.body;

        if (!userId || !bikeName || !brand || !model || !registrationNumber || !fuelType || !purchaseDate) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const existingBike = await Bike.findOne({
            registrationNumber: registrationNumber.trim().toUpperCase()
        });

        if (existingBike) {
            return res.status(400).json({
                success: false,
                message: "Registration number already exists"
            });
        }

        const bike = await Bike.create({
            userId,
            bikeName,
            brand,
            model,
            registrationNumber,
            fuelType,
            purchaseDate
        });

        res.status(201).json({
            success: true,
            message: "Bike added successfully",
            bike
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyBikes = async (req, res) => {
    try {
        const { userId } = req.params;

        const bikes = await Bike.find({ userId });

        res.status(200).json({
            success: true,
            bikes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateBike = async (req, res) => {
    try {
        const { bikeId } = req.params;
        const {
            userId,
            bikeName,
            brand,
            model,
            registrationNumber,
            fuelType,
            purchaseDate
        } = req.body;

        const bike = await Bike.findOneAndUpdate(
            { _id: bikeId, userId },
            {
                bikeName,
                brand,
                model,
                registrationNumber,
                fuelType,
                purchaseDate
            },
            { new: true, runValidators: true }
        );

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Bike updated successfully",
            bike
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteBike = async (req, res) => {
    try {
        const { bikeId } = req.params;
        const { userId } = req.body;

        const bike = await Bike.findOneAndDelete({
            _id: bikeId,
            userId
        });

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Bike deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const searchBike = async (req, res) => {
    try {
        const { registrationNumber } = req.params;

        const bike = await Bike.findOne({
            registrationNumber: registrationNumber.trim().toUpperCase()
        }).select("-userId");

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "No bike found with this registration number"
            });
        }

        res.status(200).json({
            success: true,
            bike
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addBike,
    getMyBikes,
    updateBike,
    deleteBike,
    searchBike
};
