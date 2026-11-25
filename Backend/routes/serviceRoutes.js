
const express = require("express");
const router = express.Router();

const {
    addService,
    getBikeServices,
    updateService,
    deleteService
} = require("../controllers/serviceController");

router.post("/add", addService);
router.get("/bike/:bikeId", getBikeServices);
router.put("/update/:serviceId", updateService);
router.delete("/delete/:serviceId", deleteService);

module.exports = router;
