import React, { useState, useEffect } from 'react';
import { Guardian, GuardianFormData } from '../../types/guardian';
import { guardianService } from '../../services/guardianService';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { GuardianModal } from './GuardianModal';
import { Plus, Phone, Mail, MapPin, Briefcase, Trash2, Edit3, ShieldAlert } from 'lucide-react';

interface GuardianListProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const GuardianList: React.FC<GuardianListProps> = ({ showToast }) => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);

  const fetchGuardians = async () => {
    try {
      setLoading(true);
      const data = await guardianService.getAll();
      setGuardians(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch guardians', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuardians();
  }, []);

  const handleSave = async (data: GuardianFormData) => {
    try {
      if (selectedGuardian) {
        await guardianService.update(selectedGuardian.id, data);
        showToast('Guardian updated successfully');
      } else {
        await guardianService.create(data);
        showToast('Guardian created successfully');
      }
      setSelectedGuardian(null);
      await fetchGuardians();
    } catch (err: any) {
      showToast(err.message || 'Failed to save guardian', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this guardian record?')) return;
    try {
      await guardianService.delete(id);
      showToast('Guardian deleted successfully');
      setGuardians((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete guardian', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card
        title="Global Guardian Directory (Day 03)"
        subtitle="Manage all parents and guardians across the institution"
        headerAction={
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setSelectedGuardian(null);
              setIsModalOpen(true);
            }}
          >
            Add Guardian
          </Button>
        }
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading guardian records...
          </div>
        ) : guardians.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <ShieldAlert size={40} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-700)' }}>No Guardians Found</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Add a guardian using the button above.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {guardians.map((g) => (
              <div
                key={g.id}
                style={{
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                        {g.fullName}
                      </h4>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                        {g.relation}
                      </span>
                    </div>
                    {g.isEmergencyContact && (
                      <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                        Emergency
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} color="var(--slate-400)" /> {g.phone}
                    </div>
                    {g.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={14} color="var(--slate-400)" /> {g.email}
                      </div>
                    )}
                    {g.occupation && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Briefcase size={14} color="var(--slate-400)" /> {g.occupation}
                      </div>
                    )}
                    {g.studentName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-700)', fontWeight: 500 }}>
                        Student: {g.studentName}
                      </div>
                    )}
                    {g.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} color="var(--slate-400)" /> {g.address}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Edit3 size={14} />}
                    onClick={() => {
                      setSelectedGuardian(g);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(g.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <GuardianModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGuardian(null);
        }}
        initialData={selectedGuardian}
        onSubmit={handleSave}
      />
    </div>
  );
};
