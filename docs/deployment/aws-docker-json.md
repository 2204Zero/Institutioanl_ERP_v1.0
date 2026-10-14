# EduPulse ERP — AWS Docker Deployment Guide (JSON-Only Persistence & Durable EBS Storage)

## 1. Overview & Architecture

This guide details the single-instance deployment of **EduPulse ERP** on Amazon Web Services (AWS) using an **Ubuntu Server LTS EC2 instance**, **Docker Engine**, and **durable EBS-backed host storage** running under the `dev-json` runtime profile.

### Architectural Decisions

| Component | Technology | Configuration / Deployment |
| :--- | :--- | :--- |
| **Backend** | Java 21 / Spring Boot 3.3.4 | Multi-stage Docker container (`edupulse-backend`), non-root user `edupulse` (UID: 1001, GID: 1001) |
| **Frontend** | React 18 + TypeScript + Vite | Deployed on Vercel / CloudFront; configured with `VITE_API_BASE_URL=https://api.yourdomain.com` |
| **Persistence** | Standalone JSON Storage | `dev-json` Spring profile; H2 in-memory cached operational database synchronized to atomic JSON files |
| **Host Storage** | AWS Elastic Block Store (EBS) | Dedicated gp3 EBS volume formatted as ext4, persistently mounted at `/mnt/edupulse-data` via UUID in `/etc/fstab` |
| **Container Mount** | Docker Bind Mount | `/mnt/edupulse-data` (host) mounted to `/var/lib/edupulse/data` (container) |
| **Uploaded Files** | Local Durable Directory | `/var/lib/edupulse/data/uploads` stores profile photos, Aadhaar, marksheets, and applicant documents |
| **Reverse Proxy** | Nginx + Let's Encrypt | Reverse proxy terminating TLS, forwarding to `127.0.0.1:8081`, handling CORS for Vercel |
| **External DBs** | None | PostgreSQL, MySQL, SQLite, Redis, RabbitMQ, and MinIO are **not** required and **not** started |

```
                       +-----------------------------------+
                       |    Vercel / Static Web Hosting    |
                       |       (EduPulse Frontend-v2)      |
                       +-----------------+-----------------+
                                         |
                                HTTPS API Requests
                                (CORS preflighted)
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| AWS EC2 Instance (Ubuntu 22.04 / 24.04 LTS)                                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Nginx Reverse Proxy (Port 80/443 with TLS Certbot)                          |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        | proxy_pass http://127.0.0.1:8081        |
|                                        v                                          |
|  +-----------------------------------------------------------------------------+  |
|  | Docker Container: edupulse-backend (UID 1001:1001, dev-json profile)        |  |
|  |                                                                             |  |
|  | Container Storage Mount: /var/lib/edupulse/data                             |  |
|  |   - JSON Datasets: users.json, students.json, attendance.json, etc.         |  |
|  |   - Uploaded Documents: uploads/students/, uploads/applicants/              |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        | Bind Mount                               |
|                                        v                                          |
|  +-----------------------------------------------------------------------------+  |
|  | Host Persistent Mount: /mnt/edupulse-data (chown 1001:1001, chmod 750)      |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         | Attached Block Device
                                         v
               +---------------------------------------------------+
               |  AWS Dedicated EBS Volume (gp3, ext4, fstab UUID) |
               +---------------------------------------------------+
```

---

## 2. Server Sizing & Prerequisites

### 2.1 EC2 Instance Requirements
- **AMI:** Ubuntu Server 22.04 LTS or 24.04 LTS (x86_64 architecture).
- **Instance Type:** `t3.medium` minimum (2 vCPU, 4 GiB RAM) or `t3.large` recommended (2 vCPU, 8 GiB RAM).
- **Root Volume:** 20 GiB gp3 for OS, Docker Engine, and system logs.
- **Dedicated EBS Data Volume:** 20 GiB gp3 minimum for EduPulse JSON datasets, backups, and user uploads.

### 2.2 AWS Security Group Configuration
Configure inbound rules on the EC2 security group:

