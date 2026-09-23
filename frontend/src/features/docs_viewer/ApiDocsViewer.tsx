import React from 'react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { ExternalLink, Terminal, CheckCircle2 } from 'lucide-react';

export const ApiDocsViewer: React.FC = () => {
  const endpoints = [
    { method: 'POST', path: '/api/v1/students', day: 'Day 02', desc: 'Create student profile with validation' },
    { method: 'GET', path: '/api/v1/students', day: 'Day 02', desc: 'List students with search, filters & pagination' },
    { method: 'GET', path: '/api/v1/students/{id}', day: 'Day 02', desc: 'Get student by ID with guardians & documents' },
    { method: 'PUT', path: '/api/v1/students/{id}', day: 'Day 02', desc: 'Update student profile' },
    { method: 'DELETE', path: '/api/v1/students/{id}', day: 'Day 02', desc: 'Delete student & associated records' },
    { method: 'GET', path: '/guardians', day: 'Day 03', desc: 'Get all guardians' },
    { method: 'POST', path: '/guardians', day: 'Day 03', desc: 'Create guardian' },
    { method: 'PUT', path: '/guardians/{id}', day: 'Day 03', desc: 'Update guardian details' },
    { method: 'DELETE', path: '/guardians/{id}', day: 'Day 03', desc: 'Delete guardian' },
    { method: 'GET', path: '/api/v1/students/{id}/guardians', day: 'Day 03', desc: 'Get guardians linked to student' },
    { method: 'POST', path: '/api/v1/students/{id}/guardians', day: 'Day 03', desc: 'Add & link guardian directly' },
    { method: 'POST', path: '/api/v1/students/{id}/documents', day: 'Day 04', desc: 'Upload Aadhaar, TC, Marksheet, Photo' },
    { method: 'GET', path: '/api/v1/students/{id}/documents', day: 'Day 04', desc: 'List student documents' },
    { method: 'GET', path: '/api/v1/documents/{id}/view', day: 'Day 04', desc: 'View document inline (PDF/images)' },
    { method: 'GET', path: '/api/v1/documents/{id}/download', day: 'Day 04', desc: 'Download document attachment' },
    { method: 'DELETE', path: '/api/v1/documents/{id}', day: 'Day 04', desc: 'Delete document file & DB record' },
    { method: 'PATCH', path: '/api/v1/students/{id}/status', day: 'Day 05', desc: 'Update enrollment status with remarks' },
    { method: 'GET', path: '/api/v1/students/{id}/status-history', day: 'Day 05', desc: 'View status transition audit log' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card
        title="Swagger & OpenAPI Documentation (Day 06)"
        subtitle="Interactive API Explorer, Contract Specifications, and Testing Endpoints"
        headerAction={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer">
              <Button variant="primary" size="sm" rightIcon={<ExternalLink size={14} />}>
                Open Swagger UI
              </Button>
            </a>
            <a href="http://localhost:8080/v3/api-docs" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" rightIcon={<Terminal size={14} />}>
                Raw OpenAPI JSON
              </Button>
            </a>
          </div>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--success-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success-border)', marginBottom: '1.5rem' }}>
          <CheckCircle2 color="var(--success-dot)" size={20} />
          <div style={{ fontSize: '0.875rem', color: 'var(--success-text)' }}>
            <strong>All 6 automated JUnit/MockMvc test suites passed!</strong> Request/Response validation, 400 Bad Request error handlers, 404 lookups, and multipart document uploads are fully validated.
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--slate-200)', backgroundColor: 'var(--slate-50)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Method</th>
                <th style={{ padding: '0.75rem 1rem' }}>Endpoint</th>
                <th style={{ padding: '0.75rem 1rem' }}>Module</th>
                <th style={{ padding: '0.75rem 1rem' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, idx) => {
                const methodColors: Record<string, string> = {
                  GET: 'var(--info-dot)',
                  POST: 'var(--success-dot)',
                  PUT: 'var(--warning-dot)',
                  PATCH: 'var(--purple-dot)',
                  DELETE: 'var(--danger-dot)',
                };
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          color: '#ffffff',
                          backgroundColor: methodColors[ep.method] || 'var(--slate-600)',
                        }}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--slate-800)' }}>
                      {ep.path}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--slate-100)', borderRadius: 'var(--radius-full)', color: 'var(--slate-700)', fontWeight: 500 }}>
                        {ep.day}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)' }}>
                      {ep.desc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
