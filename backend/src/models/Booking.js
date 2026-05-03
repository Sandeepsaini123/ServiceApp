import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    date:    String,
    address: String,
    status:  { type: String, default: "pending" },

    // Stripe payment fields
    paymentStatus:   { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
    paymentIntentId: { type: String, default: null },
    amountPaid:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
