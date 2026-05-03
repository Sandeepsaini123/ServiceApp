import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    image: String
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);