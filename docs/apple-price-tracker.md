# Price Tracker 대시보드

이 프로젝트는 CSV 파일의 상품 가격 데이터를 추적하고 시각화하기 위해 제작된 웹 대시보드입니다. 사용자는 가격 추이, 시장 변동성을 분석하고, 계층적 드릴다운 인터페이스를 통해 상품 데이터를 탐색할 수 있습니다.

## 프로젝트 구조

이 프로젝트는 Next.js 프론트엔드 애플리케이션을 포함하는 모노레포 구조입니다.

```
/
├── public/              # 정적 에셋
├── src/
│   ├── app/             # Next.js 앱 라우터, 페이지 및 API 라우트 포함
│   │   ├── api/         # API 엔드포인트
│   │   └── (pages)/     # 메인 UI 페이지
│   ├── components/      # 재사용 가능한 리액트 컴포넌트 (차트, UI 요소 등)
│   ├── lib/             # 핵심 데이터 처리 로직 (data.ts)
│   └── types/           # TypeScript 타입 정의
├── .gitignore           # Git이 무시할 파일 및 폴더 목록
├── docker-compose.yml   # Docker Compose 서비스 설정
├── Dockerfile           # 웹 애플리케이션 Docker 설정
├── input.csv            # 애플리케이션의 원본 데이터 소스
├── next.config.js       # Next.js 설정
└── package.json         # 프로젝트 의존성 및 스크립트
```

-   **`input.csv`**: 원본 데이터 소스 파일입니다. 모든 분석은 이 파일로부터 생성됩니다.
-   **`src/lib/data.ts`**: `input.csv`를 읽고 처리하는 핵심 파일입니다. 가격 추이, 시장 변동 데이터, 드릴다운 탐색을 위한 데이터를 계산합니다.
-   **`src/app/api/products/route.ts`**: 처리된 데이터를 프론트엔드로 전달하는 백엔드 API 엔드포인트입니다.
-   **`src/components/`**: 가격 추이를 시각화하는 `TrendChart.tsx`와 카테고리 탐색을 위한 `DrilldownNavigator.tsx` 등 모든 UI 컴포넌트가 포함됩니다.

## 기술 스택

-   **프레임워크**: [Next.js](https://nextjs.org/) (React)
-   **언어**: [TypeScript](https://www.typescriptlang.org/)
-   **스타일링**: [Tailwind CSS](https://tailwindcss.com/)
-   **차트**: [Recharts](https://recharts.org/)
-   **컨테이너화**: [Docker](https://www.docker.com/)

## 시작하기

로컬 컴퓨터에서 프로젝트를 설정하고 실행하려면 아래의 안내를 따르세요.

### 사전 요구사항

-   [Node.js](https://nodejs.org/) (v18 이상 권장)
-   [npm](https://www.npmjs.com/) 또는 [yarn](https://yarnpkg.com/)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (컨테이너 배포 시 필요)

### 1. 로컬 환경에서 개발하기

개발 및 테스트에 권장되는 방법입니다.

1.  **리포지토리 클론**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **의존성 설치**
    ```bash
    npm install
    ```

3.  **개발 서버 실행**
    애플리케이션이 핫 리로딩 기능과 함께 개발 모드로 시작됩니다.
    ```bash
    npm run dev
    ```

4.  **애플리케이션 열기**
    웹 브라우저에서 [http://localhost:3000](http://localhost:3000) 주소로 접속하세요.

### 2. Docker로 배포하기

이 방법은 애플리케이션을 Docker 컨테이너 내부에서 실행합니다.

1.  **Docker Desktop이 실행 중인지 확인하세요.**

2.  **컨테이너 빌드 및 실행**
    프로젝트 루트 디렉터리에서 다음 명령을 실행하세요.
    ```bash
    docker compose up --build
    ```
    이 명령어는 `Dockerfile`에 정의된 대로 Docker 이미지를 빌드하고 서비스를 시작합니다.

3.  **애플리케이션 열기**
    웹 브라우저에서 [http://localhost:3000](http://localhost:3000) 주소로 접속하세요.

## 데이터에 대하여

-   현재 `input.csv`에 포함된 데이터는 기능 시연을 위한 임의의 샘플 데이터입니다.

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
