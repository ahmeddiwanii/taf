// TypeScript Types for Task Management System
// Import from @prisma/client for full type definitions

import type {
  user as PrismaUser,
  team as PrismaTeam,
  organization as PrismaOrganization,
  event as PrismaEvent,
  project as PrismaProject,
  teamMember,
  resource,
  organizationPost,
} from "@prisma/client";
// ============================================================================
// TEAM TASK TYPES
// ============================================================================

export interface TeamTask {
  id: string;
  teamId: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdById: string;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  team?: PrismaTeam;
  createdBy?: PrismaUser;
  assignments?: TeamTaskAssignment[];
}

// ============================================================================
// TASK ASSIGNMENT TYPES
// ============================================================================

export interface TeamTaskAssignment {
  id: string;
  taskId: string;
  teamMemberId: string;
  userId: string;

  // Status tracking
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt?: Date | null;

  // Review & approval
  approvedBy?: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalComment?: string | null;
  approvedAt?: Date | null;

  // Credits
  creditsAwarded: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relations
  task?: TeamTask;
  user?: PrismaUser;
  approver?: PrismaUser | null;
}

// ============================================================================
// MEMBER CREDIT TYPES
// ============================================================================

export interface MemberCredit {
  id: string;
  userId: string;
  organizationId: string;

  // Credits tracking
  totalCredits: number;
  creditsJson?: string | null; // JSON stringified array

  // Performance metrics
  tasksCompleted: number;
  tasksApproved: number;
  tasksRejected: number;
  approvalRate: number; // 0-100

  // Future features
  achievementBadges?: string | null; // JSON stringified array

  // Timestamp
  updatedAt: Date;

  // Relations
  user?: PrismaUser;
  organization?: PrismaOrganization;
}

export interface CreditTransaction {
  amount: number;
  reason: string; // e.g., "Task 'Presentation' approved"
  timestamp: string; // ISO string
}

// ============================================================================
// TEAM MODEL CHANGES
// ============================================================================

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  purpose?: string | null;
  description?: string | null;
  status: string; // 'active' | 'inactive'
  visibility: string; // 'ORG' | 'PRIVATE'
  leadIdsJson?: any;

  // NEW: Link to event or project
  eventId?: string | null;
  projectId?: string | null;

  // Timestamps
  createdById: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  organization?: PrismaOrganization;
  createdBy?: PrismaUser;
  event?: PrismaEvent | null;
  project?: PrismaProject | null;
  members?: teamMember[];
  tasks?: TeamTask[]; // NEW
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Create Task Request
export interface CreateTaskRequest {
  teamId: string;
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string; // ISO datetime
}

// Create Task Response
export interface CreateTaskResponse {
  success: boolean;
  task: TeamTask & {
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
  };
  assignments: Array<{
    id: string;
    userId: string;
    status: string;
  }>;
}

export interface GetTasksResponse {
  tasks: Array<
    TeamTask & {
      createdBy: {
        id: string;
        name: string;
        email: string;
      };
      assignments: Array<
        TeamTaskAssignment & {
          user: {
            id: string;
            name: string;
            email: string;
          };
          approver: {
            id: string;
            name: string;
          } | null;
        }
      >;
    }
  >;
}

// Update Assignment Request (Submit/Approve/Reject)
export interface UpdateAssignmentRequest {
  action: 'submit' | 'approve' | 'reject' | 'review';
  comment?: string;
}

// Update Assignment Response
export interface UpdateAssignmentResponse {
  success: boolean;
  assignment: TeamTaskAssignment & {
    user: {
      id: string;
      name: string;
      email: string;
    };
    task: {
      title: string;
    };
    approver?: {
      id: string;
      name: string;
    } | null;
  };
}

// Get Member Tasks Response
export interface GetMemberTasksResponse {
  assignments: Array<
    TeamTaskAssignment & {
      task: TeamTask & {
        team: {
          id: string;
          name: string;
          eventId?: string;
          projectId?: string;
        };
        createdBy: {
          name: string;
        };
      };
      user: {
        id: string;
        name: string;
        email: string;
      };
      approver: {
        id: string;
        name: string;
      } | null;
    }
  >;
}

// Get Member Credits Response
export interface GetMemberCreditsResponse {
  credits: Array<
    MemberCredit & {
      user: {
        id: string;
        name: string;
        email: string;
      };
    }
  >;
}

// Get Teams Response
export interface GetTeamsResponse {
  teams: Array<
    Team & {
      event?: {
        id: string;
        title: string;
      } | null;
      project?: {
        id: string;
        title: string;
      } | null;
      members: teamMember[];
      createdBy: {
        id: string;
        name: string;
      };
    }
  >;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export interface TaskCardProps {
  assignment: TeamTaskAssignment & {
    task: TeamTask & {
      team: { name: string };
      createdBy: { name: string };
    };
  };
  onSubmit: (assignmentId: string) => void;
  isSubmitting: boolean;
}

export interface MemberCreditCardProps {
  member: MemberCredit & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  rank?: number; // For top performers
}

export interface TaskReviewDialogProps {
  assignment: TeamTaskAssignment;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  isLoading: boolean;
}

// ============================================================================
// PAGE COMPONENT PROPS
// ============================================================================

export interface MemberHomePageData {
  assignments: TeamTaskAssignment[];
  posts: organizationPost[];
  upcomingEvents: PrismaEvent[];
}

export interface HRTaskReviewPageData {
  tasks: TeamTaskAssignment[];
  stats: {
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
}

export interface HRMemberCreditsPageData {
  members: MemberCredit[];
  topPerformers: MemberCredit[];
  stats: {
    totalMembers: number;
    totalCreditsAwarded: number;
    averageApprovalRate: number;
  };
}

export interface HRCreateTaskPageData {
  teams: PrismaTeam[];
  selectedTeam?: PrismaTeam | null;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type TaskStatusColor =
  | 'bg-amber-50'
  | 'bg-blue-50'
  | 'bg-green-50'
  | 'bg-red-50';

export type PriorityBadgeColor =
  | 'bg-red-100 text-red-800'
  | 'bg-orange-100 text-orange-800'
  | 'bg-yellow-100 text-yellow-800'
  | 'bg-green-100 text-green-800';

export type ApprovalRateBadge = 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';

// ============================================================================
// FORM STATE TYPES
// ============================================================================

export interface CreateTaskFormData {
  teamId: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
}

export interface ReviewTaskFormData {
  assignmentId: string;
  action: 'approve' | 'reject';
  comment: string;
}

// ============================================================================
// DATABASE ENUMS (from schema)
// ============================================================================

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ============================================================================
// HELPER FUNCTION TYPES
// ============================================================================

export type GetPriorityColorFn = (priority: TaskPriority) => PriorityBadgeColor;
export type GetStatusColorFn = (status: AssignmentStatus) => TaskStatusColor;
export type GetApprovalRateBadgeFn = (rate: number) => ApprovalRateBadge;
export type FormatCreditTransactionFn = (transaction: CreditTransaction) => string;
