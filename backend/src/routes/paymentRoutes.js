import express from "express";
import {
  createPaymentIntent,
  confirmBooking,
  stripeWebhook,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Webhook needs raw body — must be before express.json() in index.js
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

router.post("/create-intent", protect, createPaymentIntent);
router.post("/confirm-booking", protect, confirmBooking);

export default router;
