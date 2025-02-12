pipeline {
	agent any

	options {
		disableConcurrentBuilds()
	}

	parameters {
		booleanParam(name: 'ARCHIVE_ARTIFACTS', defaultValue: false, description: 'Sollen die Artefakte archiviert werden?')
		booleanParam(name: 'CLEAN_DOCKER', defaultValue: true, description: 'Docker Images und Cache vor dem Build löschen?')
	}

	environment {
		REGISTRY = "registry.dilog.dev"
		REGISTRY_NAMESPACE = "syshub"
		REGISTRY_CREDENTIALS = 'LITE_REGISTRY_CREDENTIALS'
		IMAGE = "core"
        BUILD_TAG = "latest"
	}

	stages {
		stage('Prepare') {
			steps {
				cleanWs()
				checkout scm
				script {
					sh 'npm install typescript'
					sh 'npm install @angular/cli'
                    sh 'npm install @nestjs/cli'
				}
			}
		}

		stage('CleanUp Docker') {
			when {
				expression { params.CLEAN_DOCKER == true }
			}
			steps {
				script {
					sh '''
						docker images | grep "${env.BUILD_TAG}" | awk '{print $1 ":" $2}' | xargs -r docker rmi
					'''

					sh '''
               			docker builder prune -af
               			npm cache clean --force
            		'''
				}
			}
		}

		stage('Build') {
			stages {
				stage('Core (NestJS)') {
					steps {
						script {
							docker.withRegistry("https://${env.REGISTRY}/${REGISTRY_NAMESPACE}/${IMAGE}", REGISTRY_CREDENTIALS) {
								def backendImage = docker.build("${REGISTRY_NAMESPACE}/${IMAGE}:${env.BUILD_TAG}",
									"--no-cache .")
								backendImage.push()
							}
                        }
					}
				}
			}
		}
	}
}