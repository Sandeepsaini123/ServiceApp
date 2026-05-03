import Stripe from "stripe";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

// Lazy init — ensures dotenv is loaded before Stripe reads the key
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payment/create-intent
 * Creates a Stripe PaymentIntent for a given service.
 * Frontend uses the returned clientSecret to render the Stripe card form.
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { serviceId, date, address } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const amountInPaise = Math.round(service.price * 100);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountInPaise,
      currency: "inr",
      metadata: {
        serviceId: service._id.toString(),
        serviceName: service.name,
        userId: req.user.id,
        date,
        address,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/payment/confirm-booking
 * Called after successful Stripe payment on frontend.
 * Verifies the PaymentIntent with Stripe, then creates the booking.
 */
export const confirmBooking = async (req, res) => {
  try {
    const { paymentIntentId, serviceId, date, address } = req.body;

    // Verify payment with Stripe — never trust frontend alone
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Prevent duplicate bookings for same payment
    const existing = await Booking.findOne({ paymentIntentId });
    if (existing) {
      return res.json(existing);
    }

    const booking = await Booking.create({
      user: req.user.id,
      service: serviceId,
      date,
      address,
      status: "confirmed",
      paymentStatus: "paid",
      paymentIntentId,
      amountPaid: paymentIntent.amount / 100,
    });

    const populated = await booking.populate("service", "name price");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/payment/webhook
 * Stripe webhook — handles async payment events (optional but recommended).
 * Requires raw body — configured in index.js before express.json()
 */
export const stripeWebhook = async (req, res) => {
  // Webhook is optional — skip if secret not configured
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.json({ received: true });
  }

  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    // Update booking if it exists (created via confirmBooking)
    await Booking.findOneAndUpdate(
      { paymentIntentId: pi.id },
      { paymentStatus: "paid", status: "confirmed" }
    );
  }

  res.json({ received: true });
};
