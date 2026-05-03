import API from "./api";

export const createBooking = (data) => API.post("/bookings", data);
export const getUserBookings = () => API.get("/bookings");
export const getAllBookings = () => API.get("/bookings/all");
export const updateBookingStatus = (id, status) =>
  API.patch(`/bookings/${id}/status`, { status });
