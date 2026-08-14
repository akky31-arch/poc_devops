pipeline {
    agent none

    environment {
        APP_NAME         = 'poc-devops-app'
        IMAGE_TAG        = "${env.BUILD_NUMBER}"
        AGENT_LABEL      = 'docker'
        APP_PORT         = '3000'
        CONTAINER_PORT   = '3000'
    }

    stages {
        stage('Clone') {
            agent { label "${AGENT_LABEL}" }
            steps {
                checkout scm
                stash name: 'source', includes: '**', excludes: '.git/**'
            }
        }

        stage('Build') {
            agent { label "${AGENT_LABEL}" }
            steps {
                unstash 'source'
                sh '''
                    docker build -t ${APP_NAME}:${IMAGE_TAG} -t ${APP_NAME}:latest .
                '''
            }
        }
        
        stage('Test') {
            agent { label "${AGENT_LABEL}" }
            steps {
                unstash 'source'
                echo 'This is for testing the application'
                
            }
        }       

        stage('Approval Gateway') {
            agent none
            steps {
                input message: 'Approve production deploy?', ok: 'Deploy'
            }
        }

        stage('Deploy to Prod') {
            agent { label "${AGENT_LABEL}" }
            steps {
                sh '''
                    docker stop ${APP_NAME} || true
                    docker rm ${APP_NAME} || true
                    docker run -d --name ${APP_NAME} \
                      -p ${APP_PORT}:${CONTAINER_PORT} \
                      -e APP_ENV=prod \
                      -e BUILD_NUMBER=${IMAGE_TAG} \
                      --restart unless-stopped \
                      ${APP_NAME}:${IMAGE_TAG}
                '''
            }
        }
    }
}
