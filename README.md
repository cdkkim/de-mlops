# de-mlops

## dev
[개발환경 설정](docs/README_infradev.md)

## live
[운영환경 설정](docs/README_infralive.md)
||||||| (empty tree)

# Price Tracker

Apple 제품의 실시간 가격 변동을 추적하고, 시장 동향을 분석하는 대시보드입니다. Next.js와 TypeScript로 구축되었으며, Docker를 통해 어떤 환경에서든 쉽게 실행할 수 있습니다.

## ✨ 주요 기능

-   **가격 추이 분석**: 선택한 제품 또는 카테고리의 시계열 가격 변동을 차트로 시각화합니다.
-   **시장 동향(Market Movers)**: 가격 및 할인율의 변동이 가장 큰 제품을 추적합니다.
-   **동적 필터링**: 특정 제품 카테고리를 선택하면, 가격 추이와 시장 동향이 해당 카테고리에 맞춰 동적으로 필터링됩니다.
-   **드릴다운 인터페이스**: 직관적인 UI를 통해 전체 카테고리에서 개별 제품까지 손쉽게 탐색할 수 있습니다.
-   **다크/라이트 모드**: 사용자의 시스템 설정에 맞는 테마를 제공합니다.

## 🛠️ 기술 스택

-   **프레임워크**: Next.js (React)
-   **언어**: TypeScript
-   **스타일링**: Tailwind CSS
-   **데이터 처리**: PapaParse (CSV 파싱)
-   **차트**: Recharts
-   **실행 환경**: Docker (Node.js 18)

---

## 🚀 시작하기

이 프로젝트는 Docker를 사용하여 실행하는 것을 강력히 권장합니다. 로컬 컴퓨터에 Node.js나 다른 개발 도구를 설치할 필요 없이, Docker만으로 모든 환경에서 동일하게 프로젝트를 실행할 수 있습니다.

### 사전 요구사항

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) 이 설치되어 있어야 합니다. (Windows, Mac, Linux 지원)

### 실행 방법 (모든 OS 공통)

1.  **프로젝트 클론 또는 다운로드**:
    ```bash
    git clone [저장소 URL]
    cd [프로젝트 폴더명]
    ```

2.  **도커 컨테이너 빌드 및 실행**:
    프로젝트 루트 디렉터리에서 아래 명령어를 실행합니다. 최초 실행 시 이미지를 빌드하므로 시간이 다소 소요될 수 있습니다.

    ```bash
    docker-compose up --build
    ```
    
    `--build` 옵션은 `Dockerfile`이나 소스 코드에 변경사항이 있을 때 이미지를 새로 빌드하기 위해 사용합니다. 이후 실행 시에는 `docker-compose up` 만으로 더 빠르게 실행할 수 있습니다.

3.  **애플리케이션 접속**:
    웹 브라우저를 열고 `http://localhost:3000` 으로 접속하세요.

4.  **컨테이너 중지**:
    터미널에서 `Ctrl + C`를 누르면 컨테이너가 중지됩니다. 백그라운드에서 실행했다면 `docker-compose down` 명령어로 중지할 수 있습니다.

---

### (선택) 로컬 환경에서 직접 실행하기

Docker를 사용하지 않고 로컬 환경에서 직접 실행할 수도 있습니다.

-   **Node.js**: v18 이상
-   **패키지 매니저**: npm

1.  **의존성 패키지 설치**:
    ```bash
    npm install
    ```

2.  **개발 서버 실행**:
    ```bash
    npm run dev
    ```
3.  **애플리케이션 접속**:
    웹 브라우저를 열고 `http://localhost:3000` 으로 접속하세요.

## 📊 데이터 구조

`input.csv` 파일은 다음과 같은 구조를 가집니다:

```csv
DATE,PROD ID,CPH L1,CPH L2,CPH L3,CPH L4,PROD NAME,REGULAR PRICE,DISCOUNTED PRICE,DISCOUNT RATE
2025/06/01,MXGL3KH/A,Watch,Watch SE (2nd Gen),Watch SE (2nd Gen) Cell,Watch SE (2nd Gen) Cell,APPLE WATCH SE 44 MI AL MI SB SM CEL-KOR,439000.0,434610.0,0.01
```

## 🎨 디자인 특징

### Liquid Glass 효과
- 반투명한 유리질 배경
- 블러 효과와 부드러운 그림자
- iOS 18 스타일의 현대적인 UI

### 애니메이션
- 호버 효과와 부드러운 전환
- 로딩 애니메이션
- 카드 스케일 효과

## 📱 반응형 디자인

- **모바일**: 1열 레이아웃, 터치 친화적 인터페이스
- **태블릿**: 2열 레이아웃, 중간 크기 화면 최적화
- **데스크톱**: 4열 통계 카드, 전체 기능 활용

## 🔧 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### 프로덕션 서버 실행
```bash
npm start
```

## 📈 주요 통계

- 총 제품 수
- 총 가치 (정가 기준)
- 할인된 가치
- 평균 할인율

## 🎯 차트 및 시각화

- **카테고리별 분포**: 제품 카테고리별 가치 분포
- **할인율 분포**: 할인율 구간별 제품 수
- **최고 할인 제품**: 할인율 기준 TOP 10 제품

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- Apple Inc. - 제품 정보 제공
- Next.js 팀 - 훌륭한 프레임워크
- Tailwind CSS 팀 - 아름다운 CSS 프레임워크 
