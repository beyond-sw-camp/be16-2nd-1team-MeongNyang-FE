# be16-2nd-1team-meongnyang-fe

멍냥이 커뮤니티 프론트엔드 프로젝트입니다.

## 주요 기능

- 🏠 **홈**: 커뮤니티 소개 및 메인 페이지
- 🐕 **반려동물 관리**: 반려동물 등록, 수정, 조회
- 📖 **다이어리**: 반려동물과의 일상 기록
- 🛒 **마켓**: 반려동물 관련 상품 거래
- 💬 **채팅**: 실시간 채팅방 기능
- 👤 **사용자 관리**: 회원가입, 로그인, 프로필 관리
- 🛡️ **관리자**: 관리자 전용 기능

## 채팅 기능

- 실시간 WebSocket 통신 (STOMP 프로토콜)
- 채팅방 생성 및 참여
- 파일 업로드 지원 (이미지, 비디오, 오디오)
- 참여자 온라인 상태 표시
- 읽지 않은 메시지 카운트
- 날짜별 메시지 구분

## 기술 스택

- **Frontend**: Vue 3 + Vuetify 3
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **WebSocket**: SockJS + STOMP
- **Build Tool**: Vue CLI

## Project setup

```bash
npm install
```

### Compiles and hot-reloads for development
```bash
npm run serve
```

### Compiles and minifies for production
```bash
npm run build
```

### Lints and fixes files
```bash
npm run lint
```

### Run tests
```bash
npm run test:e2e
```

## 환경 설정

프로젝트 실행을 위해 다음 환경이 필요합니다:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api

## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

