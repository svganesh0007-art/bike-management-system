
const Service = require("../models/Service");
const Bike = require("../models/Bike");

const addService = async (req, res) => {
    try {
        const {
            userId,
            bikeId,
            serviceDate,
            serviceCenter,
            serviceType,
            amount,
            description,
            nextServiceDate
        } = req.body;

        if (!userId || !bikeId || !serviceDate || !serviceCenter || !serviceType || amount === undefined || amount === "") {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        if (Number(amount) < 0) {
            return res.status(400).json({
                success: false,
                message: "Amount cannot be negative"
            });
        }

        const bike = await Bike.findOne({ _id: bikeId, userId });

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        const service = await Service.create({
            userId,
            bikeId,
            serviceDate,
            serviceCenter,
            serviceType,
            amount,
            description,
            nextServiceDate: nextServiceDate || undefined
        });

        res.status(201).json({
            success: true,
            message: "Service record added successfully",
            service
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getBikeServices = async (req, res) => {
    try {
        const { bikeId } = req.params;
        const { userId } = req.query;

        const bike = await Bike.findOne({ _id: bikeId, userId });

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        const services = await Service.find({
            bikeId,
            userId
        }).sort({ serviceDate: -1 });

        res.status(200).json({
            success: true,
            services
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const {
            userId,
            serviceDate,
            serviceCenter,
            serviceType,
            amount,
            description,
            nextServiceDate
        } = req.body;

        if (!userId || !serviceDate || !serviceCenter || !serviceType || amount === undefined || amount === "") {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        if (Number(amount) < 0) {
            return res.status(400).json({
                success: false,
                message: "Amount cannot be negative"
            });
        }

        const service = await Service.findOne({
            _id: serviceId,
            userId
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service record not found"
            });
        }

        service.serviceDate = serviceDate;
        service.serviceCenter = serviceCenter;
        service.serviceType = serviceType;
        service.amount = amount;
        service.description = description;
        service.nextServiceDate = nextServiceDate || undefined;

        await service.save();

        res.status(200).json({
            success: true,
            message: "Service record updated successfully",
            service
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const service = await Service.findOne({
            _id: serviceId,
            userId
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service record not found"
            });
        }

        await Service.deleteOne({
            _id: serviceId,
            userId
        });

        res.status(200).json({
            success: true,
            message: "Service record deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addService,
    getBikeServices,
    updateService,
    deleteService
};
