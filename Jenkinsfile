pipeline {
 
    agent none
 
    environment {
        APP_NAME    = 'poc-devops-app'
        IMAGE_TAG   = "${env.BUILD_NUMBER}"
        AGENT_LABEL = 'docker'
 
        // Application port inside the container
        CONTAINER_PORT = '3000'
 
        // Host ports for the three environments
        DEV_PORT  = '3001'
        QA_PORT   = '3002'
        PROD_PORT = '3000'
 
        // Docker container names
        DEV_CONTAINER  = 'poc-devops-dev'
        QA_CONTAINER   = 'poc-devops-qa'
        PROD_CONTAINER = 'poc-devops-prod'
    }
 
    stages {
 
        /*
         * ==========================================
         * 1. CLONE
         * ==========================================
         */
        stage('Clone') {
 
            agent {
                label "${AGENT_LABEL}"
            }
 
            steps {
 
                echo 'Checking out source code from GitHub...'
 
                checkout scm
 
                stash(
                    name: 'source',
                    includes: '**',
                    excludes: '.git/**'
                )
 
                echo 'Source code checkout completed.'
            }
        }
 
 
        /*
         * ==========================================
         * 2. BUILD DOCKER IMAGE
         * ==========================================
         */
        stage('Build') {
 
            agent {
                label "${AGENT_LABEL}"
            }
 
            steps {
 
                unstash 'source'
 
                echo "Building Docker image: ${APP_NAME}:${IMAGE_TAG}"
 
                sh '''
                    docker build \
                        -t ${APP_NAME}:${IMAGE_TAG} \
                        -t ${APP_NAME}:latest \
                        .
                '''
 
                echo 'Docker image build completed.'
 
                sh '''
                    docker images | grep ${APP_NAME}
                '''
            }
        }
 
 
        /*
         * ==========================================
         * 3. TEST
         * ==========================================
         */
        stage('Test') {
 
            agent {
                label "${AGENT_LABEL}"
            }
 
            steps {
 
                unstash 'source'
 
                echo 'Running application tests...'
 
                sh '''
                    if [ -f package.json ]; then
 
                        echo "Node.js application detected."
 
                        node --version
                        npm --version
 
                        if grep -q '"test"' package.json; then
 
                            echo "Running npm test..."
 
                            npm ci
                            npm test
 
                        else
 
                            echo "No test script found."
                            echo "Running JavaScript syntax validation..."
 
                            node --check server.js
 
                        fi
 
                    else
 
                        echo "package.json not found."
                        echo "Skipping Node.js tests."
 
                    fi
                '''
 
                echo 'Test stage completed.'
            }
        }
 
 
        /*
         * ==========================================
         * 4. DEPLOY TO DEV
         * ==========================================
         */
        stage('Deploy to DEV') {
 
            agent {
                label "${AGENT_LABEL}"
            }
 
            steps {
 
                echo "Deploying ${APP_NAME}:${IMAGE_TAG} to DEV..."
 
                sh '''
                    echo "Stopping existing DEV container..."
 
                    docker stop ${DEV_CONTAINER} || true
 
                    echo "Removing existing DEV container..."
 
                    docker rm ${DEV_CONTAINER} || true
 
 
                    echo "Starting new DEV container..."
 
                    docker run -d \
                        --name ${DEV_CONTAINER} \
                        -p ${DEV_PORT}:${CONTAINER_PORT} \
                        -e APP_ENV=dev \
                        -e BUILD_NUMBER=${IMAGE_TAG} \
                        --restart unless-stopped \
                        ${APP_NAME}:${IMAGE_TAG}
 
 
                    echo "DEV deployment completed."
 
                    docker ps --filter "name=${DEV_CONTAINER}"
                '''
            }
        }
 
 
        /*
         * ==========================================
         * 5. DEV VALIDATION
         * ==========================================
         */
        stage('DEV Validation') {
 
            agent {
                label "${AGENT_LABEL}"
            }
 
            steps {
 
                echo 'Validating DEV deployment...'
 
                sh '''
                    sleep 5
 
                    echo "Checking DEV container status..."
 
                    STATUS=$(docker inspect \
                        --format='{{.State.Status}}' \
                        ${DEV_CONTAINER})
 
                    echo "DEV container status: ${STATUS}"
 
                    if [ "$STATUS" != "running" ]; then
                        echo "DEV deployment validation failed."
                        exit 1
                    fi
 
                    echo "DEV deployment validation successful."
                '''
            }
        }
 
 
        /*
         * ==========================================
         * 6. QA APPROVAL GATE
         * ==========================================
         */
        stage('QA Approval Gateway') {
 
            agent none
 
            steps {
 
                script {
 
                    timeout(
                        time: 30,
                        unit: 'MINUTES'
                    ) {
 
                        input(
                            message: 'DEV deployment successful. Approve deployment to QA?',
                            ok: 'Approve QA'
                        )
                    }
                }
            }
        }
 
 
        /*
         * ==========================================
         * 7. DEPLOY TO QA
         * ==========================================
         */
        stage('Deploy to QA') {
 
            agent {
                label "${AGENT_LABEL}"
            }
 
            steps {
 
                echo "Deploying ${APP_NAME}:${IMAGE_TAG} to QA..."
 
                sh '''
                    echo "Stopping existing QA container..."
 
                    docker stop ${QA_CONTAINER} || true
 
                    echo "Removing existing QA container..."
 
                    docker rm ${QA_CONTAINER} || true
 
 
                    echo "Starting new QA container..."
 
                    docker run -d \
                        --name ${QA_CONTAINER} \
                        -p ${QA_PORT}:${CONTAINER_PORT} \
                        -e APP_ENV=qa \
                        -e BUILD_NUMBER=${IMAGE_TAG} \
                        --restart unless-stopped \
                        ${APP_NAME}:${IMAGE_TAG}
 
 
                    echo "QA deployment completed."
 
                    docker ps --filter "name=${QA_CONTAINER}"
                '''
            }
        }
 
 
        /*
         * ==========================================
         * 8. QA VALIDATION
         * ==========================================
         */
        stage('QA Validation') {
 
            agent {
                label "${AGENT_LABEL}"
            }
 
            steps {
 
                echo 'Validating QA deployment...'
 
                sh '''
                    sleep 5
 
                    echo "Checking QA container status..."
 
                    STATUS=$(docker inspect \
                        --format='{{.State.Status}}' \
                        ${QA_CONTAINER})
 
                    echo "QA container status: ${STATUS}"
 
                    if [ "$STATUS" != "running" ]; then
                        echo "QA deployment validation failed."
                        exit 1
                    fi
 
                    echo "QA deployment validation successful."
                '''
            }
        }
 
 
        /*
         * ==========================================
         * 9. PROD APPROVAL GATE
         * ==========================================
         */
        stage('PROD Approval Gateway') {
 
            agent none
 
            steps {
 
                script {
 
                    timeout(
                        time: 30,
                        unit: 'MINUTES'
                    ) {
 
                        input(
                            message: 'QA deployment successful. Approve deployment to PROD?',
                            ok: 'Approve PROD'
                        )
                    }
                }
            }
        }
 
 
        /*
         * ==========================================
         * 10. DEPLOY TO PROD
         * ==========================================
         */
        stage('Deploy to PROD') {
 
            agent {
                label "${AGENT_LABEL}"
            }
 
            steps {
 
                echo "Deploying ${APP_NAME}:${IMAGE_TAG} to PROD..."
 
                sh '''
                    echo "Stopping existing PROD container..."
 
                    docker stop ${PROD_CONTAINER} || true
 
                    echo "Removing existing PROD container..."
 
                    docker rm ${PROD_CONTAINER} || true
 
 
                    echo "Starting new PROD container..."
 
                    docker run -d \
                        --name ${PROD_CONTAINER} \
                        -p ${PROD_PORT}:${CONTAINER_PORT} \
                        -e APP_ENV=prod \
                        -e BUILD_NUMBER=${IMAGE_TAG} \
                        --restart unless-stopped \
                        ${APP_NAME}:${IMAGE_TAG}
 
 
                    echo "PROD deployment completed."
 
                    docker ps --filter "name=${PROD_CONTAINER}"
                '''
            }
        }
 
 
        /*
         * ==========================================
         * 11. PROD VALIDATION
         * ==========================================
         */
        stage('PROD Validation') {
 
            agent {
                label "${AGENT_LABEL}"
            }
 
            steps {
 
                echo 'Validating PROD deployment...'
 
                sh '''
                    sleep 5
 
                    echo "Checking PROD container status..."
 
                    STATUS=$(docker inspect \
                        --format='{{.State.Status}}' \
                        ${PROD_CONTAINER})
 
                    echo "PROD container status: ${STATUS}"
 
                    if [ "$STATUS" != "running" ]; then
                        echo "PROD deployment validation failed."
                        exit 1
                    fi
 
                    echo "PROD deployment validation successful."
                '''
            }
        }
    }
 
 
    /*
     * ==========================================
     * POST ACTIONS
     * ==========================================
     */
 
    post {
 
        success {
 
            echo """
            ==========================================
            PIPELINE SUCCESSFUL
            ==========================================
 
          
