
const express = require("express");
const router = express.Router();

const {
    addBike,
    getMyBikes,
    updateBike,
    deleteBike,
    searchBike
} = require("../controllers/bikeController");

router.post("/add", addBike);
router.get("/my-bikes/:userId", getMyBikes);
router.put("/update/:bikeId", updateBike);
router.delete("/delete/:bikeId", deleteBike);
router.get("/search/:registrationNumber", searchBike);

module.exports = router;
