import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './NewCase.css';

function NewCase() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    debtor_name: '',
    property_address: '',
    debt_amount: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.debtor_name.trim()) {
      newErrors.debtor_name = 'Debtor name is required';
    }

    if (!formData.property_address.trim()) {
      newErrors.property_address = 'Property address is required';
    }

    if (!formData.debt_amount) {
      newErrors.debt_amount = 'Debt amount is required';
    } else if (isNaN(formData.debt_amount) || parseFloat(formData.debt_amount) <= 0) {
      newErrors.debt_amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          debtor_name: formData.debtor_name.trim(),
          property_address: formData.property_address.trim(),
          debt_amount: parseFloat(formData.debt_amount)
        })
      });

      if (response.ok) {
        const newCase = await response.json();
        navigate(`/case/${newCase.id}`);
      } else {
        alert('Error creating case. Please try again.');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating case:', error);
      alert('Error creating case. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="new-case">
      <div className="new-case-header">
        <Link to="/" className="back-link">← Back to Dashboard</Link>
        <h1>Create New Case</h1>
        <p className="subtitle">Enter the details of the debt to begin the recovery process</p>
      </div>

      <div className="form-container">
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="debtor_name" className="form-label">
                Debtor Name *
              </label>
              <input
                type="text"
                id="debtor_name"
                name="debtor_name"
                className={`form-input ${errors.debtor_name ? 'error' : ''}`}
                value={formData.debtor_name}
                onChange={handleChange}
                placeholder="e.g., John Smith"
              />
              {errors.debtor_name && (
                <div className="error-message">{errors.debtor_name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="property_address" className="form-label">
                Property Address *
              </label>
              <textarea
                id="property_address"
                name="property_address"
                className={`form-input ${errors.property_address ? 'error' : ''}`}
                value={formData.property_address}
                onChange={handleChange}
                rows="3"
                placeholder="e.g., Flat 5, Example Building, 123 High Street, London, SW1A 1AA"
              />
              {errors.property_address && (
                <div className="error-message">{errors.property_address}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="debt_amount" className="form-label">
                Debt Amount (£) *
              </label>
              <input
                type="number"
                id="debt_amount"
                name="debt_amount"
                className={`form-input ${errors.debt_amount ? 'error' : ''}`}
                value={formData.debt_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="e.g., 2500.00"
              />
              {errors.debt_amount && (
                <div className="error-message">{errors.debt_amount}</div>
              )}
              <div className="help-text">
                Enter the total outstanding service charge amount
              </div>
            </div>

            <div className="form-actions">
              <Link to="/" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </form>
        </div>

        <div className="card info-card">
          <h3>What happens next?</h3>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-title">Case Created</div>
                <div className="step-description">
                  Your case will be assigned a unique reference number
                </div>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-title">Generate LBA1</div>
                <div className="step-description">
                  Generate and send the first Letter Before Action
                </div>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-title">Track Progress</div>
                <div className="step-description">
                  Monitor the case through each stage of recovery
                </div>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <div className="step-title">Automated Workflow</div>
                <div className="step-description">
                  The system will guide you through LBAs, HMLR requests, mortgagee contact, and CCJ filing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewCase;
