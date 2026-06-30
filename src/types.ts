export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Citizen' | 'Moderator' | 'Admin';
  avatar: string;
  reputationScore: number;
  reportsSubmitted: number;
  verificationsCompleted: number;
  earnedBadges: string[];
  communityRank: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  publicSafetyRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'AI Analyzed' | 'Community Verified' | 'Assigned' | 'In Progress' | 'Resolved';
  lat: number;
  lng: number;
  address: string;
  image: string; // Base64 or placeholder URL
  trustScore: number; // 0-100
  confidenceScore: number; // 0-100
  affectedPopulation: number;
  impactEstimate: string;
  createdAt: string;
  userId: string;
  userName: string;
  userAvatar: string;
  upvotes: number;
  downvotes: number;
  duplicateOf: string | null;
  duplicateAnalysis: {
    probability: number;
    similarityScore: number;
    reason: string;
    duplicateId: string | null;
  } | null;
  advisor: {
    department: string;
    priority: string;
    timeline: string;
    escalationNeed: boolean;
    actions: string[];
  } | null;
  timeline: {
    status: 'Reported' | 'AI Analyzed' | 'Community Verified' | 'Assigned' | 'In Progress' | 'Resolved';
    timestamp: string;
    updatedBy: string;
    note?: string;
  }[];
  resolutionFeedback?: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    status: 'Fully Resolved' | 'Partially Resolved' | 'Not Resolved';
    comment: string;
    evidenceImage: string | null;
    createdAt: string;
  }[];
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: 'Citizen' | 'Moderator' | 'Admin';
  content: string;
  timestamp: string;
  evidenceImage: string | null;
}

export interface Verification {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  type: 'upvote' | 'downvote' | 'evidence';
  comment: string;
  evidenceImage: string | null;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_change' | 'verified' | 'comment' | 'badge';
  issueId?: string;
  read: boolean;
  timestamp: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string; // lucide icon name
  requirement: string;
}

export interface RiskPrediction {
  id: string;
  neighborhood: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'; // Matches Green, Yellow, Orange, Red
  score: number; // 0-100
  activeIssuesCount: number;
  resolutionRate: number; // e.g. 84%
  mainRiskCategory: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
}

export interface CommunityStats {
  healthScore: number;
  healthLevel: 'Excellent' | 'Good' | 'Moderate' | 'Critical';
  openIssuesCount: number;
  verifiedIssuesCount: number;
  resolvedIssuesCount: number;
  activeCitizensCount: number;
  totalImpactScore: number;
}