| Type | Port Range | Source | Justification |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | Authorized Admin IP only (`x.x.x.x/32`) | Server management |
| **HTTP** | `80` | `0.0.0.0/0` | HTTP traffic and Let's Encrypt ACME challenge |
| **HTTPS** | `443` | `0.0.0.0/0` | Secure API traffic for Frontend and mobile clients |

> [!WARNING]
> Do NOT open backend port `8081`, Docker daemon ports, or database ports (`5432`, `6379`, `5672`, `9000`) to the public internet. All traffic must terminate at Nginx.

---

## 3. Host System Setup & Docker Installation

Connect to the Ubuntu EC2 instance via SSH:
```bash
ssh -i /path/to/key.pem ubuntu@<ec2-public-ip>
```

Update system packages and install prerequisites:
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release
```

Install Docker Engine and Docker Compose plugin using the official Docker Ubuntu repository:
```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker packages
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add ubuntu user to docker group (optional, requires re-login)
sudo usermod -aG docker ubuntu
```

Verify Docker installation:
```bash
docker --version
docker compose version
```

---

## 4. EBS Volume Formatting & Persistent Mount

### 4.1 Identify the Attached EBS Volume
List block devices to identify the newly attached data volume:
```bash
lsblk
```
*Example output:*
```
NAME         MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
nvme0n1      259:0    0   20G  0 disk 
├─nvme0n1p1  259:1    0 19.9G  0 part /
nvme1n1      259:2    0   20G  0 disk 
```
In this example, `/dev/nvme1n1` is the 20 GiB unpartitioned volume.

### 4.2 Check Existing Filesystem Before Formatting
> [!CAUTION]
> Never run `mkfs` on a volume that already contains data. Always verify first:
```bash
sudo file -s /dev/nvme1n1
```
- If the output contains `data` (no filesystem), format the volume:
  ```bash
  sudo mkfs -t ext4 /dev/nvme1n1
  ```
- If the output displays an existing `ext4 filesystem data`, **skip formatting** to prevent data loss.

### 4.3 Configure Persistent Mount via `/etc/fstab`
Create the mount directory:
```bash
sudo mkdir -p /mnt/edupulse-data
```

Find the filesystem UUID:
```bash
sudo blkid /dev/nvme1n1
```
*Example output:*
```
/dev/nvme1n1: UUID="9f5a7c2e-4b3d-4c81-a9f7-123456789abc" BLOCK_SIZE="4096" TYPE="ext4"
```

Add the persistent mount line to `/etc/fstab` using `nofail` (so the system boots even if the EBS volume is temporarily detached):
```bash
echo "UUID=9f5a7c2e-4b3d-4c81-a9f7-123456789abc /mnt/edupulse-data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

Test and activate the mount:
```bash
sudo mount -a
df -h /mnt/edupulse-data
```

### 4.4 Set Container Non-Root Permissions
The EduPulse backend container runs as non-root user `edupulse` with UID `1001` and GID `1001`. Grant ownership to this UID:
```bash
sudo chown -R 1001:1001 /mnt/edupulse-data
sudo chmod 750 /mnt/edupulse-data
```
> [!IMPORTANT]
> Do NOT use `chmod 777`. Giving ownership to UID `1001:1001` with `750` ensures that only the backend process and root can access the persisted data files and uploaded personal documents.

---

## 5. Application Deployment Preparation

### 5.1 Clone Repository or Transfer Code
Clone the repository into `/opt/edupulse`:
```bash
sudo mkdir -p /opt/edupulse
sudo chown -R ubuntu:ubuntu /opt/edupulse
cd /opt/edupulse
git clone <your-repository-url> .
```

### 5.2 Configure Environment Variables
Copy `.env.aws-json.example` to `.env.aws-json`:
```bash
cp .env.aws-json.example .env.aws-json
chmod 600 .env.aws-json
```

Edit `.env.aws-json` using `nano` or `vim`:
```bash
nano .env.aws-json
```

