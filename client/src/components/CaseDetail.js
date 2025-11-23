import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import './CaseDetail.css';

function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMortgageeForm, setShowMortgageeForm] = useState(false);
  const [mortgageeName, setMortgageeName] = useState('');
  const [mortgageeAddress, setMortgageeAddress] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState(null);

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadCase = async () => {
    try {
      const response = await fetch(`/api/cases/${id}`);
      const data = await response.json();
      setCaseData(data);
      setMortgageeName(data.mortgagee_name || '');
      setMortgageeAddress(data.mortgagee_address || '');
      setLoading(false);
    } catch (error) {
      console.error('Error loading case:', error);
      setLoading(false);
    }
  };

  const handleAction = async (action, additionalData = {}) => {
    try {
      const response = await fetch(`/api/cases/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: additionalData })
      });

      if (response.ok) {
        await loadCase();
        setShowMortgageeForm(false);
        setGeneratedDocument(null);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const generateDocument = async (documentType) => {
    try {
      const response = await fetch(`/api/cases/${id}/documents/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType })
      });

      const data = await response.json();
      setGeneratedDocument(data);
    } catch (error) {
      console.error('Error generating document:', error);
    }
  };

  const getStageLabel = (stage) => {
    const labels = {
      'NEW': 'New',
      'LBA1_SENT': 'LBA1 Sent',
      'LBA2_SENT': 'LBA2 Sent',
      'HMLR_REQUESTED': 'HMLR Requested',
      'MORTGAGEE_CONTACTED': 'Mortgagee Contacted',
      'CCJ_FILED': 'CCJ Filed',
      'COMPLETED': 'Completed'
    };
    return labels[stage] || stage;
  };

  const getStageBadgeClass = (stage) => {
    const classes = {
      'NEW': 'badge-new',
      'LBA1_SENT': 'badge-lba1',
      'LBA2_SENT': 'badge-lba2',
      'HMLR_REQUESTED': 'badge-hmlr',
      'MORTGAGEE_CONTACTED': 'badge-mortgagee',
      'CCJ_FILED': 'badge-ccj',
      'COMPLETED': 'badge-completed'
    };
    return `badge ${classes[stage] || ''}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Document copied to clipboard!');
  };

  const downloadDocument = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!caseData) {
    return <div className="error">Case not found</div>;
  }

  return (
    <div className="case-detail">
      <div className="case-header">
        <div>
          <Link to="/" className="back-link">← Back to Dashboard</Link>
          <h1>Case {caseData.case_reference}</h1>
          <span className={getStageBadgeClass(caseData.current_stage)}>
            {getStageLabel(caseData.current_stage)}
          </span>
        </div>
      </div>

      <div className="case-grid">
        <div className="case-main">
          <div className="card">
            <h2>Case Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Debtor Name</div>
                <div className="info-value">{caseData.debtor_name}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Property Address</div>
                <div className="info-value">{caseData.property_address}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Original Debt</div>
                <div className="info-value">£{parseFloat(caseData.debt_amount).toFixed(2)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Total Costs</div>
                <div className="info-value">£{parseFloat(caseData.total_costs || 0).toFixed(2)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Total Amount Due</div>
                <div className="info-value total-amount">
                  £{(parseFloat(caseData.debt_amount) + parseFloat(caseData.total_costs || 0)).toFixed(2)}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Created</div>
                <div className="info-value">{format(new Date(caseData.created_at), 'dd MMMM yyyy')}</div>
              </div>
            </div>

            {caseData.mortgagee_name && (
              <div className="mortgagee-info">
                <h3>Mortgagee Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Mortgagee</div>
                    <div className="info-value">{caseData.mortgagee_name}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Address</div>
                    <div className="info-value">{caseData.mortgagee_address}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Available Actions</h2>
            <div className="actions-grid">
              {caseData.current_stage === 'NEW' && (
                <>
                  <button
                    className="action-button"
                    onClick={() => generateDocument('LBA1')}
                  >
                    <span className="action-icon">📄</span>
                    <span className="action-text">Generate LBA1</span>
                  </button>
                  <button
                    className="action-button"
                    onClick={() => handleAction('SEND_LBA1')}
                  >
                    <span className="action-icon">📮</span>
                    <span className="action-text">Mark LBA1 as Sent</span>
                  </button>
                </>
              )}

              {caseData.current_stage === 'LBA1_SENT' && (
                <>
                  <button
                    className="action-button"
                    onClick={() => generateDocument('LBA2')}
                  >
                    <span className="action-icon">📄</span>
                    <span className="action-text">Generate LBA2</span>
                  </button>
                  <button
                    className="action-button"
                    onClick={() => handleAction('SEND_LBA2')}
                  >
                    <span className="action-icon">📮</span>
                    <span className="action-text">Mark LBA2 as Sent</span>
                  </button>
                </>
              )}

              {caseData.current_stage === 'LBA2_SENT' && (
                <button
                  className="action-button"
                  onClick={() => handleAction('REQUEST_HMLR')}
                >
                  <span className="action-icon">🏛️</span>
                  <span className="action-text">Request HMLR Office Copy</span>
                </button>
              )}

              {caseData.current_stage === 'HMLR_REQUESTED' && (
                <>
                  <button
                    className="action-button"
                    onClick={() => setShowMortgageeForm(!showMortgageeForm)}
                  >
                    <span className="action-icon">🏦</span>
                    <span className="action-text">Add Mortgagee Details</span>
                  </button>
                  {caseData.mortgagee_name && (
                    <button
                      className="action-button"
                      onClick={() => generateDocument('MORTGAGEE_LETTER1')}
                    >
                      <span className="action-icon">📄</span>
                      <span className="action-text">Generate Mortgagee Letter</span>
                    </button>
                  )}
                </>
              )}

              {caseData.current_stage === 'MORTGAGEE_CONTACTED' && (
                <>
                  <button
                    className="action-button"
                    onClick={() => handleAction('FILE_CCJ')}
                  >
                    <span className="action-icon">⚖️</span>
                    <span className="action-text">File CCJ</span>
                  </button>
                  <button
                    className="action-button btn-success"
                    onClick={() => handleAction('MARK_PAID')}
                  >
                    <span className="action-icon">✅</span>
                    <span className="action-text">Mark as Paid</span>
                  </button>
                </>
              )}

              {caseData.current_stage === 'CCJ_FILED' && (
                <button
                  className="action-button btn-success"
                  onClick={() => handleAction('MARK_PAID')}
                >
                  <span className="action-icon">✅</span>
                  <span className="action-text">Mark as Paid</span>
                </button>
              )}
            </div>

            {showMortgageeForm && (
              <div className="mortgagee-form">
                <h3>Mortgagee Details</h3>
                <div className="form-group">
                  <label className="form-label">Mortgagee Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={mortgageeName}
                    onChange={(e) => setMortgageeName(e.target.value)}
                    placeholder="e.g., Nationwide Building Society"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mortgagee Address</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={mortgageeAddress}
                    onChange={(e) => setMortgageeAddress(e.target.value)}
                    placeholder="Full address"
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAction('UPDATE_MORTGAGEE', {
                    mortgagee_name: mortgageeName,
                    mortgagee_address: mortgageeAddress
                  })}
                  disabled={!mortgageeName || !mortgageeAddress}
                >
                  Save & Send Letter
                </button>
              </div>
            )}

            {generatedDocument && (
              <div className="generated-document">
                <div className="document-header">
                  <h3>{generatedDocument.documentType}</h3>
                  <div className="document-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => copyToClipboard(generatedDocument.content)}
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => downloadDocument(
                        generatedDocument.content,
                        `${caseData.case_reference}-${generatedDocument.documentType}.txt`
                      )}
                    >
                      Download
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setGeneratedDocument(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <pre className="document-content">{generatedDocument.content}</pre>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Activity Timeline</h2>
            {caseData.activities && caseData.activities.length > 0 ? (
              <div className="timeline">
                {caseData.activities.map(activity => (
                  <div key={activity.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-description">{activity.description}</div>
                      <div className="timeline-date">
                        {format(new Date(activity.created_at), 'dd MMM yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-timeline">No activity yet</div>
            )}
          </div>
        </div>

        <div className="case-sidebar">
          <div className="card">
            <h3>Case Progress</h3>
            <div className="progress-steps">
              <div className={`progress-step ${['NEW', 'LBA1_SENT', 'LBA2_SENT', 'HMLR_REQUESTED', 'MORTGAGEE_CONTACTED', 'CCJ_FILED', 'COMPLETED'].includes(caseData.current_stage) ? 'completed' : ''}`}>
                <div className="step-marker">1</div>
                <div className="step-label">New Case</div>
              </div>
              <div className={`progress-step ${['LBA1_SENT', 'LBA2_SENT', 'HMLR_REQUESTED', 'MORTGAGEE_CONTACTED', 'CCJ_FILED', 'COMPLETED'].includes(caseData.current_stage) ? 'completed' : ''}`}>
                <div className="step-marker">2</div>
                <div className="step-label">LBA1 Sent</div>
                {caseData.lba1_sent_date && (
                  <div className="step-date">{format(new Date(caseData.lba1_sent_date), 'dd/MM/yy')}</div>
                )}
              </div>
              <div className={`progress-step ${['LBA2_SENT', 'HMLR_REQUESTED', 'MORTGAGEE_CONTACTED', 'CCJ_FILED', 'COMPLETED'].includes(caseData.current_stage) ? 'completed' : ''}`}>
                <div className="step-marker">3</div>
                <div className="step-label">LBA2 Sent</div>
                {caseData.lba2_sent_date && (
                  <div className="step-date">{format(new Date(caseData.lba2_sent_date), 'dd/MM/yy')}</div>
                )}
              </div>
              <div className={`progress-step ${['HMLR_REQUESTED', 'MORTGAGEE_CONTACTED', 'CCJ_FILED', 'COMPLETED'].includes(caseData.current_stage) ? 'completed' : ''}`}>
                <div className="step-marker">4</div>
                <div className="step-label">HMLR Requested</div>
                {caseData.hmlr_requested_date && (
                  <div className="step-date">{format(new Date(caseData.hmlr_requested_date), 'dd/MM/yy')}</div>
                )}
              </div>
              <div className={`progress-step ${['MORTGAGEE_CONTACTED', 'CCJ_FILED', 'COMPLETED'].includes(caseData.current_stage) ? 'completed' : ''}`}>
                <div className="step-marker">5</div>
                <div className="step-label">Mortgagee Contacted</div>
                {caseData.mortgagee_letter1_sent_date && (
                  <div className="step-date">{format(new Date(caseData.mortgagee_letter1_sent_date), 'dd/MM/yy')}</div>
                )}
              </div>
              <div className={`progress-step ${['CCJ_FILED', 'COMPLETED'].includes(caseData.current_stage) ? 'completed' : ''}`}>
                <div className="step-marker">6</div>
                <div className="step-label">CCJ Filed</div>
                {caseData.ccj_filed_date && (
                  <div className="step-date">{format(new Date(caseData.ccj_filed_date), 'dd/MM/yy')}</div>
                )}
              </div>
              <div className={`progress-step ${caseData.current_stage === 'COMPLETED' ? 'completed' : ''}`}>
                <div className="step-marker">✓</div>
                <div className="step-label">Completed</div>
              </div>
            </div>
          </div>

          <div className="card cost-summary">
            <h3>Cost Summary</h3>
            <div className="cost-item">
              <span>Original Debt</span>
              <span>£{parseFloat(caseData.debt_amount).toFixed(2)}</span>
            </div>
            <div className="cost-item">
              <span>Legal Costs</span>
              <span>£{parseFloat(caseData.total_costs || 0).toFixed(2)}</span>
            </div>
            <div className="cost-item cost-total">
              <span>Total Recoverable</span>
              <span>£{(parseFloat(caseData.debt_amount) + parseFloat(caseData.total_costs || 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseDetail;
