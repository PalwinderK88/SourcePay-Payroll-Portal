import { useState } from 'react';
import api from '../utils/api';

export default function UploadPayslip({ users }) {
  const [userId, setUserId] = useState('');
  const [periodType, setPeriodType] = useState('monthly');
  const [month, setMonth] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState('');
  const [holidayPay, setHolidayPay] = useState('');
  const [sickPay, setSickPay] = useState('');
  const [expenses, setExpenses] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Breakdown fields
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [grossPay, setGrossPay] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [nationalInsurance, setNationalInsurance] = useState('');
  const [cisDeduction, setCisDeduction] = useState('');
  const [pensionContribution, setPensionContribution] = useState('');
  const [adminFee, setAdminFee] = useState('');
  const [netPay, setNetPay] = useState('');
  const [breakdownNotes, setBreakdownNotes] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  const handleUpload = async (e) => {
    e.preventDefault();
    
    // Validation based on period type
    if (!file || !userId || !year) {
      return alert('Please fill all required fields');
    }
    
    if (periodType === 'monthly' && !month) {
      return alert('Please select a month');
    }
    
    if (periodType === 'weekly' && !weekNumber) {
      return alert('Please select a week number');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('period_type', periodType);
    
    if (periodType === 'monthly') {
      formData.append('month', month);
    } else {
      formData.append('week_number', weekNumber);
    }
    
    formData.append('year', year);
    formData.append('amount', amount);
    if (holidayPay) formData.append('holiday_pay', holidayPay);
    if (sickPay) formData.append('sick_pay', sickPay);
    if (expenses) formData.append('expenses', expenses);
    
    // Add breakdown fields if provided
    if (grossPay) formData.append('gross_pay', grossPay);
    if (taxAmount) formData.append('tax_amount', taxAmount);
    if (nationalInsurance) formData.append('national_insurance', nationalInsurance);
    if (cisDeduction) formData.append('cis_deduction', cisDeduction);
    if (pensionContribution) formData.append('pension_contribution', pensionContribution);
    if (adminFee) formData.append('admin_fee', adminFee);
    if (netPay) formData.append('net_pay', netPay);
    if (breakdownNotes) formData.append('breakdown_notes', breakdownNotes);
    
    formData.append('file', file);

    try {
      const response = await api.post('/api/payslips/upload', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      alert('Payslip uploaded successfully!');
      console.log('Upload response:', response.data);
      
      // Reset form
      setUserId('');
      setPeriodType('monthly');
      setMonth('');
      setWeekNumber('');
      setYear(new Date().getFullYear().toString());
      setAmount('');
      setHolidayPay('');
      setSickPay('');
      setExpenses('');
      setGrossPay('');
      setTaxAmount('');
      setNationalInsurance('');
      setCisDeduction('');
      setPensionContribution('');
      setAdminFee('');
      setNetPay('');
      setBreakdownNotes('');
      setFile(null);
      setShowBreakdown(false);
      // Reset file input
      e.target.reset();
    } catch (err) {
      console.error('Error uploading payslip:', err);
      alert(err.response?.data?.message || 'Error uploading payslip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="p-6 border rounded-lg shadow-md bg-white max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Payslip</h2>
      
      <div className="space-y-4">
        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee *
          </label>
          <select 
            value={userId} 
            onChange={e => setUserId(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required
          >
            <option value="">-- Select Employee --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        {/* Period Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period Type *
          </label>
          <select 
            value={periodType} 
            onChange={e => {
              setPeriodType(e.target.value);
              setMonth('');
              setWeekNumber('');
            }} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {/* Conditional Period Selection */}
        <div className="grid grid-cols-2 gap-4">
          {periodType === 'monthly' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <select 
                value={month} 
                onChange={e => setMonth(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              >
                <option value="">-- Select Month --</option>
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Week Number *
              </label>
              <select 
                value={weekNumber} 
                onChange={e => setWeekNumber(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              >
                <option value="">-- Select Week --</option>
                {weeks.map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year *
            </label>
            <input 
              type="number" 
              value={year} 
              onChange={e => setYear(e.target.value)} 
              min="2000" 
              max="2100"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (Optional)
          </label>
          <input 
            type="number" 
            step="0.01"
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="e.g., 5000.00"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>

        {/* Breakdown Section Toggle */}
        <div className="border-t pt-4 mt-2">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-lg font-semibold text-gray-700">
              📊 Payslip Breakdown (Optional)
            </span>
            <span className="text-2xl text-gray-500">
              {showBreakdown ? '−' : '+'}
            </span>
          </button>
          
          {showBreakdown && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-4">
                💡 <strong>Tip:</strong> Adding breakdown details helps contractors understand their deductions with plain-English explanations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gross Pay */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💰 Gross Pay
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={grossPay} 
                    onChange={e => setGrossPay(e.target.value)} 
                    placeholder="e.g., 5000.00"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>

                {/* Tax Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏛️ Income Tax
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={taxAmount} 
                    onChange={e => setTaxAmount(e.target.value)} 
                    placeholder="e.g., 800.00"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>

                {/* National Insurance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏥 National Insurance
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={nationalInsurance} 
                    onChange={e => setNationalInsurance(e.target.value)} 
                    placeholder="e.g., 400.00"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>

                {/* CIS Deduction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏗️ CIS Deduction
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={cisDeduction} 
                    onChange={e => setCisDeduction(e.target.value)} 
                    placeholder="e.g., 1000.00"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>

                {/* Pension Contribution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏦 Pension Contribution
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={pensionContribution} 
                    onChange={e => setPensionContribution(e.target.value)} 
                    placeholder="e.g., 200.00"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>

                {/* Admin Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📋 Admin Fee
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={adminFee} 
                    onChange={e => setAdminFee(e.target.value)} 
                    placeholder="e.g., 50.00"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>

                {/* Net Pay */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💵 Net Pay (Take Home)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={netPay} 
                    onChange={e => setNetPay(e.target.value)} 
                    placeholder="e.g., 2550.00"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold" 
                  />
                </div>

                {/* Breakdown Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Additional Notes
                  </label>
                  <textarea 
                    value={breakdownNotes} 
                    onChange={e => setBreakdownNotes(e.target.value)} 
                    placeholder="Any additional information about this payslip..."
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Optional Fields Section */}
        <div className="border-t pt-4 mt-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Additional Payments (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Holiday Pay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Holiday Pay
              </label>
              <input 
                type="number" 
                step="0.01"
                value={holidayPay} 
                onChange={e => setHolidayPay(e.target.value)} 
                placeholder="e.g., 500.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            {/* Sick Pay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sick Pay
              </label>
              <input 
                type="number" 
                step="0.01"
                value={sickPay} 
                onChange={e => setSickPay(e.target.value)} 
                placeholder="e.g., 300.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            {/* Expenses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expenses
              </label>
              <input 
                type="number" 
                step="0.01"
                value={expenses} 
                onChange={e => setExpenses(e.target.value)} 
                placeholder="e.g., 150.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payslip File (PDF) *
          </label>
          <input 
            type="file" 
            accept=".pdf"
            onChange={e => setFile(e.target.files[0])} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            required 
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full p-3 rounded-lg font-semibold text-white transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload Payslip'}
        </button>
      </div>
    </form>
  );
}
