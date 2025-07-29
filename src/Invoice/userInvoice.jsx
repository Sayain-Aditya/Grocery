import React, { useRef } from "react";
import ReactToPrint from "react-to-print";

const UserInvoice = ({ order }) => {
  const invoiceRef = useRef();

  return (
    <div className="p-4">
      {ReactToPrint ? (
        <ReactToPrint
          trigger={() => (
            <button className="mb-4 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
              🧾 Download Invoice
            </button>
          )}
          content={() => invoiceRef.current}
        />
      ) : (
        <div className="mb-4 text-red-600">
          Download feature unavailable. Please install{" "}
          <code>react-to-print</code>.
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-1">Delivery Address:</h3>
        {order.address ? (
          <>
            <p>
              {order.address.fullName}{order.address.phone ? `, ${order.address.phone}` : ""}
            </p>
            <p>{order.address.street}</p>
            <p>
              {order.address.city}{order.address.state ? `, ${order.address.state}` : ""}{order.address.zip ? ` - ${order.address.zip}` : ""}
            </p>
          </>
        ) : (
          <p className="text-gray-400">No address provided.</p>
        )}
      </div>

      <div
        ref={invoiceRef}
        className="bg-white p-8 border rounded shadow w-full max-w-2xl mx-auto text-sm print:text-black"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">GroceryZone</h1>
            <p className="text-gray-500 text-xs">www.groceryzone.com</p>
          </div>
          <img
            src="/logo192.png" // Change to your actual logo path
            alt="Logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Invoice Info */}
        <div className="mb-4 border-t pt-4">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Invoice</h2>
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <p>
            <strong>Billed To:</strong>
          </p>
          <p>{order.user?.name}</p>
          <p>{order.user?.email}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 border border-gray-300">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="border px-3 py-1 text-left">Product</th>
              <th className="border px-3 py-1 text-center">Qty</th>
              <th className="border px-3 py-1 text-right">Price</th>
              <th className="border px-3 py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.product._id}>
                <td className="border px-3 py-1">{item.product.name}</td>
                <td className="border px-3 py-1 text-center">
                  {item.quantity}
                </td>
                <td className="border px-3 py-1 text-right">
                  ₹{item.product.price}
                </td>
                <td className="border px-3 py-1 text-right">
                  ₹{item.quantity * item.product.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="text-right mb-4">
          <p className="text-xl font-semibold text-gray-800">
            Total Amount: ₹{order.total}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs border-t pt-4">
          <p>Thank you for shopping with GroceryZone!</p>
          <p>Invoice generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default UserInvoice;
