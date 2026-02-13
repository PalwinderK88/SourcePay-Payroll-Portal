import { useState } from 'react';
import { 
  payslipExplanations, 
  getExplanation, 
  calculateBreakdownSummary, 
  formatCurrency,
  commonQuestions 
} from '../utils/payslipExplanations';

export default function PayslipBreakdown({ payslip, onClose }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFAQ, setShowFAQ] = useState(false);

  const summary = calculateBreakdownSummary(payslip);

  const breakdownItems = [
    { field: 'gross_pay', amount: payslip.gross_pay, type: 'earning' },
    { field: 'tax_amount', amount: payslip.tax_amount, type: 'deduction' },
    { field: 'national_insurance', amount: payslip.national_insurance, type: 'deduction' },
    { field: 'cis_deduction', amount: payslip.cis_deduction, type: 'deduction' },
    { field: 'pension_contribution', amount: payslip.pension_contribution, type: 'deduction' },
    { field: 'admin_fee', amount: payslip.admin_fee, type: 'deduction' },
    { field: 'holiday_pay', amount: payslip.holiday_pay, type: 'addition' },
    { field: 'sick_pay', amount: payslip.sick_pay, type: 'addition' },
    { field: 'expenses', amount: payslip.expenses, type: 'addition' },
    { field: 'net_pay', amount: payslip.net_pay, type: 'result' }
  ].filter(item => item.amount && parseFloat(item.amount) !== 0);

  const InfoModal = ({ item, onClose }) => {
    const explanation = getExplanation(item.field);
    
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div style={styles.modalIcon}>{explanation.icon}</div>
            <h3 style={styles.modalTitle}>{explanation.title}</h3>
            <button onClick={onClose} style={styles.modalClose}>×</button>
          </div>
          <div style={styles.modalBody}>
            <div style={styles.amountDisplay}>
              <span style={styles.amountLabel}>Amount:</span>
              <span style={styles.amountValue}>{formatCurrency(item.amount)}</span>
            </div>
            <p style={styles.modalShortDesc}>{explanation.shortDesc}</p>
            <p style={styles.modalFullDesc}>{explanation.fullDesc}</p>
            {explanation.learnMore && (
              <a 
                href={explanation.learnMore} 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.learnMoreLink}
              >
                Learn more on GOV.UK →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Payslip Breakdown</h2>
            <p style={styles.subtitle}>
              {payslip.month} {payslip.year}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>💰</div>
            <div>
              <div style={styles.summaryLabel}>Gross Pay</div>
              <div style={styles.summaryValue}>{formatCurrency(summary.gross)}</div>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={{...styles.summaryIcon, background: '#fee'}}>📉</div>
            <div>
              <div style={styles.summaryLabel}>Total Deductions</div>
              <div style={styles.summaryValue}>{formatCurrency(summary.totalDeductions)}</div>
              <div style={styles.summaryPercentage}>{summary.deductionPercentage}% of gross</div>
            </div>
          </div>
          <div style={{...styles.summaryCard, background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'}}>
            <div style={{...styles.summaryIcon, background: '#4caf50'}}>💵</div>
            <div>
              <div style={styles.summaryLabel}>Net Pay (Take Home)</div>
              <div style={{...styles.summaryValue, color: '#2e7d32'}}>{formatCurrency(summary.net)}</div>
            </div>
          </div>
        </div>

        {/* Breakdown List */}
        <div style={styles.breakdownSection}>
          <h3 style={styles.sectionTitle}>Detailed Breakdown</h3>
          <p style={styles.sectionSubtitle}>Click any item for a plain-English explanation</p>
          
          <div style={styles.breakdownList}>
            {breakdownItems.map((item, index) => {
              const explanation = getExplanation(item.field);
              const isDeduction = item.type === 'deduction';
              const isResult = item.type === 'result';
              
              return (
                <div
                  key={index}
                  style={{
                    ...styles.breakdownItem,
                    ...(isResult ? styles.breakdownItemResult : {}),
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div style={styles.breakdownItemLeft}>
                    <span style={styles.breakdownIcon}>{explanation.icon}</span>
                    <div>
                      <div style={styles.breakdownLabel}>{explanation.title}</div>
                      <div style={styles.breakdownDesc}>{explanation.shortDesc}</div>
                    </div>
                  </div>
                  <div style={styles.breakdownItemRight}>
                    <span style={{
                      ...styles.breakdownAmount,
                      color: isDeduction ? '#d32f2f' : isResult ? '#2e7d32' : '#1976d2'
                    }}>
                      {isDeduction && '- '}
                      {formatCurrency(item.amount)}
                    </span>
                    <span style={styles.infoIcon}>ℹ️</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div style={styles.faqSection}>
          <button 
            onClick={() => setShowFAQ(!showFAQ)}
            style={styles.faqToggle}
          >
            <span>❓ Common Questions</span>
            <span style={{transform: showFAQ ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s'}}>
              ▼
            </span>
          </button>
          
          {showFAQ && (
            <div style={styles.faqList}>
              {commonQuestions.map((qa, index) => (
                <div key={index} style={styles.faqItem}>
                  <div style={styles.faqQuestion}>{qa.question}</div>
                  <div style={styles.faqAnswer}>{qa.answer}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {payslip.breakdown_notes && (
          <div style={styles.notesSection}>
            <h4 style={styles.notesTitle}>📝 Additional Notes</h4>
            <p style={styles.notesText}>{payslip.breakdown_notes}</p>
          </div>
        )}

        {/* Info Modal */}
        {selectedItem && (
          <InfoModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  container: {
    background: '#ffffff',
    borderRadius: '16px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '30px',
    borderBottom: '2px solid #f0f0f0',
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    color: '#ffffff',
    borderRadius: '16px 16px 0 0'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#a8b5a1',
    margin: 0
  },
  closeButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    fontSize: '32px',
    color: '#ffffff',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    padding: '30px'
  },
  summaryCard: {
    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #e5e7eb'
  },
  summaryIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    background: '#e3f2fd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#6B7C5D',
    marginBottom: '4px',
    fontWeight: '500'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2C3E2E'
  },
  summaryPercentage: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '2px'
  },
  breakdownSection: {
    padding: '0 30px 30px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '4px'
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#6B7C5D',
    marginBottom: '20px'
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s'
  },
  breakdownItemResult: {
    background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%)',
    border: '2px solid #4caf50',
    fontWeight: '600'
  },
  breakdownItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  breakdownIcon: {
    fontSize: '24px'
  },
  breakdownLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '2px'
  },
  breakdownDesc: {
    fontSize: '13px',
    color: '#6B7C5D'
  },
  breakdownItemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  breakdownAmount: {
    fontSize: '18px',
    fontWeight: '700'
  },
  infoIcon: {
    fontSize: '18px',
    opacity: 0.5
  },
  faqSection: {
    padding: '0 30px 30px'
  },
  faqToggle: {
    width: '100%',
    padding: '16px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#2C3E2E',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s'
  },
  faqList: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  faqItem: {
    padding: '16px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  },
  faqQuestion: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '8px'
  },
  faqAnswer: {
    fontSize: '13px',
    color: '#4b5563',
    lineHeight: '1.6'
  },
  notesSection: {
    margin: '0 30px 30px',
    padding: '20px',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '10px'
  },
  notesTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#856404',
    marginBottom: '8px'
  },
  notesText: {
    fontSize: '14px',
    color: '#856404',
    lineHeight: '1.6',
    margin: 0
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modalContent: {
    background: '#ffffff',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    borderBottom: '2px solid #f0f0f0',
    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
  },
  modalIcon: {
    fontSize: '32px'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2C3E2E',
    flex: 1,
    margin: 0
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    color: '#6B7C5D',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: '24px'
  },
  amountDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  amountLabel: {
    fontSize: '14px',
    color: '#6B7C5D',
    fontWeight: '500'
  },
  amountValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2C3E2E'
  },
  modalShortDesc: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '12px'
  },
  modalFullDesc: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.8',
    marginBottom: '16px'
  },
  learnMoreLink: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s'
  }
};
