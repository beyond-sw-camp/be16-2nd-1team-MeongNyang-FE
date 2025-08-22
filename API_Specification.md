# MeongNyang BE API Specification

This document outlines the RESTful API endpoints and WebSocket (STOMP) message specifications for the MeongNyang backend application.

---

## 1. REST API Endpoints

### 1.1. Admin API (`/admin`)
**Base URL**: `/admin`
**Authentication**: Requires `ADMIN` role.

| HTTP Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/users/list` | 탈퇴하지 않은 회원목록 조회 (Retrieve list of active members) | None | `CommonRes<List<UserListRes>>` |
| `GET` | `/users/detail/{id}` | 회원 상세 조회 (Retrieve member details) | None | `CommonRes<UserDetailRes>` |
| `POST` | `/users/bans/{id}` | 서비스 이용 차단 해제 (Unban user from service) | None | `CommonRes` (success message) |
| `GET` | `/reports` | 모든 신고 조회 (Retrieve all reports) | None | `CommonRes` (page of reports) |
| `GET` | `/reports/{id}` | 신고 상세 내용 (Retrieve report details) | None | `CommonRes` (report details) |
| `POST` | `/reports/{id}` | 신고 처리 (Process report) | `ReportResultReq` | `CommonRes` (success message) |

### 1.2. Alarm API (`/alarms`)
**Base URL**: `/alarms`

| HTTP Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/alarms` | 알람 목록 조회 (Retrieve alarm list) | None | `CommonRes<List<AlarmRes>>` |
| `DELETE` | `/alarms/{id}` | 알람 삭제 (Delete alarm by ID) | None | `CommonRes` (success message) |
| `DELETE` | `/alarms` | 내 알람 전체 삭제 (Delete all my alarms) | None | `CommonRes` (success message) |

### 1.3. Chat API (`/chat-rooms`)
**Base URL**: `/chat-rooms`

| HTTP Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/chat-rooms` | 채팅방 개설 (Create chat room) | `ChatRoomCreateReq` | `CommonRes<ChatRoomSummaryRes>` |
| `GET` | `/chat-rooms` | 요청을 보낸 유저가 소속된 채팅방 목록 조회 (Retrieve chat rooms of the requesting user) | None | `CommonRes<List<ChatRoomSummaryRes>>` |
| `GET` | `/chat-rooms/{roomId}/messages` | 메세지 목록 조회 (Retrieve messages in a chat room) | None | `CommonRes<List<ChatMessageRes>>` |
| `POST` | `/chat-rooms/{roomId}/participants` | 참여자 추가 (Invite users to a chat room) | `List<ChatParticipantAddReq>` | `CommonRes` (success message) |
| `DELETE` | `/chat-rooms/{roomId}/participants/me` | 채팅방 나가기 (Leave chat room) | None | `CommonRes` (success message) |
| `GET` | `/chat-rooms/{roomId}/participants` | 참여자 목록 조회 (Retrieve participants in a chat room) | None | `CommonRes<List<ChatParticipantRes>>` |
| `POST` | `/chat-rooms/{roomId}/files` | 파일 업로드 (Upload files to a chat room) | `List<MultipartFile>` (as `@RequestParam`) | `CommonRes<List<String>>` (list of file URLs) |

### 1.4. Server-Sent Events (SSE) API (`/sse`)
**Base URL**: `/sse`

| HTTP Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/sse` | SSE 연결 (Connect to Server-Sent Events) | None | `SseEmitter` |
| `DELETE` | `/sse` | SSE 연결 해제 (Disconnect from Server-Sent Events) | None | None |

### 1.5. Market API (`/markets`)
**Base URL**: `/markets`

