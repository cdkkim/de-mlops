# 1. 베이스 이미지 선택 (Node.js 18의 가벼운 Alpine Linux 버전)
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 의존성 설치를 위해 package.json과 package-lock.json 먼저 복사
# (이 파일들이 변경되지 않으면 도커는 캐시를 사용해 npm install 단계를 건너뜀)
COPY package*.json ./

# 4. 의존성 설치
RUN npm install

# 5. 나머지 소스 코드 복사
COPY . .

# 6. Next.js 개발 서버가 사용하는 3000번 포트 노출
EXPOSE 3000

# 7. 컨테이너가 시작될 때 실행할 기본 명령어
CMD ["npm", "run", "dev"] 