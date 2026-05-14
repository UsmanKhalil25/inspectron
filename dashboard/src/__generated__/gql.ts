/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateProjectDocument;
  "\n  mutation CreateScan($input: CreateScanInput!) {\n    createScan(input: $input) {\n      id\n      url\n      status\n      project {\n        id\n        name\n        url\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateScanDocument;
  "\n  mutation DeleteProject($id: String!) {\n    deleteProject(id: $id)\n  }\n": typeof types.DeleteProjectDocument;
  "\n  mutation Login($input: LoginUserInput!) {\n    login(input: $input) {\n      message\n      user {\n        id\n        email\n        name\n      }\n    }\n  }\n": typeof types.LoginDocument;
  "\n  mutation Register($input: RegisterUserInput!) {\n    register(input: $input) {\n      message\n      data {\n        id\n        email\n        name\n      }\n    }\n  }": typeof types.RegisterDocument;
  "\n  mutation SendAgentMessage($input: SendMessageInput!) {\n    sendAgentMessage(input: $input)\n  }\n": typeof types.SendAgentMessageDocument;
  "\n  mutation StartScan($id: String!) {\n    startScan(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.StartScanDocument;
  "\n  mutation UpdateProject($id: String!, $input: UpdateProjectInput!) {\n    updateProject(id: $id, input: $input) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateProjectDocument;
  "\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      name\n    }\n  }\n": typeof types.CurrentUserDocument;
  "\n  query GetProjectVulnerabilityStats {\n    projectVulnerabilityStats {\n      projectId\n      projectName\n      critical\n      high\n      medium\n      low\n      info\n      total\n    }\n  }\n": typeof types.GetProjectVulnerabilityStatsDocument;
  "\n  query GetProject($id: String!) {\n    project(id: $id) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetProjectDocument;
  "\n  query GetProjects($filters: ProjectFiltersInput, $limit: Int, $page: Int) {\n    projects(filters: $filters, limit: $limit, page: $page) {\n      projects {\n        id\n        name\n        url\n        description\n        scanCount\n        lastScanStatus\n        createdAt\n        updatedAt\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n": typeof types.GetProjectsDocument;
  "\n  query GetScanStats {\n    scanStats {\n      totalScans\n      scansByStatus {\n        draft\n        queued\n        active\n        completed\n        failed\n      }\n    }\n  }\n": typeof types.GetScanStatsDocument;
  "\n  query GetScanTrendStats($days: Int = 30) {\n    scanTrendStats(days: $days) {\n      date\n      scans\n      vulnerabilities\n    }\n  }\n": typeof types.GetScanTrendStatsDocument;
  "\n  query GetScan($id: String!) {\n    scan(id: $id) {\n      id\n      url\n      status\n      scanType\n      runId\n      result\n      project {\n        id\n        name\n        url\n      }\n      actions {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      vulnerabilities {\n        id\n        findingId\n        title\n        severity\n        category\n        url\n        description\n        evidence\n        remediation\n      }\n      performanceMetrics {\n        id\n        url\n        performanceScore\n        lcp\n        fcp\n        cls\n        inp\n        ttfb\n        speedIndex\n        totalBlockingTime\n        domContentLoaded\n        onLoad\n        totalTransferSize\n        resourceCount\n        resources\n        opportunities\n        diagnostics\n        scanId\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetScanDocument;
  "\n  query GetScanScreenshot($runId: String!) {\n    scanScreenshot(runId: $runId)\n  }\n": typeof types.GetScanScreenshotDocument;
  "\n  query GetScans($filters: ScanFiltersInput, $limit: Int, $page: Int) {\n    scans(filters: $filters, limit: $limit, page: $page) {\n      scans {\n        id\n        url\n        status\n        createdAt\n        updatedAt\n        project {\n          id\n          name\n          url\n        }\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n": typeof types.GetScansDocument;
  "\n  query GetVulnerabilityStats {\n    vulnerabilityStats {\n      total\n      bySeverity {\n        severity\n        count\n      }\n      byCategory {\n        category\n        count\n      }\n    }\n  }\n": typeof types.GetVulnerabilityStatsDocument;
  "\n  subscription BrowserPreviewStream($runId: String!) {\n    browserPreviewStream(runId: $runId) {\n      runId\n      frame\n      timestamp\n      frameNumber\n      latencyMs\n      url\n    }\n  }\n": typeof types.BrowserPreviewStreamDocument;
  "\n  subscription ScanEvents($scanId: String!) {\n    scanEvents(scanId: $scanId) {\n      scanId\n      type\n      data {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      result\n      message\n      timestamp\n    }\n  }\n": typeof types.ScanEventsDocument;
  "\n  subscription ScanStatusChanged($scanId: String!) {\n    scanStatusChanged(scanId: $scanId) {\n      id\n      url\n      status\n      scanType\n      result\n      actions {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      vulnerabilities {\n        id\n        findingId\n        title\n        severity\n        category\n        url\n        description\n        evidence\n        remediation\n      }\n      performanceMetrics {\n        id\n        url\n        performanceScore\n        lcp\n        fcp\n        cls\n        inp\n        ttfb\n        speedIndex\n        totalBlockingTime\n        domContentLoaded\n        onLoad\n        totalTransferSize\n        resourceCount\n        resources\n        opportunities\n        diagnostics\n        scanId\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ScanStatusChangedDocument;
};
const documents: Documents = {
  "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.CreateProjectDocument,
  "\n  mutation CreateScan($input: CreateScanInput!) {\n    createScan(input: $input) {\n      id\n      url\n      status\n      project {\n        id\n        name\n        url\n      }\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.CreateScanDocument,
  "\n  mutation DeleteProject($id: String!) {\n    deleteProject(id: $id)\n  }\n":
    types.DeleteProjectDocument,
  "\n  mutation Login($input: LoginUserInput!) {\n    login(input: $input) {\n      message\n      user {\n        id\n        email\n        name\n      }\n    }\n  }\n":
    types.LoginDocument,
  "\n  mutation Register($input: RegisterUserInput!) {\n    register(input: $input) {\n      message\n      data {\n        id\n        email\n        name\n      }\n    }\n  }":
    types.RegisterDocument,
  "\n  mutation SendAgentMessage($input: SendMessageInput!) {\n    sendAgentMessage(input: $input)\n  }\n":
    types.SendAgentMessageDocument,
  "\n  mutation StartScan($id: String!) {\n    startScan(id: $id) {\n      id\n      status\n    }\n  }\n":
    types.StartScanDocument,
  "\n  mutation UpdateProject($id: String!, $input: UpdateProjectInput!) {\n    updateProject(id: $id, input: $input) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.UpdateProjectDocument,
  "\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      name\n    }\n  }\n":
    types.CurrentUserDocument,
  "\n  query GetProjectVulnerabilityStats {\n    projectVulnerabilityStats {\n      projectId\n      projectName\n      critical\n      high\n      medium\n      low\n      info\n      total\n    }\n  }\n":
    types.GetProjectVulnerabilityStatsDocument,
  "\n  query GetProject($id: String!) {\n    project(id: $id) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.GetProjectDocument,
  "\n  query GetProjects($filters: ProjectFiltersInput, $limit: Int, $page: Int) {\n    projects(filters: $filters, limit: $limit, page: $page) {\n      projects {\n        id\n        name\n        url\n        description\n        scanCount\n        lastScanStatus\n        createdAt\n        updatedAt\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n":
    types.GetProjectsDocument,
  "\n  query GetScanStats {\n    scanStats {\n      totalScans\n      scansByStatus {\n        draft\n        queued\n        active\n        completed\n        failed\n      }\n    }\n  }\n":
    types.GetScanStatsDocument,
  "\n  query GetScanTrendStats($days: Int = 30) {\n    scanTrendStats(days: $days) {\n      date\n      scans\n      vulnerabilities\n    }\n  }\n":
    types.GetScanTrendStatsDocument,
  "\n  query GetScan($id: String!) {\n    scan(id: $id) {\n      id\n      url\n      status\n      scanType\n      runId\n      result\n      project {\n        id\n        name\n        url\n      }\n      actions {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      vulnerabilities {\n        id\n        findingId\n        title\n        severity\n        category\n        url\n        description\n        evidence\n        remediation\n      }\n      performanceMetrics {\n        id\n        url\n        performanceScore\n        lcp\n        fcp\n        cls\n        inp\n        ttfb\n        speedIndex\n        totalBlockingTime\n        domContentLoaded\n        onLoad\n        totalTransferSize\n        resourceCount\n        resources\n        opportunities\n        diagnostics\n        scanId\n      }\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.GetScanDocument,
  "\n  query GetScanScreenshot($runId: String!) {\n    scanScreenshot(runId: $runId)\n  }\n":
    types.GetScanScreenshotDocument,
  "\n  query GetScans($filters: ScanFiltersInput, $limit: Int, $page: Int) {\n    scans(filters: $filters, limit: $limit, page: $page) {\n      scans {\n        id\n        url\n        status\n        createdAt\n        updatedAt\n        project {\n          id\n          name\n          url\n        }\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n":
    types.GetScansDocument,
  "\n  query GetVulnerabilityStats {\n    vulnerabilityStats {\n      total\n      bySeverity {\n        severity\n        count\n      }\n      byCategory {\n        category\n        count\n      }\n    }\n  }\n":
    types.GetVulnerabilityStatsDocument,
  "\n  subscription BrowserPreviewStream($runId: String!) {\n    browserPreviewStream(runId: $runId) {\n      runId\n      frame\n      timestamp\n      frameNumber\n      latencyMs\n      url\n    }\n  }\n":
    types.BrowserPreviewStreamDocument,
  "\n  subscription ScanEvents($scanId: String!) {\n    scanEvents(scanId: $scanId) {\n      scanId\n      type\n      data {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      result\n      message\n      timestamp\n    }\n  }\n":
    types.ScanEventsDocument,
  "\n  subscription ScanStatusChanged($scanId: String!) {\n    scanStatusChanged(scanId: $scanId) {\n      id\n      url\n      status\n      scanType\n      result\n      actions {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      vulnerabilities {\n        id\n        findingId\n        title\n        severity\n        category\n        url\n        description\n        evidence\n        remediation\n      }\n      performanceMetrics {\n        id\n        url\n        performanceScore\n        lcp\n        fcp\n        cls\n        inp\n        ttfb\n        speedIndex\n        totalBlockingTime\n        domContentLoaded\n        onLoad\n        totalTransferSize\n        resourceCount\n        resources\n        opportunities\n        diagnostics\n        scanId\n      }\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.ScanStatusChangedDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateScan($input: CreateScanInput!) {\n    createScan(input: $input) {\n      id\n      url\n      status\n      project {\n        id\n        name\n        url\n      }\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation CreateScan($input: CreateScanInput!) {\n    createScan(input: $input) {\n      id\n      url\n      status\n      project {\n        id\n        name\n        url\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation DeleteProject($id: String!) {\n    deleteProject(id: $id)\n  }\n",
): (typeof documents)["\n  mutation DeleteProject($id: String!) {\n    deleteProject(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation Login($input: LoginUserInput!) {\n    login(input: $input) {\n      message\n      user {\n        id\n        email\n        name\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation Login($input: LoginUserInput!) {\n    login(input: $input) {\n      message\n      user {\n        id\n        email\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation Register($input: RegisterUserInput!) {\n    register(input: $input) {\n      message\n      data {\n        id\n        email\n        name\n      }\n    }\n  }",
): (typeof documents)["\n  mutation Register($input: RegisterUserInput!) {\n    register(input: $input) {\n      message\n      data {\n        id\n        email\n        name\n      }\n    }\n  }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation SendAgentMessage($input: SendMessageInput!) {\n    sendAgentMessage(input: $input)\n  }\n",
): (typeof documents)["\n  mutation SendAgentMessage($input: SendMessageInput!) {\n    sendAgentMessage(input: $input)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation StartScan($id: String!) {\n    startScan(id: $id) {\n      id\n      status\n    }\n  }\n",
): (typeof documents)["\n  mutation StartScan($id: String!) {\n    startScan(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateProject($id: String!, $input: UpdateProjectInput!) {\n    updateProject(id: $id, input: $input) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation UpdateProject($id: String!, $input: UpdateProjectInput!) {\n    updateProject(id: $id, input: $input) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      name\n    }\n  }\n",
): (typeof documents)["\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetProjectVulnerabilityStats {\n    projectVulnerabilityStats {\n      projectId\n      projectName\n      critical\n      high\n      medium\n      low\n      info\n      total\n    }\n  }\n",
): (typeof documents)["\n  query GetProjectVulnerabilityStats {\n    projectVulnerabilityStats {\n      projectId\n      projectName\n      critical\n      high\n      medium\n      low\n      info\n      total\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetProject($id: String!) {\n    project(id: $id) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  query GetProject($id: String!) {\n    project(id: $id) {\n      id\n      name\n      url\n      description\n      scanCount\n      lastScanStatus\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetProjects($filters: ProjectFiltersInput, $limit: Int, $page: Int) {\n    projects(filters: $filters, limit: $limit, page: $page) {\n      projects {\n        id\n        name\n        url\n        description\n        scanCount\n        lastScanStatus\n        createdAt\n        updatedAt\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n",
): (typeof documents)["\n  query GetProjects($filters: ProjectFiltersInput, $limit: Int, $page: Int) {\n    projects(filters: $filters, limit: $limit, page: $page) {\n      projects {\n        id\n        name\n        url\n        description\n        scanCount\n        lastScanStatus\n        createdAt\n        updatedAt\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetScanStats {\n    scanStats {\n      totalScans\n      scansByStatus {\n        draft\n        queued\n        active\n        completed\n        failed\n      }\n    }\n  }\n",
): (typeof documents)["\n  query GetScanStats {\n    scanStats {\n      totalScans\n      scansByStatus {\n        draft\n        queued\n        active\n        completed\n        failed\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetScanTrendStats($days: Int = 30) {\n    scanTrendStats(days: $days) {\n      date\n      scans\n      vulnerabilities\n    }\n  }\n",
): (typeof documents)["\n  query GetScanTrendStats($days: Int = 30) {\n    scanTrendStats(days: $days) {\n      date\n      scans\n      vulnerabilities\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetScan($id: String!) {\n    scan(id: $id) {\n      id\n      url\n      status\n      scanType\n      runId\n      result\n      project {\n        id\n        name\n        url\n      }\n      actions {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      vulnerabilities {\n        id\n        findingId\n        title\n        severity\n        category\n        url\n        description\n        evidence\n        remediation\n      }\n      performanceMetrics {\n        id\n        url\n        performanceScore\n        lcp\n        fcp\n        cls\n        inp\n        ttfb\n        speedIndex\n        totalBlockingTime\n        domContentLoaded\n        onLoad\n        totalTransferSize\n        resourceCount\n        resources\n        opportunities\n        diagnostics\n        scanId\n      }\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  query GetScan($id: String!) {\n    scan(id: $id) {\n      id\n      url\n      status\n      scanType\n      runId\n      result\n      project {\n        id\n        name\n        url\n      }\n      actions {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      vulnerabilities {\n        id\n        findingId\n        title\n        severity\n        category\n        url\n        description\n        evidence\n        remediation\n      }\n      performanceMetrics {\n        id\n        url\n        performanceScore\n        lcp\n        fcp\n        cls\n        inp\n        ttfb\n        speedIndex\n        totalBlockingTime\n        domContentLoaded\n        onLoad\n        totalTransferSize\n        resourceCount\n        resources\n        opportunities\n        diagnostics\n        scanId\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetScanScreenshot($runId: String!) {\n    scanScreenshot(runId: $runId)\n  }\n",
): (typeof documents)["\n  query GetScanScreenshot($runId: String!) {\n    scanScreenshot(runId: $runId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetScans($filters: ScanFiltersInput, $limit: Int, $page: Int) {\n    scans(filters: $filters, limit: $limit, page: $page) {\n      scans {\n        id\n        url\n        status\n        createdAt\n        updatedAt\n        project {\n          id\n          name\n          url\n        }\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n",
): (typeof documents)["\n  query GetScans($filters: ScanFiltersInput, $limit: Int, $page: Int) {\n    scans(filters: $filters, limit: $limit, page: $page) {\n      scans {\n        id\n        url\n        status\n        createdAt\n        updatedAt\n        project {\n          id\n          name\n          url\n        }\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetVulnerabilityStats {\n    vulnerabilityStats {\n      total\n      bySeverity {\n        severity\n        count\n      }\n      byCategory {\n        category\n        count\n      }\n    }\n  }\n",
): (typeof documents)["\n  query GetVulnerabilityStats {\n    vulnerabilityStats {\n      total\n      bySeverity {\n        severity\n        count\n      }\n      byCategory {\n        category\n        count\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  subscription BrowserPreviewStream($runId: String!) {\n    browserPreviewStream(runId: $runId) {\n      runId\n      frame\n      timestamp\n      frameNumber\n      latencyMs\n      url\n    }\n  }\n",
): (typeof documents)["\n  subscription BrowserPreviewStream($runId: String!) {\n    browserPreviewStream(runId: $runId) {\n      runId\n      frame\n      timestamp\n      frameNumber\n      latencyMs\n      url\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  subscription ScanEvents($scanId: String!) {\n    scanEvents(scanId: $scanId) {\n      scanId\n      type\n      data {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      result\n      message\n      timestamp\n    }\n  }\n",
): (typeof documents)["\n  subscription ScanEvents($scanId: String!) {\n    scanEvents(scanId: $scanId) {\n      scanId\n      type\n      data {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      result\n      message\n      timestamp\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  subscription ScanStatusChanged($scanId: String!) {\n    scanStatusChanged(scanId: $scanId) {\n      id\n      url\n      status\n      scanType\n      result\n      actions {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      vulnerabilities {\n        id\n        findingId\n        title\n        severity\n        category\n        url\n        description\n        evidence\n        remediation\n      }\n      performanceMetrics {\n        id\n        url\n        performanceScore\n        lcp\n        fcp\n        cls\n        inp\n        ttfb\n        speedIndex\n        totalBlockingTime\n        domContentLoaded\n        onLoad\n        totalTransferSize\n        resourceCount\n        resources\n        opportunities\n        diagnostics\n        scanId\n      }\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  subscription ScanStatusChanged($scanId: String!) {\n    scanStatusChanged(scanId: $scanId) {\n      id\n      url\n      status\n      scanType\n      result\n      actions {\n        step\n        timestamp\n        thinking\n        action {\n          name\n          display\n        }\n        context {\n          url\n          title\n        }\n      }\n      vulnerabilities {\n        id\n        findingId\n        title\n        severity\n        category\n        url\n        description\n        evidence\n        remediation\n      }\n      performanceMetrics {\n        id\n        url\n        performanceScore\n        lcp\n        fcp\n        cls\n        inp\n        ttfb\n        speedIndex\n        totalBlockingTime\n        domContentLoaded\n        onLoad\n        totalTransferSize\n        resourceCount\n        resources\n        opportunities\n        diagnostics\n        scanId\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
