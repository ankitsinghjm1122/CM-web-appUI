# Enterprise CI/CD Pipeline Architecture for AWS Windows Server

This document outlines the architecture, setup instructions, and operational runbooks for the automated CI/CD pipeline targeting an **AWS EC2 Windows Server** (running Windows Server 2019/2022 Datacenter).

---

## 🏗️ 1. Pipeline Architecture Overview

```mermaid
flowchart TD
    subgraph Developer Workflow
        A[Git Push / Pull Request to main] --> B[GitHub Repository]
    end

    subgraph GitHub Actions CI Pipeline (.github/workflows/ci.yml)
        B --> C[Gate 1: Lint & Security Audit]
        C --> D1[Gate 2: Frontend Unit Tests]
        C --> D2[Gate 3: Backend FastAPI Tests]
        D1 & D2 --> E[Gate 4: Vite Production Build]
        E --> F[Gate 5: Package Release Zip & SHA-256 Checksum]
        F --> G[Upload Artifact to GitHub Actions]
    end

    subgraph GitHub Actions CD Pipeline (.github/workflows/cd-deploy-windows.yml)
        G --> H{CI Succeeded?}
        H -- Yes --> I[Stage Release Zip to AWS S3 Bucket]
        I --> J[Trigger AWS Systems Manager SSM Run Command]
    end

    subgraph AWS EC2 Windows Server
        J --> K[Execute scripts/deploy.ps1 in PowerShell]
        K --> L[Step 1: Backup current production state]
        L --> M[Step 2: Atomic deployment of dist/ to IIS C:\apps\nexuscrm\frontend]
        M --> N[Step 3: Update Python virtualenv & backend dependencies]
        N --> O[Step 4: Restart Windows Service NexusCrmBackend via NSSM]
        O --> P[Step 5: Health Check http://localhost:8001/api/health]
        P -- Fail --> Q[Automatic Emergency Rollback via scripts/rollback.ps1]
        P -- Pass --> R[Deployment Complete: Live on Port 80/443]
    end
```

---

## 📁 2. Pipeline File Manifest

| File Path | Description |
|:---|:---|
| [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml) | Continuous Integration workflow: Multi-gate validation, linting, frontend & backend tests, production build, and artifact packaging. |
| [`.github/workflows/cd-deploy-windows.yml`](file:///.github/workflows/cd-deploy-windows.yml) | Continuous Deployment workflow: Automates deployment to AWS EC2 Windows Server via AWS SSM & S3. |
| [`scripts/setup-windows-server.ps1`](file:///scripts/setup-windows-server.ps1) | One-time provisioning script for AWS Windows Server (installs IIS, URL Rewrite, ARR, Python, NSSM, firewall). |
| [`scripts/deploy.ps1`](file:///scripts/deploy.ps1) | Idempotent deployment script: Pre-flight checks, backup, atomic deployment, service restart, and health probes. |
| [`scripts/rollback.ps1`](file:///scripts/rollback.ps1) | Automated rollback script triggered automatically if post-deployment health check fails. |
| [`scripts/test-ci-pipeline.js`](file:///scripts/test-ci-pipeline.js) | Local test harness that tests all 8 CI gates locally before pushing to GitHub. |
| [`public/web.config`](file:///public/web.config) | IIS configuration for Single Page Application (SPA) routing, security headers, and `/api/*` reverse proxy. |

---

## 🔑 3. GitHub Secrets Configuration

Add the following secrets to your GitHub repository under **Settings → Secrets and variables → Actions**:

| Secret Name | Description | Example / Recommended Value |
|:---|:---|:---|
| `AWS_ACCESS_KEY_ID` | AWS IAM User access key with SSM & S3 permissions | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM User secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS Region where your EC2 instance is hosted | `us-east-1` or `ap-south-1` |
| `AWS_DEPLOY_BUCKET` | S3 bucket name used for staging deployment artifacts | `nexuscrm-deploy-artifacts` |
| `AWS_EC2_WINDOWS_INSTANCE_ID` | EC2 Instance ID of your Windows Server | `i-0123456789abcdef0` |
| `AWS_WINDOWS_SERVER_HOST` | Public IP or DNS domain name of the Windows Server | `ec2-xx-xx-xx-xx.compute-1.amazonaws.com` |

---

## 🖥️ 4. One-Time Setup on AWS Windows Server

1. Connect to your Windows Server via **RDP** or **AWS EC2 Instance Connect**.
2. Open PowerShell as **Administrator**.
3. Copy or clone the repository to `C:\apps\nexuscrm` or download [`scripts/setup-windows-server.ps1`](file:///scripts/setup-windows-server.ps1).
4. Run the automated provisioning script:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   powershell -File C:\apps\nexuscrm\scripts\setup-windows-server.ps1
   ```
5. Ensure the AWS Systems Manager Agent (SSM Agent) is running (pre-installed by default on AWS Windows AMIs):
   ```powershell
   Get-Service -Name AmazonSSMAgent
   ```

---

## 🧪 5. Testing the CI Pipeline Locally

You can test the entire CI pipeline on your local development machine at any time by running:

```bash
npm run test:ci
```

This validates all 8 CI gates:
1. **GitHub Actions Workflow Syntax & Integrity:** Validates YAML schemas.
2. **Frontend Linter:** Oxlint syntax & import analysis.
3. **Backend Compilation:** Python bytecode compilation check.
4. **Frontend Unit Tests:** Copilot & state management test suite (44 test queries).
5. **Backend API Tests:** Python unittest suite verifying FastAPI `/api/health`, `/api/customers`, and `/api/analytics/metrics`.
6. **Vite Production Build:** Compiles optimized static assets.
7. **IIS Web.Config Verification:** Confirms SPA rewrite rules.
8. **Artifact Packaging & Checksum:** Packages zip and verifies SHA-256 generation.
