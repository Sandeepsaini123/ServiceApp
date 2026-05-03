import API from "./api";

export const createPaymentIntent = (data) =>
  API.post("/payment/create-intent", data);

export const confirmBooking = (data) =>
  API.post("/payment/confirm-booking", data);
