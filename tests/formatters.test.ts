import { describe, it, expect } from "vitest";
import { formatScanResult, formatScanList } from "../src/formatters.js";
import type { ScanResult, ScanListResult } from "@middlebrick/api-client";

const completedScan: ScanResult = {
  id: "scan_abc123",
  status: "completed",
  apiUrl: "https://api.example.com/v1/users",
  method: "GET",
  createdAt: "2026-01-01T00:00:00Z",
  completedAt: "2026-01-01T00:01:00Z",
  overall: 72,
  letterGrade: "C",
  categories: {
    Authentication: 80,
    "Data Exposure": 60,
  },
  findings: [
    {
      id: "f1",
      severity: "high",
      category: "Authentication",
      title: "Weak authentication scheme",
      description: "No OAuth2 or API key authentication detected",
      remediation: "Add OAuth2 or API key authentication",
    },
    {
      id: "f2",
      severity: "medium",
      category: "Data Exposure",
      title: "Excessive data exposure",
      description: "Response contains email addresses in plain text",
      remediation: "Mask or remove PII from responses",
    },
  ],
};

const failedScan: ScanResult = {
  id: "scan_fail",
  status: "failed",
  apiUrl: "https://api.example.com/v1/users",
  method: "GET",
  createdAt: "2026-01-01T00:00:00Z",
  errorMessage: "Connection timed out",
};

const processingScan: ScanResult = {
  id: "scan_proc",
  status: "processing",
  apiUrl: "https://api.example.com/v1/users",
  method: "POST",
  createdAt: "2026-01-01T00:00:00Z",
};

describe("formatScanResult", () => {
  it("includes URL and method", () => {
    const output = formatScanResult(completedScan);
    expect(output).toContain("https://api.example.com/v1/users");
    expect(output).toContain("GET");
  });

  it("includes score and letter grade", () => {
    const output = formatScanResult(completedScan);
    expect(output).toContain("72/100");
    expect(output).toContain("Grade: C");
  });

  it("includes category names and scores", () => {
    const output = formatScanResult(completedScan);
    expect(output).toContain("Authentication");
    expect(output).toContain("80/100");
    expect(output).toContain("Data Exposure");
    expect(output).toContain("60/100");
  });

  it("includes findings count", () => {
    const output = formatScanResult(completedScan);
    expect(output).toContain("Findings (2):");
  });

  it("includes finding severity, title, description, remediation", () => {
    const output = formatScanResult(completedScan);
    expect(output).toContain("[HIGH] Weak authentication scheme");
    expect(output).toContain("No OAuth2 or API key authentication detected");
    expect(output).toContain("Remediation: Add OAuth2 or API key authentication");
    expect(output).toContain("[MEDIUM] Excessive data exposure");
  });

  it("handles failed scan with error message", () => {
    const output = formatScanResult(failedScan);
    expect(output).toContain("failed");
    expect(output).toContain("Connection timed out");
  });

  it("handles no findings", () => {
    const scan: ScanResult = {
      ...completedScan,
      findings: [],
    };
    const output = formatScanResult(scan);
    expect(output).not.toContain("Findings");
  });

  it("handles no categories", () => {
    const scan: ScanResult = {
      ...completedScan,
      categories: {},
    };
    const output = formatScanResult(scan);
    expect(output).not.toContain("Categories:");
  });

  it("handles queued/processing status without score", () => {
    const output = formatScanResult(processingScan);
    expect(output).toContain("processing");
    expect(output).not.toContain("Score:");
  });

  it("handles undefined findings", () => {
    const scan: ScanResult = {
      ...completedScan,
      findings: undefined,
    };
    const output = formatScanResult(scan);
    expect(output).not.toContain("Findings");
  });

  it("handles undefined categories", () => {
    const scan: ScanResult = {
      ...completedScan,
      categories: undefined,
    };
    const output = formatScanResult(scan);
    expect(output).not.toContain("Categories:");
  });

  it("includes middleBrick header", () => {
    const output = formatScanResult(completedScan);
    expect(output).toContain("middleBrick API Security Scan");
  });
});

describe("formatScanList", () => {
  const scanList: ScanListResult = {
    scans: [
      {
        id: "scan_abc123",
        apiUrl: "https://api.example.com",
        method: "GET",
        status: "completed",
        riskScore: 72,
        errorMessage: null,
        createdAt: "2026-01-01T00:00:00Z",
        completedAt: "2026-01-01T00:01:00Z",
      },
      {
        id: "scan_def456",
        apiUrl: "https://api.example.com/v2",
        method: "POST",
        status: "completed",
        riskScore: 85,
        errorMessage: null,
        createdAt: "2026-01-02T00:00:00Z",
        completedAt: "2026-01-02T00:01:00Z",
      },
      {
        id: "scan_ghi789",
        apiUrl: "https://api.example.com/v3",
        method: "GET",
        status: "processing",
        riskScore: null,
        errorMessage: null,
        createdAt: "2026-01-03T00:00:00Z",
        completedAt: null,
      },
    ],
    total: 3,
    limit: 10,
    offset: 0,
  };

  it("includes total count", () => {
    const output = formatScanList(scanList);
    expect(output).toContain("3 total");
  });

  it("includes all scan entries", () => {
    const output = formatScanList(scanList);
    expect(output).toContain("scan_abc123");
    expect(output).toContain("scan_def456");
    expect(output).toContain("scan_ghi789");
  });

  it("shows dash for scans with no score", () => {
    const output = formatScanList(scanList);
    const lines = output.split("\n");
    const processingLine = lines.find((l) => l.includes("scan_ghi789"));
    expect(processingLine).toContain("-");
  });
});
