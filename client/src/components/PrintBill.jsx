import React from 'react';
import { format } from 'date-fns';

const PrintBill = React.forwardRef(({ patient, tableRows }, ref) => {
  if (!patient) return null;

  return (
    <div ref={ref} className="hidden print:block p-10 bg-white text-black font-sans min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-5xl font-bold uppercase tracking-tighter">ABC Hospital</h1>
        <p className="text-lg font-medium">At Banjari Mor, Gopalhabj, Bihar, 841505</p>
      </div>

      {/* Info Line */}
      <div className="mb-6">
        <p className="text-lg font-bold">Admit Date: {format(new Date(patient.ipdDetails.admissionDate), 'dd-MM-yyyy')}</p>
      </div>

      {/* Bill Table */}
      <table className="w-full border-collapse border-2 border-black">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="border-r-2 border-black p-3 text-center w-16">S.I</th>
            <th className="border-r-2 border-black p-3 text-left">Type</th>
            <th className="border-r-2 border-black p-3 text-center">Unit</th>
            <th className="border-r-2 border-black p-3 text-center">Charge</th>
            <th className="p-3 text-center">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, idx) => (
            <tr key={idx} className="border-b border-black last:border-b-2">
              <td className="border-r-2 border-black p-3 text-center">{idx + 1}</td>
              <td className="border-r-2 border-black p-3 text-left font-medium">{row.type}</td>
              <td className="border-r-2 border-black p-3 text-center">{row.unit}</td>
              <td className="border-r-2 border-black p-3 text-center">{row.amount}</td>
              <td className="p-3 text-center font-bold">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Block */}
      <div className="flex justify-end mt-0">
        <div className="w-80 border-2 border-t-0 border-black p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Grand Total:</span>
            <span className="text-lg font-bold">{patient.billing.grandTotal} /-</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Advance:</span>
            <span className="text-lg font-bold">{patient.billing.totalPaid} /-</span>
          </div>
          <div className="border-t-2 border-black pt-2 flex justify-between items-center">
            <span className="text-xl font-black uppercase">Due Amount:</span>
            <span className="text-xl font-black">{patient.billing.dueAmount} /-</span>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintBill.displayName = 'PrintBill';

export default PrintBill;
