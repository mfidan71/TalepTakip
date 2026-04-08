pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "${params.DOCKER_REGISTRY}"
        IMAGE_NAME      = 'talep-yonetimi'
        IMAGE_TAG       = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'latest'}"
        HELM_RELEASE    = 'talep-yonetimi'
        HELM_NAMESPACE  = "${params.K8S_NAMESPACE}"
    }

    parameters {
        string(name: 'DOCKER_REGISTRY', defaultValue: 'registry.example.com', description: 'Docker registry adresi')
        string(name: 'K8S_NAMESPACE', defaultValue: 'default', description: 'Kubernetes namespace')
        string(name: 'INGRESS_HOST', defaultValue: 'talep.example.com', description: 'Ingress domain')
        string(name: 'SUPABASE_URL', defaultValue: '', description: 'Supabase URL')
        string(name: 'SUPABASE_PUBLISHABLE_KEY', defaultValue: '', description: 'Supabase Publishable Key')
        string(name: 'SUPABASE_PROJECT_ID', defaultValue: '', description: 'Supabase Project ID')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def fullImage = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh """
                        docker build \
                            --build-arg VITE_SUPABASE_URL=${params.SUPABASE_URL} \
                            --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=${params.SUPABASE_PUBLISHABLE_KEY} \
                            --build-arg VITE_SUPABASE_PROJECT_ID=${params.SUPABASE_PROJECT_ID} \
                            -t ${fullImage} \
                            -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest \
                            .
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-registry-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login ${DOCKER_REGISTRY} -u "\$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Deploy with Helm') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh """
                        helm upgrade --install ${HELM_RELEASE} ./helm/talep-yonetimi \
                            --namespace ${HELM_NAMESPACE} \
                            --create-namespace \
                            --set image.repository=${DOCKER_REGISTRY}/${IMAGE_NAME} \
                            --set image.tag=${IMAGE_TAG} \
                            --set ingress.hosts[0].host=${params.INGRESS_HOST} \
                            --set ingress.hosts[0].paths[0].path=/ \
                            --set ingress.hosts[0].paths[0].pathType=Prefix \
                            --set supabase.url=${params.SUPABASE_URL} \
                            --set supabase.publishableKey=${params.SUPABASE_PUBLISHABLE_KEY} \
                            --set supabase.projectId=${params.SUPABASE_PROJECT_ID} \
                            --wait --timeout 300s
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deploy başarılı: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo "❌ Pipeline başarısız oldu!"
        }
        always {
            sh "docker rmi ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || true"
            sh "docker rmi ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest || true"
        }
    }
}
