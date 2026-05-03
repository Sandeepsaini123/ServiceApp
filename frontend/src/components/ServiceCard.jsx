import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ServiceCard = ({ service }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-1.5 hover:shadow-violet-100 hover:shadow-lg hover:border-violet-100 transition-all duration-300">
      {/* Image */}
      {service.image ? (
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-5xl">
          🛠
        </div>
      )}

      {/* Body */}
      <div className="p-5">
        <h3 className="text-base font-bold text-slate-900 mb-1.5">{service.name}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-5 min-h-[40px]">
          {service.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xl font-extrabold text-violet-600">₹{service.price}</span>

          {user ? (
            <Link
              to={`/booking?service=${service._id}`}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Book Now
            </Link>
          ) : (
            <Link
              to="/login"
              className="border border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Login to Book
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
