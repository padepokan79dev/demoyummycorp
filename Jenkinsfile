// Define your secret project token here
def project_token = '7eb641e1dd9eaedbaffc79395b72c292'

// Reference the GitLab connection name from your Jenkins Global configuration (https://JENKINS_URL/configure, GitLab section)
pipeline {
    agent any
    stages {
        stage('Building Apps') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'master'){
                        // Build Steps
                        echo 'Build Master Branch'
                        // sh '''npm install --prefer-offline --no-audit && npm run build --prefer-offline --no-audit'''
                    }
                    else if (env.BRANCH_NAME == 'development'){
                        // Build Steps
                        echo 'Build Development Branch'
                        sh '''npm install --prefer-offline --no-audit && npm run build --prefer-offline --no-audit'''
                    }
                    else if (env.BRANCH_NAME == 'stage'){
                        // Build Steps
                        echo 'Build Stage Branch'
                        // sh '''npm install --prefer-offline --no-audit && npm run build --prefer-offline --no-audit'''
                    }
                }
            }
        }
        stage('Deploy Apps') {
            steps{
                script{
                    if (env.BRANCH_NAME == 'master'){
                        // Deploy Steps
                        echo 'Deploy Build Result Master Branch Code to Server'
                        // sh '''scp -r ~/workspace/fsmfedemo_master/dist padepokan79@10.10.5.17:/opt/democicd/fsmfedemo'''
                    }
                    else if (env.BRANCH_NAME == 'development'){                     
                        // Deploy Steps
                        echo 'Deploy Build Result Development Branch Code to Server'
                        sh '''scp -r ~/workspace/fsmfedemo_development/dist padepokan79@limatujuhlas:/opt/democicd/fsmfedemo'''
                    }
                    else if (env.BRANCH_NAME == 'stage'){
                        // Deploy Steps
                        echo 'Deploy Build Result Stage Branch Code to Server'
                        // sh '''scp -r ~/workspace/fsmfedemo_stage/dist padepokan79@10.10.5.17:/opt/democicd/fsmfedemo'''
                    }
                }
            }
        }
        stage('Testing Apps') {
            steps{
                script{
                    if (env.BRANCH_NAME == 'master'){
                        // Testing Steps
                        echo 'Testing Build Result'
                    }
                    else if (env.BRANCH_NAME == 'development'){
                        // Testing Steps
                        echo 'Testing Build Result'
                        sh '''ssh selenium@10.10.5.188 -t "TERM=xterm-256color ~/SeleniumJavaFramework/runtest.sh"'''
                    }
                    else if (env.BRANCH_NAME == 'stage'){
                        // Testing Steps
                        echo 'Testing Build Result'
                    }
                }
            }
        }
        stage('Load Testing Apps') {
            steps{
                script{
                    if (env.BRANCH_NAME == 'master'){
                        // Testing Steps
                        echo 'Testing Build Result'
                    }
                    else if (env.BRANCH_NAME == 'development'){
                        // Testing Steps
                        echo 'Testing Build Result'
                        sh '''ssh selenium@10.10.5.188 -t "TERM=xterm-256color ~/apache-jmeter-5.4.1/bin/jmeter.sh -n -t ~/load_test_fsm_1k_request.jmx -l ~/resultload.csv"'''
                        // Input Step
                        timeout(time: 10, unit: "MINUTES") {
                        input message: 'Do you want to approve the deployment?', ok: 'Yes'
                        }
                        echo "Script Trigger Production"
                        // place here
                    }
                    else if (env.BRANCH_NAME == 'stage'){
                        // Testing Steps
                        echo 'Testing Build Result'
                    }
                }
            }
        }
    }
    post{
        always{
            // discord notifictaion
            discordSend description: "**${JOB_NAME} ${BUILD_DISPLAY_NAME}**\n\n**Build:** ${BUILD_NUMBER}\n**Status:** ${currentBuild.currentResult} ", footer: "Footer Text", link: env.BUILD_URL, result: currentBuild.currentResult, title: JOB_NAME, webhookURL: "https://discord.com/api/webhooks/841520042330947585/FYlL6KFUgmh9O1LCFp5yUcatPqKMdr2X_qnb4ITSMoglGQm3lfaMxQfXc6yQZ1s9L4jS"
        }
    }
}