Ensure the following variables are configured:
```properties
# Active Spring Profile (MANDATORY: dev-json)
SPRING_PROFILES_ACTIVE=dev-json

# Port Configuration
BACKEND_PORT=8081

# Host Storage Directory (matches the EBS mount)
EDUPULSE_DATA_HOST_PATH=/mnt/edupulse-data

# Container Durable Storage Root
ERP_DEVJSON_STORAGE_DIR=/var/lib/edupulse/data

# Durable Uploads Root
APP_STORAGE_DOCUMENT_DIR=/var/lib/edupulse/data/uploads

# Disable Test Fixture Seeding on Production Volumes
ERP_DEVJSON_SEED_FIXTURES=false

# Production Security Secrets (Replace with high-entropy keys)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_for_hs256!
JWT_ACCESS_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# CORS Allowed Origins (e.g., your Vercel frontend domain)
CORS_ALLOWED_ORIGINS=https://edupulse-frontend.vercel.app,https://yourdomain.com

# Initial Superadmin Configuration (used only on first startup if users.json is empty)
BOOTSTRAP_SUPERADMIN_ENABLED=true
BOOTSTRAP_SUPERADMIN_USERNAME=superadmin
BOOTSTRAP_SUPERADMIN_EMAIL=admin@yourdomain.com
BOOTSTRAP_SUPERADMIN_PASSWORD=ReplaceWithStrongPassword123!
```

---

## 6. Starting the Backend Container

Start the application using Docker Compose with the dedicated AWS Compose file:
```bash
docker compose --env-file .env.aws-json -f docker-compose.aws-json.yml up -d --build
```

### 6.1 Inspect Startup Logs
Monitor the backend startup logs:
```bash
docker compose --env-file .env.aws-json -f docker-compose.aws-json.yml logs -f edupulse-backend
```

Look for confirmation messages in the logs:
1. `Storage directory verified and ready at: /var/lib/edupulse/data`
2. `Active profiles: dev-json`
3. `DevJsonDataHydrator: Hydrating database from JSON datasets...`
4. `DevJsonSyncEngine: Synchronizer registered and active.`
5. `Started InstitutionalErpApplication in ... seconds`

### 6.2 Verify Health Endpoint
Query the health check endpoint from the host:
```bash
curl -s http://localhost:8081/api/health | jq .
```
Expected response:
```json
{
  "status": "UP",
  "timestamp": "2026-10-14T08:15:00.123456789Z",
  "storage": {
    "mode": "dev-json",
    "path": "/var/lib/edupulse/data",
    "exists": true,
    "writable": true
  }
}
```

---

## 7. Reverse Proxy & HTTPS Configuration (Nginx + Let's Encrypt)

### 7.1 Install Nginx
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 7.2 Configure Nginx Virtual Host
Create `/etc/nginx/sites-available/edupulse-api`:
```bash
sudo nano /etc/nginx/sites-available/edupulse-api
```

Add the reverse-proxy configuration:
```nginx
server {
    server_name api.yourdomain.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts for document uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the site and verify syntax:
```bash
sudo ln -s /etc/nginx/sites-available/edupulse-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 7.3 Obtain SSL Certificate via Certbot
```bash
sudo certbot --nginx -d api.yourdomain.com --non-interactive --agree-tos -m admin@yourdomain.com
```

Certbot automatically schedules automatic certificate renewal via systemd timer (`systemctl status certbot.timer`).

---

## 8. Frontend Integration (Vercel)

When deploying `frontend-v2` on Vercel:
1. In the Vercel Project Settings, add the Environment Variable:
   - `VITE_API_BASE_URL` = `https://api.yourdomain.com`
2. In `.env.aws-json` on the EC2 host, verify that `CORS_ALLOWED_ORIGINS` includes your Vercel deployment URL:
   - `CORS_ALLOWED_ORIGINS=https://edupulse.vercel.app,https://yourdomain.com`
3. Reload or restart the backend container if the CORS origins are modified:
   ```bash
   docker compose --env-file .env.aws-json -f docker-compose.aws-json.yml restart edupulse-backend
   ```

---

## 9. Backup & Restore Procedures

### 9.1 Backup Architecture
The persistent directory `/mnt/edupulse-data` contains all application state:
- Domain JSON files: `users.json`, `students.json`, `admissions.json`, `attendance.json`, `student_fees.json`, `fee_payments.json`, `applicant_documents.json`, `student_documents.json`, etc.
- Uploaded binary documents and photos: `uploads/students/` and `uploads/applicants/`.

