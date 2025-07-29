import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserInvoice from "../Invoice/userInvoice";

const InvoicePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">No invoice data found.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl">
        <UserInvoice order={order} />
        <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate(-1)}>
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default InvoicePage;
