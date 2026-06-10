pipeline {
  agent any
  options {
    disableConcurrentBuilds()
  }
  triggers {
    pollSCM('H/2 * * * *')
  }
  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/SateaMall/Photographic-Portfolio-Manager.git'
      }
    }
    stage('Backend Build') {
      steps {
        dir('backend') {
          sh '''
            export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
            export PATH="$JAVA_HOME/bin:$PATH"
            java -version
            javac -version
            bash ./mvnw clean package
          '''
        }
      }
    }
    stage('Frontend Build') {
      steps {
        dir('frontend') {
          sh '''
            npm ci
            npm run lint
            VITE_API_BASE_URL="" npm run build
          '''
        }
      }
    }
    stage('Deploy Frontend') {
      steps {
        sh 'rsync -a --delete frontend/dist/ /var/www/letmelens/'
      }
    }
    stage('Deploy Backend') {
      steps {
        sh '''
          cp backend/target/backend-0.0.1-SNAPSHOT.jar /opt/Photographic-Portfolio-Manager/backend.jar
          sudo /usr/bin/systemctl restart photographic-portfolio-manager
        '''
      }
    }
    stage('Verify') {
      steps {
        sh '''
          for i in $(seq 1 12); do
            if curl -fsS http://127.0.0.1:8080/robots.txt > /dev/null; then
              break
            fi
            if [ "$i" -eq 12 ]; then
              echo "Backend did not become ready in time"
              exit 1
            fi
            sleep 2
          done
          curl -fsS http://127.0.0.1:8080/robots.txt > /dev/null
          curl -fsS http://127.0.0.1:8080/login > /dev/null
          curl -fI https://www.letmelens.com
        '''
      }
    }
  }
}