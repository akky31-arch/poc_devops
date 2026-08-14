pipeline {
agent none
 
environment {
APP_NAME = 'poc-devops-app'
IMAGE_TAG = "${env.BUILD_NUMBER}"
AGENT_LABEL = 'docker'
 
CONTAINER_PORT = '3000'
 
DEV_PORT = '3001'
QA_PORT = '3002'
PROD_PORT = '3000'
 
DEV_CONTAINER = 'poc-devops-dev'
QA_CONTAINER = 'poc-devops-qa'
PROD_CONTAINER = 'poc-devops-prod'
}
 
stages {
 
stage('Clone') {
agent {
label "${AGENT_LABEL}"
}
 
steps {
checkout scm
 
stash(
name: 'source',
includes: '**',
excludes: '.git/**'
)
}
}
 
stage('Build') {
agent {
label "${AGENT_LABEL}"
}
 
steps {
unstash 'source'
 
sh '''
echo "Building Docker image..."
 
docker build \
-t ${APP_NAME}:${IMAGE_TAG} \
-t ${APP_NAME}:latest \
.
 
echo "Docker build completed."
'''
}
}
 
stage('Test') {
agent {
label "${AGENT_LABEL}"
}
 
steps {
unstash 'source'
 
sh '''
echo "Running application test..."
 
if [ -f package.json ]; then
npm install
node --check server.js
else
echo "package.json not found"
exit 1
fi
 
echo "Test completed successfully."
'''
}
}
 
stage('Deploy DEV') {
agent {
label "${AGENT_LABEL}"
}
 
steps {
sh '''
echo "Deploying to DEV..."
 
docker stop ${DEV_CONTAINER} || true
docker rm ${DEV_CONTAINER} || true
 
docker run -d \
--name ${DEV_CONTAINER} \
-p ${DEV_PORT}:${CONTAINER_PORT} \
-e APP_ENV=dev \
-e BUILD_NUMBER=${IMAGE_TAG} \
--restart unless-stopped \
${APP_NAME}:${IMAGE_TAG}
 
echo "DEV deployment completed."
'''
}
}
 
stage('DEV Validation') {
agent {
label "${AGENT_LABEL}"
}
 
steps {
sh '''
sleep 5
 
STATUS=$(docker inspect \
--format='{{.State.Status}}' \
${DEV_CONTAINER})
 
echo "DEV container status: ${STATUS}"
 
if [ "$STATUS" != "running" ]; then
echo "DEV deployment failed."
exit 1
fi
 
echo "DEV validation successful."
'''
}
}
 
stage('QA Approval') {
agent none
 
steps {
timeout(time: 30, unit: 'MINUTES') {
input(
message: 'DEV deployment successful. Approve deployment to QA?',
ok: 'Approve QA'
)
}
}
}
 
stage('Deploy QA') {
agent {
label "${AGENT_LABEL}"
}
 
steps {
sh '''
echo "Deploying to QA..."
 
docker stop ${QA_CONTAINER} || true
docker rm ${QA_CONTAINER} || true
 
docker run -d \
--name ${QA_CONTAINER} \
-p ${QA_PORT}:${CONTAINER_PORT} \
-e APP_ENV=qa \
-e BUILD_NUMBER=${IMAGE_TAG} \
--restart unless-stopped \
${APP_NAME}:${IMAGE_TAG}
 
echo "QA deployment completed."
'''
}
}
 
stage('QA Validation') {
agent {
label "${AGENT_LABEL}"
}
 
steps {
sh '''
sleep 5
 
STATUS=$(docker inspect \
--format='{{.State.Status}}' \
${QA_CONTAINER})
 
echo "QA container status: ${STATUS}"
 
if [ "$STATUS" != "running" ]; then
echo "QA deployment failed."
exit 1
fi
 
echo "QA validation successful."
'''
}
}
 
stage('PROD Approval') {
agent none
 
steps {
timeout(time: 30, unit: 'MINUTES') {
input(
message: 'QA deployment successful. Approve deployment to PROD?',
ok: 'Approve PROD'
)
}
}
}
 
stage('Deploy PROD') {
agent {
label "${AGENT_LABEL}"
}
 
steps {
sh '''
echo "Deploying to PROD..."
 
docker stop ${PROD_CONTAINER} || true
docker rm ${PROD_CONTAINER} || true
 
docker run -d \
--name ${PROD_CONTAINER} \
-p ${PROD_PORT}:${CONTAINER_PORT} \
-e APP_ENV=prod \
-e BUILD_NUMBER=${IMAGE_TAG} \
--restart unless-stopped \
${APP_NAME}:${IMAGE_TAG}
 
echo "PROD deployment completed."
'''
}
}
 
stage('PROD Validation') {
agent {
label "${AGENT_LABEL}"
}
 
steps {
sh '''
sleep 5
 
STATUS=$(docker inspect \
--format='{{.State.Status}}' \
${PROD_CONTAINER})
 
echo "PROD container status: ${STATUS}"
 
if [ "$STATUS" != "running" ]; then
echo "PROD deployment failed."
exit 1
fi
 
echo "PROD validation successful."
'''
}
}
}
 
post {
success {
echo "Pipeline completed successfully."
}
 
failure {
echo "Pipeline failed."
}
 
aborted {
echo "Pipeline was aborted."
}
}
}
