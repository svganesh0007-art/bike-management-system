
const express = require("express");
const router = express.Router();

const {
    addExpense,
    getBikeExpenses,
    updateExpense,
    deleteExpense
} = require("../controllers/expenseController");

router.post("/add", addExpense);
router.get("/bike/:bikeId", getBikeExpenses);
router.put("/update/:expenseId", updateExpense);
router.delete("/delete/:expenseId", deleteExpense);

module.exports = router;
