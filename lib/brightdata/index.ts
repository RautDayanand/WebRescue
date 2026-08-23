import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CollectorCreationOptions {
  url: string;
  description: string;
  name?: string;
  timeoutSeconds?: number;
}

export interface CollectorCreationResult {
  collectorId: string;
  name: string;
  url: string;
  status: string;
  rawOutput?: any;
}

export interface ScraperRunResult {
  collectorId: string;
  url: string;
  status: string;
  data: any;
  rawOutput: string;
}

export interface CollectorHealOptions {
  collectorId: string;
  whatBroke: string;
  targetUrl?: string;
  autoApprove?: boolean;
}

export interface CollectorHealResult {
  collectorId: string;
  status: string;
  details: string;
  rawOutput?: any;
}

/**
 * Utility to resolve the available Bright Data CLI executable prefix.
 */
async function getCLIBaseCommand(): Promise<string> {
  try {
    await execAsync('bdata --version');
    return 'bdata';
  } catch {
    try {
      await execAsync('brightdata --version');
      return 'brightdata';
    } catch {
      return 'npx -p @brightdata/cli bdata';
    }
  }
}

/**
 * Executes a Bright Data CLI command safely.
 */
export async function execBrightDataCLI(args: string, timeoutMs: number = 600000): Promise<{ stdout: string; stderr: string }> {
  const baseCmd = await getCLIBaseCommand();
  const fullCmd = `${baseCmd} ${args}`;
  
  try {
    const { stdout, stderr } = await execAsync(fullCmd, {
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      env: { ...process.env },
    });
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error: any) {
    const stdout = error.stdout ? String(error.stdout).trim() : '';
    const stderr = error.stderr ? String(error.stderr).trim() : error.message;
    throw new Error(`Bright Data CLI execution failed: ${stderr || stdout}`);
  }
}

/**
 * 2.1 — Create a Bright Data Scraper Collector
 * `bdata scraper create <url> "<description>" --json`
 */
export async function createBrightDataCollector(
  options: CollectorCreationOptions
): Promise<CollectorCreationResult> {
  const { url, description, name, timeoutSeconds = 600 } = options;

  let cmdArgs = `scraper create "${url}" "${description.replace(/"/g, '\\"')}" --json --timeout ${timeoutSeconds}`;
  if (name) {
    cmdArgs += ` --name "${name}"`;
  }

  const { stdout } = await execBrightDataCLI(cmdArgs, (timeoutSeconds + 60) * 1000);

  let parsed: any = {};
  try {
    parsed = JSON.parse(stdout);
  } catch {
    // If not strict JSON, attempt regex extraction for collector_id
  }

  const collectorId =
    parsed.collector_id ||
    parsed.collectorId ||
    parsed.id ||
    stdout.match(/c_[a-z0-9]+/i)?.[0];

  if (!collectorId) {
    throw new Error(`Failed to extract collector_id from Bright Data output: ${stdout}`);
  }

  return {
    collectorId,
    name: name || parsed.name || `collector-${Date.now()}`,
    url,
    status: parsed.status || 'created',
    rawOutput: parsed,
  };
}

/**
 * 2.1 — Run a Bright Data Scraper Collector
 * `bdata scraper run <collector_id> <url> --json`
 */
export async function runBrightDataCollector(
  collectorId: string,
  url: string,
  options?: { sync?: boolean; timeoutSeconds?: number }
): Promise<ScraperRunResult> {
  const syncFlag = options?.sync ? '--sync' : '';
  const timeout = options?.timeoutSeconds || 300;

  const cmdArgs = `scraper run ${collectorId} "${url}" ${syncFlag} --json --timeout ${timeout}`;

  const { stdout } = await execBrightDataCLI(cmdArgs, (timeout + 60) * 1000);

  let data: any = null;
  try {
    data = JSON.parse(stdout);
  } catch {
    data = stdout;
  }

  return {
    collectorId,
    url,
    status: 'SUCCESS',
    data,
    rawOutput: stdout,
  };
}

/**
 * 2.1 & 2.6 — Heal a Bright Data Scraper Collector
 * `bdata scraper heal <collector_id> "<whatBroke>" --auto-approve --auto-save --json`
 */
export async function healBrightDataCollector(
  options: CollectorHealOptions
): Promise<CollectorHealResult> {
  const { collectorId, whatBroke, targetUrl, autoApprove = true } = options;

  let cmdArgs = `scraper heal ${collectorId} "${whatBroke.replace(/"/g, '\\"')}" --json`;
  if (autoApprove) {
    cmdArgs += ' --auto-approve --auto-save';
  }
  if (targetUrl) {
    cmdArgs += ` --url "${targetUrl}"`;
  }

  const { stdout } = await execBrightDataCLI(cmdArgs, 600000);

  let parsed: any = {};
  try {
    parsed = JSON.parse(stdout);
  } catch {
    parsed = { text: stdout };
  }

  return {
    collectorId,
    status: parsed.status || 'HEALED',
    details: parsed.next_step || parsed.details || stdout,
    rawOutput: parsed,
  };
}
