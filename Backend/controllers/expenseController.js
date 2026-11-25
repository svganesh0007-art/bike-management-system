
const Expense = require("../models/Expense");
const Bike = require("../models/Bike");

const addExpense = async (req, res) => {
    try {
        const {
            userId,
            bikeId,
            expenseDate,
            category,
            amount,
            description
        } = req.body;

        if (!userId || !bikeId || !expenseDate || !category || amount === undefined || amount === "") {
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

        const expense = await Expense.create({
            userId,
            bikeId,
            expenseDate,
            category,
            amount,
            description
        });

        res.status(201).json({
            success: true,
            message: "Expense added successfully",
            expense
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getBikeExpenses = async (req, res) => {
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

        const expenses = await Expense.find({
            bikeId,
            userId
        }).sort({ expenseDate: -1 });

        res.status(200).json({
            success: true,
            expenses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;

        const {
            userId,
            expenseDate,
            category,
            amount,
            description
        } = req.body;

        if (!userId || !expenseDate || !category || amount === undefined || amount === "") {
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

        const expense = await Expense.findOne({
            _id: expenseId,
            userId
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        expense.expenseDate = expenseDate;
        expense.category = category;
        expense.amount = amount;
        expense.description = description;

        await expense.save();

        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            expense
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const expense = await Expense.findOne({
            _id: expenseId,
            userId
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        await Expense.deleteOne({
            _id: expenseId,
            userId
        });

        res.status(200).json({
            success: true,
            message: "Expense deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addExpense,
    getBikeExpenses,
    updateExpense,
    deleteExpense
};
