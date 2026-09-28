import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/apiConfig';
import {
  LearningMaterial,
  DiscussionThread,
  Quiz,
  ClassroomBooking,
  FacultyWorkload,
} from '../types/lmsTypes';
import { APIResponse } from '../types/apiTypes';

const initialMaterials: LearningMaterial[] = [
  { id: 'mat-1', courseCode: 'CS301', courseName: 'Database Systems', title: 'Chapter 4: Relational Algebra & SQL Normalization', type: 'PDF', uploadedBy: 'Dr. Sunita Rao', uploadedAt: '2026-09-20', fileSize: '4.2 MB', url: '#', downloadsCount: 142 },
  { id: 'mat-2', courseCode: 'CS304', courseName: 'Distributed Systems', title: 'Video Lecture: Consensus Algorithms (Raft & Paxos)', type: 'Video', uploadedBy: 'Prof. Ankit Patel', uploadedAt: '2026-09-22', fileSize: '185 MB', url: '#', downloadsCount: 98 },
  { id: 'mat-3', courseCode: 'CS308', courseName: 'Computer Networks', title: 'Lecture Notes: TCP/IP Congestion Control Mechanisms', type: 'LectureNotes', uploadedBy: 'Dr. Priya Desai', uploadedAt: '2026-09-24', fileSize: '2.8 MB', url: '#', downloadsCount: 115 },
];

const initialDiscussions: DiscussionThread[] = [
  { id: 'disc-1', courseCode: 'CS301', title: 'Query Optimization in PostgreSQL vs Oracle Database', authorName: 'Aarav Sharma', authorRole: 'Student', createdAt: '2026-09-25 14:20', repliesCount: 6, lastActivityAt: '2026-09-26 10:15', content: 'What are the main performance trade-offs between B-Tree indexes and Hash indexes for high-concurrency joins?' },
  { id: 'disc-2', courseCode: 'CS304', title: 'Clarification on Lab Assignment 3: Distributed Mutex', authorName: 'Prof. Ankit Patel', authorRole: 'Faculty', createdAt: '2026-09-26 09:00', repliesCount: 12, lastActivityAt: '2026-09-27 16:45', content: 'Please submit your Ricart-Agrawala algorithm implementations before Friday 11:59 PM.' },
];

class LMSService {
  public async getLearningMaterials(courseCode?: string): Promise<APIResponse<LearningMaterial[]>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const filtered = courseCode ? initialMaterials.filter((m) => m.courseCode === courseCode) : initialMaterials;
      return {
        success: true,
        data: filtered,
        message: 'Learning materials retrieved',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<LearningMaterial[]>('/lms/materials', { courseCode });
  }

  public async getDiscussionThreads(courseCode?: string): Promise<APIResponse<DiscussionThread[]>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const filtered = courseCode ? initialDiscussions.filter((d) => d.courseCode === courseCode) : initialDiscussions;
      return {
        success: true,
        data: filtered,
        message: 'Discussion threads retrieved',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<DiscussionThread[]>('/lms/discussions', { courseCode });
  }

  public async uploadLearningMaterial(material: Omit<LearningMaterial, 'id' | 'uploadedAt' | 'downloadsCount'>): Promise<APIResponse<LearningMaterial>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      const newMaterial: LearningMaterial = {
        ...material,
        id: `mat-${Date.now()}`,
        uploadedAt: new Date().toISOString().slice(0, 10),
        downloadsCount: 0,
      };
      initialMaterials.unshift(newMaterial);
      return {
        success: true,
        data: newMaterial,
        message: 'Learning material uploaded to course portal',
        code: 201,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.post<LearningMaterial>('/lms/materials', material);
  }
}

export const lmsService = new LMSService();
