# Jenkins Multi-Agent POC

Sample Node.js app + declarative Jenkins pipeline:

1. Clone
2. Build (Docker image)
3. Deploy to prod with **manual approval**

## What you need on Azure

| VM | Role |
|---|---|
| VM1 | Jenkins controller |
| VM2 | Jenkins agent, label `azure-agent`, Docker installed |

On the **agent VM**:

```bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker jenkins
```

(Use the same OS user that the Jenkins agent runs as. Restart the agent after `usermod`.)

In Jenkins: **Manage Jenkins → Nodes → your agent → Labels** = `azure-agent`

## GitHub

Push this folder to a GitHub repo, then in Jenkins:

1. New Item → Pipeline
2. Pipeline → Definition: **Pipeline script from SCM**
3. SCM: Git, your repo URL
4. Script Path: `Jenkinsfile`

First build will clone, build the image, then **wait**. Open the build, click **Deploy** on the approval form, then the container starts on the agent VM.

App URL: `http://<agent-vm-public-ip>/`

Health check: `http://<agent-vm-public-ip>/health`

## Local test (optional)

```bash
docker build -t poc-devops-app:local .
docker run --rm -p 3000:3000 poc-devops-app:local
```

Open http://localhost:3000
