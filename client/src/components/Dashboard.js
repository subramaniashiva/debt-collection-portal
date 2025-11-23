import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, casesRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/cases')
      ]);

      const statsData = await statsRes.json();
      const casesData = await casesRes.json();

      setStats(statsData);
      setCases(casesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
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

  const filteredCases = filter === 'ALL'
    ? cases
    : cases.filter(c => c.current_stage === filter);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/new-case" className="btn btn-primary">+ New Case</Link>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalCases}</div>
            <div className="stat-label">Total Cases</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.activeCases}</div>
            <div className="stat-label">Active Cases</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedCases}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">£{stats.totalDebtValue.toLocaleString()}</div>
            <div className="stat-label">Total Debt Value</div>
          </div>
        </div>
      )}

      {stats && stats.stageBreakdown && (
        <div className="card pipeline-card">
          <h2>Case Pipeline</h2>
          <div className="pipeline">
            <div className="pipeline-stage">
              <div className="pipeline-count">{stats.stageBreakdown.new}</div>
              <div className="pipeline-label">New</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-stage">
              <div className="pipeline-count">{stats.stageBreakdown.lba1}</div>
              <div className="pipeline-label">LBA1</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-stage">
              <div className="pipeline-count">{stats.stageBreakdown.lba2}</div>
              <div className="pipeline-label">LBA2</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-stage">
              <div className="pipeline-count">{stats.stageBreakdown.hmlr}</div>
              <div className="pipeline-label">HMLR</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-stage">
              <div className="pipeline-count">{stats.stageBreakdown.mortgagee}</div>
              <div className="pipeline-label">Mortgagee</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-stage">
              <div className="pipeline-count">{stats.stageBreakdown.ccj}</div>
              <div className="pipeline-label">CCJ</div>
            </div>
          </div>
        </div>
      )}

      <div className="card cases-card">
        <div className="cases-header">
          <h2>All Cases</h2>
          <div className="filter-buttons">
            <button
              className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('ALL')}
            >
              All
            </button>
            <button
              className={`btn btn-sm ${filter === 'NEW' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('NEW')}
            >
              New
            </button>
            <button
              className={`btn btn-sm ${filter === 'LBA1_SENT' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('LBA1_SENT')}
            >
              LBA1
            </button>
            <button
              className={`btn btn-sm ${filter === 'MORTGAGEE_CONTACTED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('MORTGAGEE_CONTACTED')}
            >
              Mortgagee
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="cases-table">
            <thead>
              <tr>
                <th>Case Ref</th>
                <th>Debtor</th>
                <th>Property</th>
                <th>Debt Amount</th>
                <th>Stage</th>
                <th>Next Action</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No cases found. <Link to="/new-case">Create your first case</Link>
                  </td>
                </tr>
              ) : (
                filteredCases.map(caseItem => (
                  <tr key={caseItem.id}>
                    <td className="case-ref">{caseItem.case_reference}</td>
                    <td>{caseItem.debtor_name}</td>
                    <td className="property-address">{caseItem.property_address}</td>
                    <td className="amount">£{parseFloat(caseItem.debt_amount).toLocaleString()}</td>
                    <td>
                      <span className={getStageBadgeClass(caseItem.current_stage)}>
                        {getStageLabel(caseItem.current_stage)}
                      </span>
                    </td>
                    <td className="next-action">
                      {caseItem.nextAction}
                      {caseItem.daysUntilDeadline !== null && caseItem.daysUntilDeadline < 7 && caseItem.daysUntilDeadline > 0 && (
                        <span className="deadline-warning"> ⚠️</span>
                      )}
                    </td>
                    <td>{format(new Date(caseItem.created_at), 'dd/MM/yyyy')}</td>
                    <td>
                      <Link to={`/case/${caseItem.id}`} className="btn btn-sm btn-primary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
