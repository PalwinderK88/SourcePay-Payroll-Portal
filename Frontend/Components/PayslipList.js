import { useState } from 'react';
import PayslipBreakdown from './PayslipBreakdown';

export default function PayslipList({ payslips }) {
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    const formatCurrency = (amount) => {
      if (!amount) return '-';
      return `£${parseFloat(amount).toFixed(2)}`;
    };

    const hasBreakdown = (payslip) => {
      return payslip.gross_pay || payslip.tax_amount || payslip.national_insurance || 
             payslip.cis_deduction || payslip.pension_contribution || payslip.admin_fee;
    };

    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr className="border-b">
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Period</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Net Pay</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Gross Pay</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Deductions</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map(p => {
                const totalDeductions = (parseFloat(p.tax_amount) || 0) + 
                                       (parseFloat(p.national_insurance) || 0) + 
                                       (parseFloat(p.cis_deduction) || 0) + 
                                       (parseFloat(p.pension_contribution) || 0) + 
                                       (parseFloat(p.admin_fee) || 0);
                
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-800 font-medium">
                      {p.month} {p.year}
                    </td>
                    <td className="p-3 text-sm text-gray-800 font-bold text-green-700">
                      {formatCurrency(p.net_pay || p.amount)}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {formatCurrency(p.gross_pay)}
                    </td>
                    <td className="p-3 text-sm text-red-600">
                      {totalDeductions > 0 ? `- ${formatCurrency(totalDeductions)}` : '-'}
                    </td>
                    <td className="p-3 text-sm">
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {hasBreakdown(p) && (
                          <button
                            onClick={() => setSelectedPayslip(p)}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              boxShadow: '0 2px 4px rgba(44, 62, 46, 0.2)'
                            }}
                          >
                            📊 View Breakdown
                          </button>
                        )}
                        <a 
                          href={p.file_path} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            padding: '6px 12px',
                            background: '#ffffff',
                            color: '#2C3E2E',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: 'inline-block',
                            transition: 'all 0.3s'
                          }}
                        >
                          📄 Download PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {payslips.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No payslips available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Breakdown Modal */}
        {selectedPayslip && (
          <PayslipBreakdown 
            payslip={selectedPayslip} 
            onClose={() => setSelectedPayslip(null)} 
          />
        )}
      </>
    );
  }
