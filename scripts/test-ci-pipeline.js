#!/usr/bin/env node

/**
 * NexusCRM Enterprise CI/CD Pipeline Local Test Harness
 * Simulates and verifies the full GitHub Actions CI pipeline execution end-to-end.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT_DIR = process.cwd();
const STAGES = [];

function logSection(title) {
  console.log('\n' + '='.repeat(68));
  console.log(` 🚀 CI GATE: ${title}`);
  console.log('='.repeat(68));
}

function runStage(name, fn) {
  const start = Date.now();
  process.stdout.write(`⏳ Running [${name}]... `);
  try {
    fn();
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✅ PASSED (${duration}s)`);
    STAGES.push({ name, status: 'PASSED', duration: `${duration}s` });
  } catch (error) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`❌ FAILED (${duration}s)`);
    console.error(`\nError details in ${name}:\n`, error.message || error);
    STAGES.push({ name, status: 'FAILED', duration: `${duration}s`, error: error.message });
    printReportAndExit(1);
  }
}

function exec(cmd) {
  return execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe', encoding: 'utf-8' });
}

function printReportAndExit(code = 0) {
  console.log('\n' + '='.repeat(68));
  console.log(' 📊 NEXUSCRM CI PIPELINE EXECUTION SUMMARY');
  console.log('='.repeat(68));
  console.table(STAGES);
  const allPassed = STAGES.every(s => s.status === 'PASSED');
  if (allPassed && code === 0) {
    console.log('\n🎉 ALL CI PIPELINE GATES PASSED! Ready for GitHub Actions & AWS Windows Server deployment.\n');
    process.exit(0);
  } else {
    console.error('\n⚠️ CI Pipeline failed one or more validation gates. Review error output above.\n');
    process.exit(1);
  }
}

// ────────────────────────────────────────────────────────────
// MAIN CI EXECUTION RUNNER
// ────────────────────────────────────────────────────────────
console.log('='.repeat(68));
console.log(' [Senior DevOps Engineer] NexusCRM GitHub Actions CI Local Simulation');
console.log(' Target Platform: Windows Server (AWS EC2) | Runtime: Node + Python');
console.log('='.repeat(68));

// Gate 1: Workflow YAML Schema & Syntax
runStage('1. GitHub Actions Workflow Syntax & Integrity', () => {
  const ciPath = path.join(ROOT_DIR, '.github/workflows/ci.yml');
  const cdPath = path.join(ROOT_DIR, '.github/workflows/cd-deploy-windows.yml');

  if (!fs.existsSync(ciPath)) throw new Error('Missing .github/workflows/ci.yml');
  if (!fs.existsSync(cdPath)) throw new Error('Missing .github/workflows/cd-deploy-windows.yml');

  // Validate YAML parsing via Python PyYAML
  exec(`python3 -c "import yaml; yaml.safe_load(open('${ciPath}')); yaml.safe_load(open('${cdPath}'))"`);
  
  // Verify critical workflow components
  const ciContent = fs.readFileSync(ciPath, 'utf8');
  if (!ciContent.includes('actions/checkout@v4')) throw new Error('Missing actions/checkout@v4 in ci.yml');
  if (!ciContent.includes('actions/upload-artifact@v4')) throw new Error('Missing actions/upload-artifact@v4 in ci.yml');
  if (!ciContent.includes('build-and-package')) throw new Error('Missing build-and-package job in ci.yml');
});

// Gate 2: Code Quality & Linting
runStage('2. Oxlint Frontend Code Quality Check', () => {
  exec('npm run lint');
});

// Gate 3: Python Backend Syntax & Compilation
runStage('3. Python Backend Compilation Check', () => {
  exec('python3 -m py_compile backend/main.py backend/database.py backend/models.py');
  exec('python3 -c "import compileall; compileall.compile_dir(\'backend\', force=True, quiet=1)"');
});

// Gate 4: Frontend Unit & Copilot Tests
runStage('4. Frontend Unit & Copilot Test Suite', () => {
  const output = exec('npm test');
  if (!output.includes('Total: 44 | Passed: 44 | Failed: 0')) {
    throw new Error('Test suite did not achieve 44/44 pass count.');
  }
});

// Gate 5: Backend API Endpoint & Unit Tests
runStage('5. Backend FastAPI Endpoints & Unit Tests', () => {
  exec('python3 -m unittest discover backend/tests');
});

// Gate 6: Production Build & Asset Optimization
runStage('6. Vite Production Build', () => {
  exec('npm run build');
  const distPath = path.join(ROOT_DIR, 'dist');
  if (!fs.existsSync(path.join(distPath, 'index.html'))) throw new Error('dist/index.html was not generated');
  if (!fs.existsSync(path.join(distPath, 'web.config'))) {
    fs.copyFileSync(path.join(ROOT_DIR, 'public/web.config'), path.join(distPath, 'web.config'));
  }
});

// Gate 7: Windows Server Config & IIS Web.Config Validation
runStage('7. IIS Web.Config & PowerShell Script Verification', () => {
  const webConfig = path.join(ROOT_DIR, 'dist/web.config');
  if (!fs.existsSync(webConfig)) throw new Error('dist/web.config missing');
  const content = fs.readFileSync(webConfig, 'utf8');
  if (!content.includes('ReverseProxyToBackend') || !content.includes('React SPA Routes')) {
    throw new Error('web.config missing required URL rewrite or reverse proxy rules');
  }

  const scripts = ['setup-windows-server.ps1', 'deploy.ps1', 'rollback.ps1'];
  for (const s of scripts) {
    const p = path.join(ROOT_DIR, 'scripts', s);
    if (!fs.existsSync(p)) throw new Error(`Missing deployment script: scripts/${s}`);
  }
});

// Gate 8: Release Artifact Packaging & Checksum Generation
runStage('8. Release Artifact Packaging & SHA-256 Checksum', () => {
  const stagingDir = path.join(ROOT_DIR, 'test_packaging_staging');
  if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true });
  fs.mkdirSync(stagingDir, { recursive: true });

  const dummyZip = path.join(stagingDir, 'test-release.zip');
  exec(`zip -r "${dummyZip}" dist backend scripts public/web.config -x "*.pyc" -x "*__pycache__*"`);

  if (!fs.existsSync(dummyZip)) throw new Error('Failed to generate release zip archive');
  const buffer = fs.readFileSync(dummyZip);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  if (!hash || hash.length !== 64) throw new Error('Invalid SHA256 checksum generated');

  // Clean staging
  fs.rmSync(stagingDir, { recursive: true, force: true });
});

printReportAndExit(0);