| HTTP Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/markets/posts` | 거래글 등록 (Register market post) | `MarketPostCreateReq` (as `@RequestPart`), `List<MultipartFile>` (as `@RequestPart`) | `CommonRes<Long>` (postId) |
| `PATCH` | `/markets/{id}` | 거래글 수정 (Update market post) | `MarketPostUpdateReq` (as `@RequestPart`), `List<MultipartFile>` (as `@RequestPart`) | `CommonRes<Long>` (postId) |
| `DELETE` | `/markets/{id}` | 거래글 삭제 (Delete market post) | None | `CommonRes<Long>` (postId) |
| `GET` | `/markets/posts` | 거래글 목록조회 (Retrieve market post list) | None | `CommonRes` (page of market posts) |
| `GET` | `/markets/posts/{id}` | 거래글 상세조회 (Retrieve market post details) | None | `CommonRes` (market post details) |
| `GET` | `/markets/purchases` | 구매목록 조회 (Retrieve purchase list) | None | `CommonRes` (page of purchases) |
| `GET` | `/markets/sales` | 판매목록 조회 (Retrieve sales list) | None | `CommonRes` (page of sales) |
| `POST` | `/markets/{id}/like` | 찜하기 (Like market post) | None | `CommonRes<Long>` (wishListId) |
| `DELETE` | `/markets/{id}/like` | 찜 취소 (Unlike market post) | None | `CommonRes<Long>` (postId) |
| `GET` | `/markets/like` | 찜 목록조회 (Retrieve wishlist) | None | `Page<MarketPostListReq>` |

### 1.6. Pet API (`/pets`)
**Base URL**: `/pets`

| HTTP Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/pets/register` | 유저가 펫 등록 (Register pet for user) | `PetRegisterReq` (as `@RequestPart`), `MultipartFile` (as `@RequestPart`) | `CommonRes` (success message) |
| `GET` | `/pets/list` | 유저가 등록한 애완동물 목록 (Retrieve list of user's registered pets) | None | `CommonRes` (list of pets) |
| `PUT` | `/pets/{id}` | 유저가 등록한 펫 수정 (Update user's registered pet) | `PetRegisterReq` (as `@RequestPart`), `MultipartFile` (as `@RequestPart`) | `CommonRes` (success message) |
| `DELETE` | `/pets/{id}` | 유저가 등록한 펫 삭제 (Delete user's registered pet) | None | `CommonRes` (success message) |

### 1.7. Post API (`/posts`)
**Base URL**: `/posts`

| HTTP Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/posts` | 일기 작성 (Create post) | `PostCreateReq` (as `@RequestPart`), `List<MultipartFile>` (as `@RequestPart`) | `CommonRes<Long>` (postId) |
| `PATCH` | `/posts/{id}` | 일기 수정 (Update post) | `PostEditReq` (as `@RequestPart`), `List<MultipartFile>` (as `@RequestPart`) | `CommonRes<Long>` (postId) |
| `DELETE` | `/posts/{id}` | 일기 삭제 (Delete post) | None | `CommonRes<Long>` (postId) |
| `GET` | `/posts` | 일기 목록 조회 (Retrieve post list) | None | `CommonRes` (page of posts) |
| `GET` | `/posts/{id}` | 일기 상세 조회 (Retrieve post details) | None | `CommonRes` (post details) |
| `POST` | `/posts/like` | 좋아요 (Like post) | `PostLikeReq` | `CommonRes` (success message) |
| `DELETE` | `/posts/{id}/like` | 좋아요 취소 (Unlike post) | None | `CommonRes` (success message) |
| `GET` | `/posts/{id}/like` | 좋아요 목록 조회 (Retrieve likes for a post) | None | `CommonRes` (page of likes) |
| `POST` | `/posts/{id}/comments` | 댓글 달기 (Add comment to post) | `PostCommentCreateReq` | `CommonRes` (success message) |
| `POST` | `/posts/comments/{id}/reply` | 대댓글 달기 (Add reply to comment) | `PostCommentReplyReq` | `CommonRes` (success message) |
| `PATCH` | `/posts/comments/{id}` | 댓글 수정 (Edit comment) | `PostCommentEditReq` | `CommonRes<Long>` (commentId) |
| `DELETE` | `/posts/comments/{id}` | 댓글 삭제 (Delete comment) | None | `CommonRes<Long>` (commentId) |
| `GET` | `/posts/{id}/comments` | 댓글 목록 조회 (Retrieve comments for a post) | None | `CommonRes` (page of comments) |
| `GET` | `/posts/search` | 검색 (Search posts) | Query Params: `searchType`, `keyword` | `CommonRes` (page of search results) |
| `POST` | `/posts/{id}/reports` | 신고 (Report post) | `PostReportCreateReq` | `CommonRes` (success message) |

### 1.8. Species API (`/species`)
**Base URL**: `/species`

| HTTP Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/species/list` | Species 목록 조회 (Retrieve species list) | None | `CommonRes<List<SpeciesListRes>>` |
| `GET` | `/species/search` | 검색 api (Search species) | `SpeciesSearchReq` (as `@ModelAttribute`) | `CommonRes<List<SpeciesListRes>>` |

### 1.9. User API (`/users`)
**Base URL**: `/users`

| HTTP Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/users/check-email` | 이메일 중복 확인 (Check email duplication) | `UserCheckEmailReq` | `CommonRes` (success message) |
| `POST` | `/users/verify-email` | 이메일 인증 코드 발송 (Send email verification code) | `UserCheckEmailReq` | `CommonRes` (success message) |
| `POST` | `/users/verify-email-check` | 이메일 인증 코드 확인 (Verify email verification code) | `UserEmailVerifyReq` | `CommonRes` (success message) |
| `POST` | `/users/check-nickname` | 닉네임 중복 확인 (Check nickname duplication) | `UserCheckNicknameReq` | `CommonRes` (success message) |
| `POST` | `/users/sign` | 회원가입 (User registration) | `UserCreateReq` | `CommonRes` (success message) |
| `POST` | `/users/login` | 일반 로그인 (Standard login) | `UserLoginReq` | `CommonRes<UserLoginRes>` (access and refresh tokens) |
| `POST` | `/users/lost-password` | 비밀번호 찾기 :임시비밀번호 발급 (Find password: issue temporary password) | `UserFindPasswordReq` | `CommonRes` (success message) |
| `POST` | `/users/unlock` | 계정 unlock 풀기 (Unlock account) | `UserUnlockReq` | `CommonRes` (success message) |
| `PUT` | `/users/change/password` | 비밀번호 변경 (Change password) | `UserChangePasswordReq` | `CommonRes` (success message) |
| `POST` | `/users/delete` | 계정 삭제 (Delete account) | `UserCheckPasswordReq` | `CommonRes` (success message) |
| `PUT` | `/users/my-page/{id}/main-pet` | 대표동물 설정 (Set main pet) | None | `CommonRes` (success message) |
| `GET` | `/users/my-page` | 마이페이지 -기본 (My page - basic) | None | `CommonRes<MyPageRes>` |
| `POST` | `/users/follows/{id}` | 팔로우 (Follow user) | None | `CommonRes` (success message) |
| `DELETE` | `/users/follows/{id}` | 언팔로우 (Unfollow user) | None | `CommonRes` (success message) |
| `GET` | `/users/follows/followers` | 팔로워 목록 조회 (Retrieve followers list) | None | `CommonRes` (page of followers) |
| `GET` | `/users/follows/followings` | 팔로잉 목록 조회 (Retrieve followings list) | None | `CommonRes` (page of followings) |
| `POST` | `/users/blocks/{id}` | 차단 (Block user) | None | `CommonRes` (success message) |
| `DELETE` | `/users/blocks/{id}` | 차단해제 (Unblock user) | None | `CommonRes` (success message) |
| `GET` | `/users/blocks` | 차단 목록 조회 (Retrieve blocked users list) | None | `CommonRes` (page of blocked users) |

---

## 2. WebSocket (STOMP) Endpoints

### 2.1. WebSocket Configuration
- **WebSocket Endpoint**: `/connect`
  - This endpoint is used to establish a WebSocket connection. It supports SockJS for fallback options.
  - Allowed Origins: Configured via `${cors.origin}` (e.g., `http://localhost:5173`, `http://localhost:8080`).
- **Application Destination Prefix**: `/publish`
  - Messages sent from clients to the server should be prefixed with `/publish`. These messages are routed to `@MessageMapping` methods in `@Controller` classes.
- **Simple Broker**: `/topic`
  - The server sends messages to clients via destinations prefixed with `/topic`. Clients can subscribe to these topics to receive messages.
- **Inbound Channel Interceptor**: `StompHandler`
  - This interceptor is used to validate JWT tokens and chat room participant access during WebSocket connection, subscription, and message sending.

### 2.2. STOMP Message Mappings (`/publish`)
**Base Prefix**: `/publish`

| STOMP Command | Destination | Description | Message Body |
|---|---|---|---|
| `SEND` | `/chat-rooms/{roomId}/chat-message` | 채팅 메시지 전송 (Send chat message) | `ChatMessageReq` |
| `SEND` | `/chat-rooms/{roomId}/invite` | 유저 초대 (Invite users to a chat room) | `List<ChatParticipantAddReq>` |
| `SEND` | `/chat-rooms/{roomId}/leave` | 채팅방 나가기 (Leave chat room) | None |
| `SEND` | `/chat-rooms/{roomId}/online` | 온라인 상태 알림 (Notify online status) | `ChatOnlineParticipantReq` |
| `SEND` | `/chat-rooms/{roomId}/offline` | 오프라인 상태 알림 (Notify offline status) | `ChatOnlineParticipantReq` |

### 2.3. STOMP Subscriptions (`/topic`)
**Base Prefix**: `/topic`

Clients can subscribe to the following specific topics to receive real-time updates for a chat room. Each sub-topic delivers a distinct type of update.

| Destination | Description | Message Type (Example DTO) |
|---|---|---|
| `/topic/chat-rooms/{roomId}/chat-message` | Receive new chat messages for a specific chat room. | `ChatMessageRes` |
| `/topic/chat-rooms/{roomId}/chat-participants` | Receive updates on chat room participants (e.g., users joining or leaving). | `List<ChatParticipantRes>` |
| `/topic/chat-rooms/{roomId}/chat-online-participants` | Receive updates on which users are currently online in the chat room. | `List<ChatOnlineParticipantRes>` |

---

This concludes the detailed API specification for the MeongNyang BE application.
