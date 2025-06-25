pipeline {
    agent { label 'host_slave-pdap-stage-2' }
      triggers {
          cron('30 15 * * *')
      }    
    parameters {
        string(name: 'PATCH_VERSION', defaultValue: '', description: 'Enter an integer to override BUILDS_ALL_TIME, leave the default value if you do not want to override')
    }
    
    environment {
        majorVersion = 1
        minorVersion = 0
        patchVersion = VersionNumber(versionNumberString: '${BUILDS_ALL_TIME}', overrideBuildsAllTime: '${PATCH_VERSION}')
        tag = sh(returnStdout: true, script: "echo $majorVersion.$minorVersion.$patchVersion").trim()
        GITHUB_REPO_NAME = sh(returnStdout: true, script: "echo ${GIT_URL} | grep -Eo '[^/]+/?\$' | cut -d / -f1").trim()
        GITHUB_STATUS_API_ENDPOINT = sh(returnStdout: true, script: "echo https://api.github.com/repos/picarro/${GITHUB_REPO_NAME}/statuses/${GIT_COMMIT}").trim()
    }
    
    stages {
        stage("Set Build Number") {
            steps {
                script {
                    currentBuild.displayName = "#"+"$majorVersion" + "." + "$minorVersion" + "." + "$patchVersion"
                    sh 'echo " Current Build Number $currentBuild.displayName" '
                }
            }
        }
       
        stage("Send Slack Notification") {
            steps {
                sh 'echo "This is the notification stage"'
                slackSend color: "good", message: "CI/CD Started: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
            }
        } 
        
        stage("Run Unit Tests") {
            steps {
                slackSend color: "good", message: "Tests Started: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
                script {
                    sh 'echo "TO DO UNIT TEST" '
                }
            }
        } 
        
        stage("Build Docker Image for develop") {
            when {
                environment name: 'GIT_BRANCH', value: 'develop'
            }
            steps {
                slackSend color: "good", message: "Build Started: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
                script {
                    sh "make docker_build docker_tag=$tag"
                }
            }
        }
        
        stage("Deploy to Artifactory from develop branch") {
            when {
                environment name: 'GIT_BRANCH', value: 'develop'
            }
            steps {
                slackSend color: "good", message: "Deployment Started: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
                script {
                    sh "make docker_deploy docker_tag=$tag"
                }
            }
        }

        stage("Build Docker Image for release-wms-vx.x") {
            when {
                environment name: 'GIT_BRANCH', value: "release-wms-v$tag"
            }
            steps {
                slackSend color: "good", message: "Build Started: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
                script {
                    sh "make docker_build docker_tag=$tag"
                }
            }
        }
        
        stage("Deploy to Artifactory from release-wms-vx.x branch") {
            when {
                environment name: 'GIT_BRANCH', value: "release-wms-v$tag"
            }
            steps {
                slackSend color: "good", message: "Deployment Started: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
                script {
                    sh "make docker_deploy docker_tag=$tag"
                }
            }
        }
	
	stage("Build Docker Image for main") {
            when {
                environment name: 'GIT_BRANCH', value: 'main'
            }
            steps {
                slackSend color: "good", message: "Build Started: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
                script {
                    sh "make docker_build docker_tag=$tag"
                }
            }
        }

        stage("Deploy to Artifactory from main branch") {
            when {
                environment name: 'GIT_BRANCH', value: 'main'
            }
            steps {
                slackSend color: "good", message: "Deployment Started: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
                script {
                    sh "make docker_deploy docker_tag=$tag"
                }
            }
        }

    }
    
    post {
        success {
            slackSend color: "good", message: "CI/CD passed: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
        }
        failure {
            slackSend color: "danger", message: "CI/CD failed: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
        }
        aborted {
            slackSend color: "warning", message: "CI/CD Aborted: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - ${BUILD_URL}"
        }
        unstable {
            slackSend color: "warning", message: "Unstable build: ${JOB_NAME} ${BUILD_DISPLAY_NAME} - Check Build Log: ${BUILD_URL}"
        }
    }
}


