import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import type { Student } from '../types/student';
import { ArrowLeft, Mail, Phone, MapPin, Building2, BookOpen, Clock, Loader2, MoreVertical, Edit, Trash, ShieldAlert, HeartHandshake, UserSquare2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import type { GuardianResponseDto } from '../types/guardian';
import { CreateGuardianDialog } from '../components/CreateGuardianDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: student, isLoading, isError } = useQuery<Student>({
    queryKey: ['student', id],
    queryFn: async () => {
      const res = await apiClient.get(`/students/${id}`);
      return res.data?.data;
    }
  });

  const { data: guardiansResponse } = useQuery({
    queryKey: ['student-guardians', id],
    queryFn: async () => {
      const res = await apiClient.get(`/students/${id}/guardians`);
      return res.data;
    },
    enabled: !!id
  });

  const guardians: GuardianResponseDto[] = guardiansResponse?.data || [];

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiClient.patch(`/students/${id}/status`, { status: newStatus, remarks: 'Updated via portal' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student status updated!');
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
      navigate('/dashboard/students');
    },
    onError: () => {
      toast.error('Failed to delete student');
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        Failed to load student profile.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-4 text-slate-500 hover:text-slate-900"
        onClick={() => navigate('/dashboard/students')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
      </Button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-3xl uppercase">
            {student.firstName.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{student.firstName} {student.lastName}</h1>
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <span className="flex items-center"><Building2 className="w-4 h-4 mr-1" /> {student.department || 'N/A'}</span>
              <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1" /> Roll: {student.rollNumber}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                student.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 
                'bg-slate-100 text-slate-700'
              }`}>
                {student.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200" onClick={() => toast.info('Edit modal coming soon!')}>
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-slate-200">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => statusMutation.mutate('ACTIVE')}>Mark Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => statusMutation.mutate('SUSPENDED')}>Suspend Student</DropdownMenuItem>
              <DropdownMenuItem onClick={() => statusMutation.mutate('GRADUATED')}>Mark Graduated</DropdownMenuItem>
              <DropdownMenuItem onClick={() => statusMutation.mutate('DROPOUT')}>Mark Dropout</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                if(window.confirm('Are you sure you want to delete this student?')) {
                  deleteMutation.mutate();
                }
              }}>
                <Trash className="w-4 h-4 mr-2" /> Delete Student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 col-span-1">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Contact Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Email Address</p>
                <p className="text-sm font-medium">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Phone Number</p>
                <p className="text-sm font-medium">{student.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Location</p>
                <p className="text-sm font-medium">
                  {student.city ? `${student.city}, ${student.state}` : 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Academic Record</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Enrollment Date</p>
              <p className="font-medium text-slate-900">{student.enrollmentDate || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Current Batch</p>
              <p className="font-medium text-slate-900">{student.batch || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Date of Birth</p>
              <p className="font-medium text-slate-900">{student.dateOfBirth || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Gender</p>
              <p className="font-medium text-slate-900 capitalize">{student.gender?.toLowerCase() || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guardians Section */}
      <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <HeartHandshake className="w-5 h-5 mr-2 text-primary" />
            Guardians & Contacts
          </h2>
          <CreateGuardianDialog studentId={Number(id)} />
        </div>
        
        {guardians.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            No guardians or emergency contacts linked to this student yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guardians.map(guardian => (
              <div key={guardian.id} className="p-5 rounded-2xl border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow bg-slate-50/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                      {guardian.firstName.charAt(0)}{guardian.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{guardian.fullName}</h3>
                      <span className="text-xs font-semibold text-slate-500 uppercase">{guardian.relation}</span>
                    </div>
                  </div>
                  {guardian.isEmergencyContact && (
                    <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold flex items-center">
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      Emergency
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 mt-2 pt-4 border-t border-slate-100 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-slate-400" />
                    {guardian.phone}
                  </div>
                  {guardian.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-slate-400" />
                      {guardian.email}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
