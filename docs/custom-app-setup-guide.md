# Add Custom Application Guide

Kustomize를 사용하여 쿠버네티스 클러스터에 커스텀 애플리케이션을 설정하는 방법을 안내합니다.

**첫 번째 앱 추가 시점에만 필요 (한번 설정하면 끝)**

## Prerequisites

- Main branch 편집 권한
- Git에 application 리포지토리가 push되어 있어야 함
- application 이미지가 build 가능한 상태여야 함

## 1단계: 기본 리소스 구성

1. base directory로 이동:
   ```bash
   cd cd/kustomize/base/
   ```

2. example app manifest를 복사:
   ```bash
   cp example_app.yaml {your_app_name}.yaml
   ```

3. `{your_app_name}.yaml`을 편집하여 애플리케이션 정보를 입력:
   ```yaml
   # In the Deployment section:
   - name: your-container-name  # e.g., main-app
     image: your-dockerhub-username/your-app-name:tag  # e.g., middlek/main-app:latest
     ports:
     - containerPort: your-container-port  # e.g., 8000
   
   # In the Service section:
   targetPort: your-container-port  # Must match the containerPort above
   ```

4. `base/kustomization.yaml`을 편집하여 애플리케이션 manifest를 추가:
   ```yaml
   resources:
     - awscli_pod.yaml
     - issuer.yaml
     - pod.yaml
     - service.yaml
     - {your_app_name}.yaml  # Add this line
   ```

## 2단계: 오버레이 구성
**첫 번째 설정시에만 필요 (한번 설정하면 끝)**

1. 오버레이 디렉토리로 이동합니다:
   ```bash
   cd ../overlays/
   ```

2. `kustomization.yaml` 파일을 수정하여 이미지 정보를 추가합니다:
   ```yaml
   images:
     - name: ...
       newTag: latest
     ...
     - name: your-dockerhub-username/your-app-name  # 1단계에서 설정한 이미지 이름
       newTag: latest  # latest 입력. GitHub Actions에서 추후 자동으로 생성
   ```

## 3단계: Ingress 구성

애플리케이션을 외부에 노출하기 위해 반드시 Ingress를 구성해야 합니다.

1. `infra/live/config/ingress/main.yaml` 파일을 수정합니다:
   ```yaml
   # 다음 섹션의 주석을 해제하고 수정하세요:
   - path: /your-app-path  # 예: /api
     pathType: Prefix
     backend:
       service:
         name: {your-service-name}  # your_app_name.yaml의 서비스 이름과 일치해야 함
         port:
           number: 8000  # your_app_name.yaml의 서비스 포트와 일치해야 함
   ```
