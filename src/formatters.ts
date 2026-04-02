import type { ScanResult, ScanListResult } from "@middlebrick/api-client";

export function formatScanResult(result: ScanResult): string {
  const lines: string[] = [];

  lines.push("middleBrick API Security Scan");
  lines.push("");
  lines.push(`URL:     ${result.apiUrl}`);
  lines.push(`Method:  ${result.method}`);
  lines.push(`Status:  ${result.status}`);

  if (result.status === "completed" && result.overall != null) {
    lines.push(`Score:   ${result.overall}/100 (Grade: ${result.letterGrade})`);
  }

  if (result.status === "failed" && result.errorMessage) {
    lines.push("");
    lines.push(`Error: ${result.errorMessage}`);
  }

  if (result.categories && Object.keys(result.categories).length > 0) {
    lines.push("");
    lines.push("Categories:");
    for (const [name, score] of Object.entries(result.categories)) {
      lines.push(`  ${padRight(name, 24)} ${score}/100`);
    }
  }

  if (result.findings && result.findings.length > 0) {
    lines.push("");
    lines.push(`Findings (${result.findings.length}):`);
    for (const finding of result.findings) {
      lines.push(
        `  [${finding.severity.toUpperCase()}] ${finding.title}`
      );
      lines.push(`    ${finding.description}`);
      lines.push(`    Remediation: ${finding.remediation}`);
    }
  }

  return lines.join("\n");
}

export function formatScanList(result: ScanListResult): string {
  const lines: string[] = [];

  lines.push(`middleBrick Scans (${result.total} total)`);
  lines.push("");
  lines.push(
    `${padRight("ID", 16)}${padRight("URL", 36)}${padRight("Method", 8)}${padRight("Status", 12)}Score`
  );

  for (const scan of result.scans) {
    const score =
      scan.riskScore != null ? String(scan.riskScore) : "-";
    lines.push(
      `${padRight(scan.id, 16)}${padRight(scan.apiUrl, 36)}${padRight(scan.method, 8)}${padRight(scan.status, 12)}${score}`
    );
  }

  return lines.join("\n");
}

function padRight(str: string, len: number): string {
  if (str.length >= len) return str.substring(0, len - 1) + " ";
  return str + " ".repeat(len - str.length);
}
