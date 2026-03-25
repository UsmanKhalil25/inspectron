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
  DateTime: { input: any; output: any };
};

export type BrowserPreviewFrame = {
  __typename?: "BrowserPreviewFrame";
  frame: Scalars["String"]["output"];
  frameNumber: Scalars["Int"]["output"];
  latencyMs: Scalars["Int"]["output"];
  runId: Scalars["ID"]["output"];
  timestamp: Scalars["Float"]["output"];
};

export type CreateScanInput = {
  status?: InputMaybe<ScanStatus>;
  url: Scalars["String"]["input"];
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
  createScan: Scan;
  login: LoginResponse;
  register: RegisterResponse;
};

export type MutationCreateScanArgs = {
  input: CreateScanInput;
};

export type MutationLoginArgs = {
  input: LoginUserInput;
};

export type MutationRegisterArgs = {
  input: RegisterUserInput;
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
  scan: Scan;
  scanScreenshot?: Maybe<Scalars["String"]["output"]>;
  scanStats: ScanStats;
  scans: ScansResponse;
};

export type QueryScanArgs = {
  id: Scalars["String"]["input"];
};

export type QueryScanScreenshotArgs = {
  runId: Scalars["String"]["input"];
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
  runId?: Maybe<Scalars["String"]["output"]>;
  status: ScanStatus;
  updatedAt: Scalars["DateTime"]["output"];
  url: Scalars["String"]["output"];
  user: PublicUser;
};

export type ScanAction = {
  __typename?: "ScanAction";
  action: Scalars["String"]["output"];
  goal: Scalars["String"]["output"];
  step: Scalars["Int"]["output"];
  timestamp: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type ScanEvent = {
  __typename?: "ScanEvent";
  data: ScanEventData;
  scanId: Scalars["ID"]["output"];
  type: Scalars["String"]["output"];
};

export type ScanEventData = {
  __typename?: "ScanEventData";
  action?: Maybe<Scalars["String"]["output"]>;
  goal?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  result?: Maybe<Scalars["String"]["output"]>;
  step?: Maybe<Scalars["Float"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
};

export type ScanFiltersInput = {
  createdAfter?: InputMaybe<Scalars["String"]["input"]>;
  createdBefore?: InputMaybe<Scalars["String"]["input"]>;
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

export type ScansResponse = {
  __typename?: "ScansResponse";
  pagination: PaginationInfo;
  scans: Array<Scan>;
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

export type User = {
  __typename?: "User";
  createdAt: Scalars["DateTime"]["output"];
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  lastLoginAt?: Maybe<Scalars["DateTime"]["output"]>;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
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
  };
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
    runId?: string | null;
    createdAt: any;
    updatedAt: any;
    actions?: Array<{
      __typename?: "ScanAction";
      step: number;
      action: string;
      goal: string;
      url: string;
      timestamp: string;
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
    data: {
      __typename?: "ScanEventData";
      step?: number | null;
      action?: string | null;
      goal?: string | null;
      url?: string | null;
      result?: string | null;
      message?: string | null;
    };
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
    createdAt: any;
    updatedAt: any;
  };
};