### 9.2 Automated EBS Snapshot Backup (Recommended)
1. In AWS EC2 Console, navigate to **Elastic Block Store > Volumes**.
2. Select the volume attached at `/mnt/edupulse-data`.
3. Use **Amazon Data Lifecycle Manager (DLM)** to create a snapshot lifecycle policy (e.g., daily snapshot retained for 30 days).

### 9.3 Host-Level Archive Backup Script
Create a backup script `/opt/edupulse/scripts/backup-edupulse.sh`:
```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/mnt/edupulse-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="edupulse_backup_${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

# Create consistent archive
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" -C /mnt/edupulse-data .

# Keep only last 14 days of backups
find "${BACKUP_DIR}" -name "edupulse_backup_*.tar.gz" -mtime +14 -delete

echo "Backup completed successfully: ${BACKUP_DIR}/${ARCHIVE_NAME}"
```

Make executable and configure in crontab:
```bash
chmod +x /opt/edupulse/scripts/backup-edupulse.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/edupulse/scripts/backup-edupulse.sh >> /var/log/edupulse-backup.log 2>&1") | crontab -
```

### 9.4 Controlled Restore Procedure
To restore from a backup archive:
1. Stop the EduPulse backend container:
   ```bash
   docker compose --env-file .env.aws-json -f docker-compose.aws-json.yml stop
   ```
2. Archive the current directory state as a safety measure:
   ```bash
   sudo tar -czf "/tmp/pre_restore_safety_$(date +%s).tar.gz" -C /mnt/edupulse-data .
   ```
3. Extract the backup archive into `/mnt/edupulse-data`:
   ```bash
   sudo rm -rf /mnt/edupulse-data/*
   sudo tar -xzf /mnt/edupulse-backups/edupulse_backup_YYYYMMDD_HHMMSS.tar.gz -C /mnt/edupulse-data
   ```
4. Restore proper ownership and permissions:
   ```bash
   sudo chown -R 1001:1001 /mnt/edupulse-data
   sudo chmod 750 /mnt/edupulse-data
   ```
5. Start the backend container:
   ```bash
   docker compose --env-file .env.aws-json -f docker-compose.aws-json.yml start
   ```
6. Verify logs and health endpoint:
   ```bash
   docker compose --env-file .env.aws-json -f docker-compose.aws-json.yml logs -f edupulse-backend
   curl -s http://localhost:8081/api/health
   ```

---

## 10. Container Replacement & System Reboot Recovery

### 10.1 Safe Image Upgrades
When deploying a new version of the codebase:
```bash
cd /opt/edupulse
git pull origin develop

# Rebuild image and recreate container seamlessly
docker compose --env-file .env.aws-json -f docker-compose.aws-json.yml up -d --build --force-recreate
```
Because all records and uploads reside in `/mnt/edupulse-data` on the host, the new container hydrates from the existing data without duplicate record creation or loss of files.

### 10.2 System Reboot Recovery
The `docker-compose.aws-json.yml` file specifies `restart: unless-stopped`.
When the Ubuntu EC2 instance reboots:
1. Systemd automatically mounts `/mnt/edupulse-data` via `/etc/fstab`.
2. Docker Engine starts and restarts `edupulse-backend`.
3. If `/mnt/edupulse-data` is missing or unmounted, the application's fail-fast check aborts startup with exit code `1`, preventing accidental creation of an empty dataset.

---

## 11. Concurrency, Scaling & Architecture Limitations

> [!IMPORTANT]
> **Single-Instance Restriction**:
> The `dev-json` persistence layer uses local JVM `ReentrantLock` and atomic file renames for synchronization.
> - **Only one container instance** may be connected to a given persistent JSON directory at any time.
> - **Do not scale horizontally** with `docker compose up --scale edupulse-backend=2`. Multiple instances concurrently writing to the same JSON directory will cause race conditions and data corruption.
> - Vertical scaling (increasing EC2 instance size to `t3.xlarge` or `c6i.xlarge`) is fully supported.
