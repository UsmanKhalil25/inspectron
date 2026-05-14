/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
};

export type ActionContext = {
  __typename?: "ActionContext";
  title: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type ActionDetail = {
  __typename?: "ActionDetail";
  display: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  params: Scalars["String"]["output"];
};

export type BrowserPreviewFrame = {
  __typename?: "BrowserPreviewFrame";
  frame: Scalars["String"]["output"];
  frameNumber: Scalars["Int"]["output"];
  latencyMs: Scalars["Int"]["output"];
  runId: Scalars["ID"]["output"];
  timestamp: Scalars["Float"]["output"];
  url?: Maybe<Scalars["String"]["output"]>;
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  url: Scalars["String"]["input"];
};

export type CreateScanInput = {
  projectId: Scalars["String"]["input"];
  scanType?: InputMaybe<ScanType>;
  status?: InputMaybe<ScanStatus>;
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type LoginResponse = {
  __typename?: "LoginResponse";
  message: Scalars["String"]["output"];
  user: PublicUser;
};

export type LoginUserInput = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

export type Mutation = {
  __typename?: "Mutation";
  createProject: Project;
  createScan: Scan;
  deleteProject: Scalars["Boolean"]["output"];
  login: LoginResponse;
  register: RegisterResponse;
  sendAgentMessage: Scalars["Boolean"]["output"];
  startScan: Scan;
  updateProject: Project;
};

export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};

export type MutationCreateScanArgs = {
  input: CreateScanInput;
};

export type MutationDeleteProjectArgs = {
  id: Scalars["String"]["input"];
};

export type MutationLoginArgs = {
  input: LoginUserInput;
};

export type MutationRegisterArgs = {
  input: RegisterUserInput;
};

export type MutationSendAgentMessageArgs = {
  input: SendMessageInput;
};

export type MutationStartScanArgs = {
  id: Scalars["String"]["input"];
};

export type MutationUpdateProjectArgs = {
  id: Scalars["String"]["input"];
  input: UpdateProjectInput;
};

export type PaginationInfo = {
  __typename?: "PaginationInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  limit: Scalars["Int"]["output"];
  page: Scalars["Int"]["output"];
  total: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type PerformanceMetric = {
  __typename?: "PerformanceMetric";
  cls: Scalars["Float"]["output"];
  diagnostics?: Maybe<Scalars["String"]["output"]>;
  domContentLoaded: Scalars["Float"]["output"];
  fcp: Scalars["Float"]["output"];
  id: Scalars["ID"]["output"];
  inp: Scalars["Float"]["output"];
  lcp: Scalars["Float"]["output"];
  onLoad: Scalars["Float"]["output"];
  opportunities?: Maybe<Scalars["String"]["output"]>;
  performanceScore: Scalars["Int"]["output"];
  resourceCount: Scalars["Int"]["output"];
  resources?: Maybe<Scalars["String"]["output"]>;
  scanId: Scalars["String"]["output"];
  speedIndex: Scalars["Float"]["output"];
  totalBlockingTime: Scalars["Float"]["output"];
  totalTransferSize: Scalars["Int"]["output"];
  ttfb: Scalars["Float"]["output"];
  url: Scalars["String"]["output"];
};

export type Project = {
  __typename?: "Project";
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  lastScanStatus?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  scanCount: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  url: Scalars["String"]["output"];
  user: PublicUser;
};

export type ProjectFiltersInput = {
  search?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<ProjectSortBy>;
  sortOrder?: InputMaybe<SortOrder>;
};

export enum ProjectSortBy {
  CreatedAt = "CREATED_AT",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
}

export type ProjectVulnerabilityStats = {
  __typename?: "ProjectVulnerabilityStats";
  critical: Scalars["Int"]["output"];
  high: Scalars["Int"]["output"];
  info: Scalars["Int"]["output"];
  low: Scalars["Int"]["output"];
  medium: Scalars["Int"]["output"];
  projectId: Scalars["ID"]["output"];
  projectName: Scalars["String"]["output"];
  total: Scalars["Int"]["output"];
};

export type ProjectsResponse = {
  __typename?: "ProjectsResponse";
  pagination: PaginationInfo;
  projects: Array<Project>;
};

export type PublicUser = {
  __typename?: "PublicUser";
  createdAt: Scalars["DateTime"]["output"];
  email: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  lastLoginAt?: Maybe<Scalars["DateTime"]["output"]>;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type Query = {
  __typename?: "Query";
  currentUser?: Maybe<User>;
  project: Project;
  projectVulnerabilityStats: Array<ProjectVulnerabilityStats>;
  projects: ProjectsResponse;
  scan: Scan;
  scanScreenshot?: Maybe<Scalars["String"]["output"]>;
  scanStats: ScanStats;
  scanTrendStats: Array<ScanTrendStats>;
  scans: ScansResponse;
  vulnerabilityStats: VulnerabilityStats;
};

export type QueryProjectArgs = {
  id: Scalars["String"]["input"];
};

export type QueryProjectsArgs = {
  filters?: InputMaybe<ProjectFiltersInput>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryScanArgs = {
  id: Scalars["String"]["input"];
};

export type QueryScanScreenshotArgs = {
  runId: Scalars["String"]["input"];
};

export type QueryScanTrendStatsArgs = {
  days?: Scalars["Int"]["input"];
};

export type QueryScansArgs = {
  filters?: InputMaybe<ScanFiltersInput>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
};

export type RegisterResponse = {
  __typename?: "RegisterResponse";
  data: PublicUser;
  message: Scalars["String"]["output"];
};

export type RegisterUserInput = {
  confirmPassword: Scalars["String"]["input"];
  email: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

export type Scan = {
  __typename?: "Scan";
  actions?: Maybe<Array<ScanAction>>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  performanceMetrics?: Maybe<Array<PerformanceMetric>>;
  project: Project;
  result?: Maybe<Scalars["String"]["output"]>;
  runId?: Maybe<Scalars["String"]["output"]>;
  scanType: ScanType;
  status: ScanStatus;
  updatedAt: Scalars["DateTime"]["output"];
  url: Scalars["String"]["output"];
  user: PublicUser;
  vulnerabilities?: Maybe<Array<Vulnerability>>;
};

export type ScanAction = {
  __typename?: "ScanAction";
  action: ActionDetail;
  context: ActionContext;
  step: Scalars["Int"]["output"];
  thinking?: Maybe<Scalars["String"]["output"]>;
  timestamp: Scalars["String"]["output"];
};

export type ScanEvent = {
  __typename?: "ScanEvent";
  data?: Maybe<ScanAction>;
  message?: Maybe<Scalars["String"]["output"]>;
  result?: Maybe<Scalars["String"]["output"]>;
  scanId: Scalars["ID"]["output"];
  timestamp?: Maybe<Scalars["String"]["output"]>;
  type: Scalars["String"]["output"];
};

export type ScanFiltersInput = {
  createdAfter?: InputMaybe<Scalars["String"]["input"]>;
  createdBefore?: InputMaybe<Scalars["String"]["input"]>;
  projectId?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<ScanSortBy>;
  sortOrder?: InputMaybe<SortOrder>;
  status?: InputMaybe<ScanStatus>;
};

export enum ScanSortBy {
  CreatedAt = "CREATED_AT",
  UpdatedAt = "UPDATED_AT",
  Url = "URL",
}

export type ScanStats = {
  __typename?: "ScanStats";
  scansByStatus: ScanStatusStats;
  totalScans: Scalars["Int"]["output"];
};

export enum ScanStatus {
  Active = "ACTIVE",
  Completed = "COMPLETED",
  Draft = "DRAFT",
  Failed = "FAILED",
  Queued = "QUEUED",
}

export type ScanStatusStats = {
  __typename?: "ScanStatusStats";
  active: Scalars["Int"]["output"];
  completed: Scalars["Int"]["output"];
  draft: Scalars["Int"]["output"];
  failed: Scalars["Int"]["output"];
  queued: Scalars["Int"]["output"];
};

export type ScanTrendStats = {
  __typename?: "ScanTrendStats";
  date: Scalars["String"]["output"];
  scans: Scalars["Float"]["output"];
  vulnerabilities: Scalars["Float"]["output"];
};

export enum ScanType {
  Dynamic = "DYNAMIC",
  Performance = "PERFORMANCE",
  Static = "STATIC",
}

export type ScansResponse = {
  __typename?: "ScansResponse";
  pagination: PaginationInfo;
  scans: Array<Scan>;
};

export type SendMessageInput = {
  content: Scalars["String"]["input"];
  scanId: Scalars["String"]["input"];
};

export enum SortOrder {
  Asc = "ASC",
  Desc = "DESC",
}

export type Subscription = {
  __typename?: "Subscription";
  browserPreviewStream: BrowserPreviewFrame;
  scanEvents: ScanEvent;
  scanStatusChanged: Scan;
};

export type SubscriptionBrowserPreviewStreamArgs = {
  runId: Scalars["String"]["input"];
};

export type SubscriptionScanEventsArgs = {
  scanId: Scalars["String"]["input"];
};

export type SubscriptionScanStatusChangedArgs = {
  scanId: Scalars["String"]["input"];
};

export type UpdateProjectInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type User = {
  __typename?: "User";
  createdAt: Scalars["DateTime"]["output"];
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  lastLoginAt?: Maybe<Scalars["DateTime"]["output"]>;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type Vulnerability = {
  __typename?: "Vulnerability";
  category: VulnerabilityCategory;
  description: Scalars["String"]["output"];
  evidence: Scalars["String"]["output"];
  findingId: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  remediation: Scalars["String"]["output"];
  scanId: Scalars["String"]["output"];
  severity: VulnerabilitySeverity;
  title: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export enum VulnerabilityCategory {
  Cookies = "COOKIES",
  Csrf = "CSRF",
  InformationDisclosure = "INFORMATION_DISCLOSURE",
  SecurityHeaders = "SECURITY_HEADERS",
  SensitiveFiles = "SENSITIVE_FILES",
  SqlInjection = "SQL_INJECTION",
  Xss = "XSS",
}

export type VulnerabilityCategoryStats = {
  __typename?: "VulnerabilityCategoryStats";
  category: VulnerabilityCategory;
  count: Scalars["Int"]["output"];
};

export enum VulnerabilitySeverity {
  Critical = "CRITICAL",
  High = "HIGH",
  Info = "INFO",
  Low = "LOW",
  Medium = "MEDIUM",
}

export type VulnerabilitySeverityStats = {
  __typename?: "VulnerabilitySeverityStats";
  count: Scalars["Int"]["output"];
  severity: VulnerabilitySeverity;
};

export type VulnerabilityStats = {
  __typename?: "VulnerabilityStats";
  byCategory: Array<VulnerabilityCategoryStats>;
  bySeverity: Array<VulnerabilitySeverityStats>;
  total: Scalars["Int"]["output"];
};

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;

export type CreateProjectMutation = {
  __typename?: "Mutation";
  createProject: {
    __typename?: "Project";
    id: string;
    name: string;
    url: string;
    description?: string | null;
    scanCount: number;
    lastScanStatus?: string | null;
    createdAt: any;
    updatedAt: any;
  };
};

export type CreateScanMutationVariables = Exact<{
  input: CreateScanInput;
}>;

export type CreateScanMutation = {
  __typename?: "Mutation";
  createScan: {
    __typename?: "Scan";
    id: string;
    url: string;
    status: ScanStatus;
    createdAt: any;
    updatedAt: any;
    project: { __typename?: "Project"; id: string; name: string; url: string };
  };
};

export type DeleteProjectMutationVariables = Exact<{
  id: Scalars["String"]["input"];
}>;

export type DeleteProjectMutation = {
  __typename?: "Mutation";
  deleteProject: boolean;
};

export type LoginMutationVariables = Exact<{
  input: LoginUserInput;
}>;

export type LoginMutation = {
  __typename?: "Mutation";
  login: {
    __typename?: "LoginResponse";
    message: string;
    user: {
      __typename?: "PublicUser";
      id: string;
      email: string;
      name: string;
    };
  };
};

export type RegisterMutationVariables = Exact<{
  input: RegisterUserInput;
}>;

export type RegisterMutation = {
  __typename?: "Mutation";
  register: {
    __typename?: "RegisterResponse";
    message: string;
    data: {
      __typename?: "PublicUser";
      id: string;
      email: string;
      name: string;
    };
  };
};

export type SendAgentMessageMutationVariables = Exact<{
  input: SendMessageInput;
}>;

export type SendAgentMessageMutation = {
  __typename?: "Mutation";
  sendAgentMessage: boolean;
};

export type StartScanMutationVariables = Exact<{
  id: Scalars["String"]["input"];
}>;

export type StartScanMutation = {
  __typename?: "Mutation";
  startScan: { __typename?: "Scan"; id: string; status: ScanStatus };
};

export type UpdateProjectMutationVariables = Exact<{
  id: Scalars["String"]["input"];
  input: UpdateProjectInput;
}>;

export type UpdateProjectMutation = {
  __typename?: "Mutation";
  updateProject: {
    __typename?: "Project";
    id: string;
    name: string;
    url: string;
    description?: string | null;
    scanCount: number;
    lastScanStatus?: string | null;
    createdAt: any;
    updatedAt: any;
  };
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  __typename?: "Query";
  currentUser?: {
    __typename?: "User";
    id: string;
    email: string;
    name: string;
  } | null;
};

export type GetProjectVulnerabilityStatsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetProjectVulnerabilityStatsQuery = {
  __typename?: "Query";
  projectVulnerabilityStats: Array<{
    __typename?: "ProjectVulnerabilityStats";
    projectId: string;
    projectName: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  }>;
};

export type GetProjectQueryVariables = Exact<{
  id: Scalars["String"]["input"];
}>;

export type GetProjectQuery = {
  __typename?: "Query";
  project: {
    __typename?: "Project";
    id: string;
    name: string;
    url: string;
    description?: string | null;
    scanCount: number;
    lastScanStatus?: string | null;
    createdAt: any;
    updatedAt: any;
  };
};

export type GetProjectsQueryVariables = Exact<{
  filters?: InputMaybe<ProjectFiltersInput>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetProjectsQuery = {
  __typename?: "Query";
  projects: {
    __typename?: "ProjectsResponse";
    projects: Array<{
      __typename?: "Project";
      id: string;
      name: string;
      url: string;
      description?: string | null;
      scanCount: number;
      lastScanStatus?: string | null;
      createdAt: any;
      updatedAt: any;
    }>;
    pagination: {
      __typename?: "PaginationInfo";
      total: number;
      page: number;
      totalPages: number;
      limit: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type GetScanStatsQueryVariables = Exact<{ [key: string]: never }>;

export type GetScanStatsQuery = {
  __typename?: "Query";
  scanStats: {
    __typename?: "ScanStats";
    totalScans: number;
    scansByStatus: {
      __typename?: "ScanStatusStats";
      draft: number;
      queued: number;
      active: number;
      completed: number;
      failed: number;
    };
  };
};

export type GetScanTrendStatsQueryVariables = Exact<{
  days?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetScanTrendStatsQuery = {
  __typename?: "Query";
  scanTrendStats: Array<{
    __typename?: "ScanTrendStats";
    date: string;
    scans: number;
    vulnerabilities: number;
  }>;
};

export type GetScanQueryVariables = Exact<{
  id: Scalars["String"]["input"];
}>;

export type GetScanQuery = {
  __typename?: "Query";
  scan: {
    __typename?: "Scan";
    id: string;
    url: string;
    status: ScanStatus;
    scanType: ScanType;
    runId?: string | null;
    result?: string | null;
    createdAt: any;
    updatedAt: any;
    project: { __typename?: "Project"; id: string; name: string; url: string };
    actions?: Array<{
      __typename?: "ScanAction";
      step: number;
      timestamp: string;
      thinking?: string | null;
      action: { __typename?: "ActionDetail"; name: string; display: string };
      context: { __typename?: "ActionContext"; url: string; title: string };
    }> | null;
    vulnerabilities?: Array<{
      __typename?: "Vulnerability";
      id: string;
      findingId: string;
      title: string;
      severity: VulnerabilitySeverity;
      category: VulnerabilityCategory;
      url: string;
      description: string;
      evidence: string;
      remediation: string;
    }> | null;
    performanceMetrics?: Array<{
      __typename?: "PerformanceMetric";
      id: string;
      url: string;
      performanceScore: number;
      lcp: number;
      fcp: number;
      cls: number;
      inp: number;
      ttfb: number;
      speedIndex: number;
      totalBlockingTime: number;
      domContentLoaded: number;
      onLoad: number;
      totalTransferSize: number;
      resourceCount: number;
      resources?: string | null;
      opportunities?: string | null;
      diagnostics?: string | null;
      scanId: string;
    }> | null;
  };
};

export type GetScanScreenshotQueryVariables = Exact<{
  runId: Scalars["String"]["input"];
}>;

export type GetScanScreenshotQuery = {
  __typename?: "Query";
  scanScreenshot?: string | null;
};

export type GetScansQueryVariables = Exact<{
  filters?: InputMaybe<ScanFiltersInput>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetScansQuery = {
  __typename?: "Query";
  scans: {
    __typename?: "ScansResponse";
    scans: Array<{
      __typename?: "Scan";
      id: string;
      url: string;
      status: ScanStatus;
      createdAt: any;
      updatedAt: any;
      project: {
        __typename?: "Project";
        id: string;
        name: string;
        url: string;
      };
    }>;
    pagination: {
      __typename?: "PaginationInfo";
      total: number;
      page: number;
      totalPages: number;
      limit: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type GetVulnerabilityStatsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetVulnerabilityStatsQuery = {
  __typename?: "Query";
  vulnerabilityStats: {
    __typename?: "VulnerabilityStats";
    total: number;
    bySeverity: Array<{
      __typename?: "VulnerabilitySeverityStats";
      severity: VulnerabilitySeverity;
      count: number;
    }>;
    byCategory: Array<{
      __typename?: "VulnerabilityCategoryStats";
      category: VulnerabilityCategory;
      count: number;
    }>;
  };
};

export type BrowserPreviewStreamSubscriptionVariables = Exact<{
  runId: Scalars["String"]["input"];
}>;

export type BrowserPreviewStreamSubscription = {
  __typename?: "Subscription";
  browserPreviewStream: {
    __typename?: "BrowserPreviewFrame";
    runId: string;
    frame: string;
    timestamp: number;
    frameNumber: number;
    latencyMs: number;
    url?: string | null;
  };
};

export type ScanEventsSubscriptionVariables = Exact<{
  scanId: Scalars["String"]["input"];
}>;

export type ScanEventsSubscription = {
  __typename?: "Subscription";
  scanEvents: {
    __typename?: "ScanEvent";
    scanId: string;
    type: string;
    result?: string | null;
    message?: string | null;
    timestamp?: string | null;
    data?: {
      __typename?: "ScanAction";
      step: number;
      timestamp: string;
      thinking?: string | null;
      action: { __typename?: "ActionDetail"; name: string; display: string };
      context: { __typename?: "ActionContext"; url: string; title: string };
    } | null;
  };
};

export type ScanStatusChangedSubscriptionVariables = Exact<{
  scanId: Scalars["String"]["input"];
}>;

export type ScanStatusChangedSubscription = {
  __typename?: "Subscription";
  scanStatusChanged: {
    __typename?: "Scan";
    id: string;
    url: string;
    status: ScanStatus;
    scanType: ScanType;
    result?: string | null;
    createdAt: any;
    updatedAt: any;
    actions?: Array<{
      __typename?: "ScanAction";
      step: number;
      timestamp: string;
      thinking?: string | null;
      action: { __typename?: "ActionDetail"; name: string; display: string };
      context: { __typename?: "ActionContext"; url: string; title: string };
    }> | null;
    vulnerabilities?: Array<{
      __typename?: "Vulnerability";
      id: string;
      findingId: string;
      title: string;
      severity: VulnerabilitySeverity;
      category: VulnerabilityCategory;
      url: string;
      description: string;
      evidence: string;
      remediation: string;
    }> | null;
    performanceMetrics?: Array<{
      __typename?: "PerformanceMetric";
      id: string;
      url: string;
      performanceScore: number;
      lcp: number;
      fcp: number;
      cls: number;
      inp: number;
      ttfb: number;
      speedIndex: number;
      totalBlockingTime: number;
      domContentLoaded: number;
      onLoad: number;
      totalTransferSize: number;
      resourceCount: number;
      resources?: string | null;
      opportunities?: string | null;
      diagnostics?: string | null;
      scanId: string;
    }> | null;
  };
};

export const CreateProjectDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateProject" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateProjectInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "scanCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "lastScanStatus" },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateProjectMutation,
  CreateProjectMutationVariables
>;
export const CreateScanDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateScan" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateScanInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createScan" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "project" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateScanMutation, CreateScanMutationVariables>;
export const DeleteProjectDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteProject" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteProjectMutation,
  DeleteProjectMutationVariables
>;
export const LoginDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "Login" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "LoginUserInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "login" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "Register" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "RegisterUserInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "register" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "data" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const SendAgentMessageDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SendAgentMessage" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SendMessageInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sendAgentMessage" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SendAgentMessageMutation,
  SendAgentMessageMutationVariables
>;
export const StartScanDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "StartScan" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "startScan" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StartScanMutation, StartScanMutationVariables>;
export const UpdateProjectDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateProject" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateProjectInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "scanCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "lastScanStatus" },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateProjectMutation,
  UpdateProjectMutationVariables
>;
export const CurrentUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CurrentUser" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "currentUser" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const GetProjectVulnerabilityStatsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetProjectVulnerabilityStats" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "projectVulnerabilityStats" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "projectId" } },
                { kind: "Field", name: { kind: "Name", value: "projectName" } },
                { kind: "Field", name: { kind: "Name", value: "critical" } },
                { kind: "Field", name: { kind: "Name", value: "high" } },
                { kind: "Field", name: { kind: "Name", value: "medium" } },
                { kind: "Field", name: { kind: "Name", value: "low" } },
                { kind: "Field", name: { kind: "Name", value: "info" } },
                { kind: "Field", name: { kind: "Name", value: "total" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetProjectVulnerabilityStatsQuery,
  GetProjectVulnerabilityStatsQueryVariables
>;
export const GetProjectDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetProject" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "project" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "scanCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "lastScanStatus" },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetProjectQuery, GetProjectQueryVariables>;
export const GetProjectsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetProjects" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filters" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ProjectFiltersInput" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "limit" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "projects" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "filters" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filters" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "limit" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "limit" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "projects" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "scanCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lastScanStatus" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedAt" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "page" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "totalPages" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetProjectsQuery, GetProjectsQueryVariables>;
export const GetScanStatsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetScanStats" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "scanStats" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "totalScans" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "scansByStatus" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "draft" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "queued" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "active" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "completed" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "failed" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetScanStatsQuery, GetScanStatsQueryVariables>;
export const GetScanTrendStatsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetScanTrendStats" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "days" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          defaultValue: { kind: "IntValue", value: "30" },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "scanTrendStats" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "days" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "days" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "date" } },
                { kind: "Field", name: { kind: "Name", value: "scans" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "vulnerabilities" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetScanTrendStatsQuery,
  GetScanTrendStatsQueryVariables
>;
export const GetScanDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetScan" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "scan" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "scanType" } },
                { kind: "Field", name: { kind: "Name", value: "runId" } },
                { kind: "Field", name: { kind: "Name", value: "result" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "project" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "actions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "step" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "thinking" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "action" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "display" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "context" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "url" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "vulnerabilities" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "findingId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "severity" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "category" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "evidence" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "remediation" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "performanceMetrics" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "performanceScore" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "lcp" } },
                      { kind: "Field", name: { kind: "Name", value: "fcp" } },
                      { kind: "Field", name: { kind: "Name", value: "cls" } },
                      { kind: "Field", name: { kind: "Name", value: "inp" } },
                      { kind: "Field", name: { kind: "Name", value: "ttfb" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "speedIndex" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "totalBlockingTime" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "domContentLoaded" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "onLoad" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "totalTransferSize" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resourceCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resources" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "opportunities" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "diagnostics" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "scanId" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetScanQuery, GetScanQueryVariables>;
export const GetScanScreenshotDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetScanScreenshot" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "runId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "scanScreenshot" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "runId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "runId" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetScanScreenshotQuery,
  GetScanScreenshotQueryVariables
>;
export const GetScansDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetScans" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filters" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ScanFiltersInput" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "limit" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "scans" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "filters" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filters" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "limit" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "limit" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "scans" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "project" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "url" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "page" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "totalPages" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetScansQuery, GetScansQueryVariables>;
export const GetVulnerabilityStatsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetVulnerabilityStats" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "vulnerabilityStats" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "total" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "bySeverity" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "severity" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "byCategory" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "category" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetVulnerabilityStatsQuery,
  GetVulnerabilityStatsQueryVariables
>;
export const BrowserPreviewStreamDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "subscription",
      name: { kind: "Name", value: "BrowserPreviewStream" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "runId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "browserPreviewStream" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "runId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "runId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "runId" } },
                { kind: "Field", name: { kind: "Name", value: "frame" } },
                { kind: "Field", name: { kind: "Name", value: "timestamp" } },
                { kind: "Field", name: { kind: "Name", value: "frameNumber" } },
                { kind: "Field", name: { kind: "Name", value: "latencyMs" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  BrowserPreviewStreamSubscription,
  BrowserPreviewStreamSubscriptionVariables
>;
export const ScanEventsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "subscription",
      name: { kind: "Name", value: "ScanEvents" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "scanId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "scanEvents" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "scanId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "scanId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "scanId" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "data" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "step" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "thinking" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "action" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "display" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "context" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "url" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "result" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                { kind: "Field", name: { kind: "Name", value: "timestamp" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ScanEventsSubscription,
  ScanEventsSubscriptionVariables
>;
export const ScanStatusChangedDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "subscription",
      name: { kind: "Name", value: "ScanStatusChanged" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "scanId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "scanStatusChanged" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "scanId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "scanId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "scanType" } },
                { kind: "Field", name: { kind: "Name", value: "result" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "actions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "step" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "thinking" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "action" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "display" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "context" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "url" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "vulnerabilities" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "findingId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "severity" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "category" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "evidence" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "remediation" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "performanceMetrics" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "performanceScore" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "lcp" } },
                      { kind: "Field", name: { kind: "Name", value: "fcp" } },
                      { kind: "Field", name: { kind: "Name", value: "cls" } },
                      { kind: "Field", name: { kind: "Name", value: "inp" } },
                      { kind: "Field", name: { kind: "Name", value: "ttfb" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "speedIndex" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "totalBlockingTime" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "domContentLoaded" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "onLoad" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "totalTransferSize" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resourceCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resources" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "opportunities" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "diagnostics" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "scanId" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ScanStatusChangedSubscription,
  ScanStatusChangedSubscriptionVariables
>;
