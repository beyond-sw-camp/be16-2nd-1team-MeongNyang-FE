# Backend API Endpoints Documentation (with DTO Details)

This document provides a detailed overview of the REST API and STOMP endpoints implemented in the `be16-2nd-1team-MeongNyang-BE` backend project, including the structure of request DTOs.

---

## UserRestController

**Base Path**: `/users`

1.  **Endpoint**: `POST /users/check-email`
    *   **Description**: 이메일 중복 확인
    *   **Request Body**: `UserCheckEmailReq`
        ```
        {
            "email": "String"
        }
        ```
    *   **Response**: `CommonRes<String>` (email)

2.  **Endpoint**: `POST /users/verify-email`
    *   **Description**: 이메일 인증번호 발송
    *   **Request Body**: `UserCheckEmailReq`
        ```
        {
            "email": "String"
        }
        ```
    *   **Response**: `CommonRes<Void>`

3.  **Endpoint**: `POST /users/verify-email-check`
    *   **Description**: 이메일 인증번호 확인
    *   **Request Body**: `UserEmailVerifyReq`
        ```
        {
            "email": "String",
            "code": "String"
        }
        ```
    *   **Response**: `CommonRes<Void>`

4.  **Endpoint**: `POST /users/check-nickname`
    *   **Description**: 닉네임 중복 확인
    *   **Request Body**: `UserCheckNicknameReq`
        ```
        {
            "nickname": "String"
        }
        ```
    *   **Response**: `CommonRes<String>` (nickname)

5.  **Endpoint**: `POST /users/sign`
    *   **Description**: 회원가입
    *   **Request Body**: `UserCreateReq`
        ```
        {
            "email": "String",
            "password": "String",
            "name": "String",
            "nickname": "String"
        }
        ```
    *   **Response**: `CommonRes<UserCreateReq>`

6.  **Endpoint**: `POST /users/login`
    *   **Description**: 일반 로그인
    *   **Request Body**: `UserLoginReq`
        ```
        {
            "email": "String",
            "password": "String"
        }
        ```
    *   **Response**: `CommonRes<UserLoginRes>` (accessToken, refreshToken)

7.  **Endpoint**: `POST /users/lost-password`
    *   **Description**: 임시 비밀번호 발급 (이메일 전송)
    *   **Request Body**: `UserFindPasswordReq`
        ```
        {
            "name": "String",
            "email": "String"
        }
        ```
    *   **Response**: `CommonRes<Void>`

8.  **Endpoint**: `POST /users/unlock`
    *   **Description**: 계정 잠금 해제
    *   **Request Body**: `UserUnlockReq`
        ```
        {
            "name": "String",
            "email": "String"
        }
        ```
    *   **Response**: `CommonRes<Void>`

9.  **Endpoint**: `PUT /users/change/password`
    *   **Description**: 비밀번호 변경
    *   **Request Body**: `UserChangePasswordReq`
        ```
        {
            "oldPassword": "String",
            "newPassword": "String"
        }
        ```
    *   **Response**: `CommonRes<Void>`

10. **Endpoint**: `POST /users/delete`
    *   **Description**: 회원 탈퇴
    *   **Request Body**: `UserCheckPasswordReq`
        ```
        {
            "password": "String"
        }
        ```
    *   **Response**: `CommonRes<String>`

11. **Endpoint**: `PUT /users/my-page/{id}/main-pet`
    *   **Description**: 대표 동물 설정
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<String>` (mainPetId)

12. **Endpoint**: `GET /users/my-page`
    *   **Description**: 마이페이지 기본 정보 조회
    *   **Request Body**: None
    *   **Response**: `CommonRes<MyPageRes>`

13. **Endpoint**: `POST /users/follows/{id}`
    *   **Description**: 팔로우
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<String>`

14. **Endpoint**: `DELETE /users/follows/{id}`
    *   **Description**: 언팔로우
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<String>`

15. **Endpoint**: `GET /users/follows/followers`
    *   **Description**: 팔로워 목록 조회
    *   **Request Body**: None (Pageable)
    *   **Response**: `CommonRes<Page<User>>`

16. **Endpoint**: `GET /users/follows/followings`
    *   **Description**: 팔로잉 목록 조회
    *   **Request Body**: None (Pageable)
    *   **Response**: `CommonRes<Page<User>>`

17. **Endpoint**: `POST /users/blocks/{id}`
    *   **Description**: 사용자 차단
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<String>`

18. **Endpoint**: `DELETE /users/blocks/{id}`
    *   **Description**: 사용자 차단 해제
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<String>`

19. **Endpoint**: `GET /users/blocks`
    *   **Description**: 차단 목록 조회
    *   **Request Body**: None (Pageable, RequestParam `type`)
    *   **Response**: `CommonRes<Page<User>>`

---

## PostRestController

**Base Path**: `/posts`

1.  **Endpoint**: `POST /posts`
    *   **Description**: 일기 작성
    *   **Request Body**: `PostCreateReq`, `List<MultipartFile>`
        ```
        // PostCreateReq
        {
            "title": "String",
            "content": "String"
        }
        // List<MultipartFile> (files)
        ```
    *   **Response**: `CommonRes<Long>` (id)

2.  **Endpoint**: `PATCH /posts/{id}`
    *   **Description**: 일기 수정
    *   **Request Body**: `PostEditReq`, `List<MultipartFile>`
        ```
        // PostEditReq
        {
            "title": "String",
            "content": "String",
            "fileList": "List<MultipartFile>"
        }
        // List<MultipartFile> (files)
        ```
    *   **Response**: `CommonRes<Long>` (id)

3.  **Endpoint**: `DELETE /posts/{id}`
    *   **Description**: 일기 삭제
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<Long>` (id)

4.  **Endpoint**: `GET /posts`
    *   **Description**: 일기 목록 조회 (내 일기)
    *   **Request Body**: None (Pageable)
    *   **Response**: `CommonRes<Page<Post>>`

5.  **Endpoint**: `GET /posts/{id}`
    *   **Description**: 일기 상세 조회
    *   **Request Body**: None (path variable `postId`)
    *   **Response**: `CommonRes<Post>`

6.  **Endpoint**: `POST /posts/like`
    *   **Description**: 좋아요
    *   **Request Body**: `PostLikeReq`
        ```
        {
            "postId": "Long"
        }
        ```
    *   **Response**: `CommonRes<Boolean>`

7.  **Endpoint**: `DELETE /posts/{id}/like`
    *   **Description**: 좋아요 취소
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<Boolean>`

8.  **Endpoint**: `GET /posts/{id}/like`
    *   **Description**: 좋아요 목록 조회
    *   **Request Body**: None (path variable `postId`, Pageable)
    *   **Response**: `CommonRes<Page<User>>`

9.  **Endpoint**: `POST /posts/{id}/comments`
    *   **Description**: 댓글 달기
    *   **Request Body**: `PostCommentCreateReq`
        ```
        {
            "content": "String"
        }
        ```
    *   **Response**: `CommonRes<Long>` (comment id)

10. **Endpoint**: `POST /posts/comments/{id}/reply`
    *   **Description**: 대댓글 달기
    *   **Request Body**: `PostCommentReplyReq`
        ```
        {
            "content": "String",
            "mentionUserId": "Long"
        }
        ```
    *   **Response**: `CommonRes<Long>` (reply id)

11. **Endpoint**: `PATCH /posts/comments/{id}`
    *   **Description**: 댓글 수정
    *   **Request Body**: `PostCommentEditReq`
        ```
        {
            "content": "String"
        }
        ```
    *   **Response**: `CommonRes<Long>` (comment id)

12. **Endpoint**: `DELETE /posts/comments/{id}`
    *   **Description**: 댓글 삭제
    *   **Request Body**: None (path variable `commentId`)
    *   **Response**: `CommonRes<Long>` (comment id)

13. **Endpoint**: `GET /posts/{id}/comments`
    *   **Description**: 댓글 목록 조회
    *   **Request Body**: None (path variable `id`, Pageable)
    *   **Response**: `CommonRes<Page<Comment>>`

14. **Endpoint**: `GET /posts/search`
    *   **Description**: 검색
    *   **Request Body**: None (RequestParam `searchType`, `keyword`, Pageable)
    *   **Response**: `CommonRes<Page<Post>>`

15. **Endpoint**: `POST /posts/{id}/reports`
    *   **Description**: 신고
    *   **Request Body**: `PostReportCreateReq`
        ```
        {
            "reason": "String"
        }
        ```
    *   **Response**: `CommonRes<String>`

---

## MarketController

**Base Path**: `/markets`

1.  **Endpoint**: `POST /markets/posts`
    *   **Description**: 거래글 등록
    *   **Request Body**: `MarketPostCreateReq`, `List<MultipartFile>`
        ```
        // MarketPostCreateReq
        {
            "mainImageIndex": "Integer",
            "title": "String",
            "category": "Category",
            "price": "Integer",
            "region": "String",
            "description": "String"
        }
        // List<MultipartFile> (imageFiles)
        ```
    *   **Response**: `CommonRes<Long>` (postId)

2.  **Endpoint**: `PATCH /markets/{id}`
    *   **Description**: 거래글 수정
    *   **Request Body**: `MarketPostUpdateReq`, `List<MultipartFile>`
        ```
        // MarketPostUpdateReq
        {
            "mainImageIndex": "Integer",
            "title": "String",
            "category": "Category",
            "price": "Integer",
            "region": "String",
            "description": "String"
        }
        // List<MultipartFile> (imageFiles)
        ```
    *   **Response**: `CommonRes<Long>` (id)

3.  **Endpoint**: `DELETE /markets/{id}`
    *   **Description**: 거래글 삭제
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<Long>` (id)

4.  **Endpoint**: `GET /markets/posts`
    *   **Description**: 거래글 목록 조회
    *   **Request Body**: None (Pageable)
    *   **Response**: `CommonRes<Page<MarketPost>>`

5.  **Endpoint**: `GET /markets/posts/{id}`
    *   **Description**: 거래글 상세 조회
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<MarketPost>`

6.  **Endpoint**: `GET /markets/purchases`
    *   **Description**: 구매목록 조회
    *   **Request Body**: None (Pageable)
    *   **Response**: `CommonRes<Page<Purchase>>`

7.  **Endpoint**: `GET /markets/sales`
    *   **Description**: 판매목록 조회
    *   **Request Body**: None (Pageable)
    *   **Response**: `CommonRes<Page<Sale>>`

8.  **Endpoint**: `POST /markets/{id}/like`
    *   **Description**: 찜하기 (찜목록에 추가)
    *   **Request Body**: None (path variable `postId`)
    *   **Response**: `CommonRes<Long>` (wishListId)

9.  **Endpoint**: `DELETE /markets/{id}/like`
    *   **Description**: 찜 취소 (찜목록에서 삭제)
    *   **Request Body**: None (path variable `postId`)
    *   **Response**: `CommonRes<Long>` (postId)

10. **Endpoint**: `GET /markets/like`
    *   **Description**: 찜 목록 조회
    *   **Request Body**: None (Pageable)
    *   **Response**: `ResponseEntity<Page<MarketPostListReq>>`

---

## ChatController

**Base Path**: `/chat-rooms`

1.  **Endpoint**: `POST /chat-rooms`
    *   **Description**: 채팅방 개설
    *   **Request Body**: `ChatRoomCreateReq`
        ```
        {
            "roomName": "String",
            "userEmailList": "List<String>"
        }
        ```
    *   **Response**: `CommonRes<Long>` (chatRoomId)

2.  **Endpoint**: `GET /chat-rooms`
    *   **Description**: 요청을 보낸 유저가 소속된 채팅방 목록 조회
    *   **Request Body**: None
    *   **Response**: `CommonRes<List<ChatRoomSummaryRes>>`

3.  **Endpoint**: `GET /chat-rooms/{roomId}/messages`
    *   **Description**: 메시지 목록 조회
    *   **Request Body**: None (path variable `roomId`)
    *   **Response**: `CommonRes<List<ChatMessageRes>>`

4.  **Endpoint**: `POST /chat-rooms/{roomId}/participants`
    *   **Description**: 참여자 추가
    *   **Request Body**: `List<ChatParticipantAddReq>`
        ```
        [
            {
                "inviteeEmail": "String"
            },
            // ... more ChatParticipantAddReq objects
        ]
        ```
    *   **Response**: `CommonRes<Void>` (null)

5.  **Endpoint**: `DELETE /chat-rooms/{roomId}/participants/me`
    *   **Description**: 채팅방 나가기
    *   **Request Body**: None (path variable `roomId`)
    *   **Response**: `CommonRes<Void>` (null)

6.  **Endpoint**: `GET /chat-rooms/{roomId}/participants`
    *   **Description**: 참여자 목록 조회
    *   **Request Body**: None (path variable `roomId`)
    *   **Response**: `CommonRes<List<ChatParticipantRes>>`

7.  **Endpoint**: `POST /chat-rooms/{roomId}/files`
    *   **Description**: 파일 업로드
    *   **Request Body**: `List<MultipartFile>`
    *   **Response**: `CommonRes<List<String>>` (fileUrls)

---

## AdminRestController

**Base Path**: `/admin`
**Security**: ADMIN role required (`@PreAuthorize("hasRole('ADMIN')")`)

1.  **Endpoint**: `GET /admin/users/list`
    *   **Description**: 탈퇴하지 않은 회원 목록 조회
    *   **Request Body**: None
    *   **Response**: `CommonRes<List<UserListRes>>`

2.  **Endpoint**: `GET /admin/users/detail/{id}`
    *   **Description**: 회원 상세 조회
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<UserDetailRes>`

3.  **Endpoint**: `GET /admin/reports`
    *   **Description**: 모든 신고 조회
    *   **Request Body**: None (Pageable)
    *   **Response**: `CommonRes<Page<Report>>`

4.  **Endpoint**: `GET /admin/reports/{id}`
    *   **Description**: 신고 상세 내용 조회
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<Report>`

5.  **Endpoint**: `POST /admin/reports/{id}`
    *   **Description**: 신고 처리
    *   **Request Body**: `ReportResultReq`
        ```
        {
            "userName": "String",
            "reportResult": "ReportResult" // Enum or String (e.g., "APPROVED", "REJECTED")
        }
        ```
    *   **Response**: `CommonRes<String>`

---

## SseController

**Base Path**: `/sse`

1.  **Endpoint**: `GET /sse`
    *   **Description**: SSE 연결 (클라이언트로부터의 연결 요청)
    *   **Request Body**: None
    *   **Response**: `SseEmitter`

2.  **Endpoint**: `DELETE /sse`
    *   **Description**: SSE 연결 해제
    *   **Request Body**: None
    *   **Response**: `void`

---

## PetController

**Base Path**: `/pets`

1.  **Endpoint**: `POST /pets/register`
    *   **Description**: 유저가 펫 등록
    *   **Request Body**: `PetRegisterReq`, `MultipartFile` (petImg)
        ```
        // PetRegisterReq
        {
            "name": "String",
            "age": "Integer",
            "gender": "Gender", // Enum (e.g., "MALE", "FEMALE")
            "weight": "BigDecimal",
            "url": "String",
            "birthday": "LocalDate", // YYYY-MM-DD
            "speciesId": "Long"
        }
        // MultipartFile (petImg)
        ```
    *   **Response**: `CommonRes<String>`

2.  **Endpoint**: `GET /pets/list`
    *   **Description**: 유저가 등록한 애완동물 목록 조회
    *   **Request Body**: None
    *   **Response**: `CommonRes<List<Pet>>`

3.  **Endpoint**: `PUT /pets/{id}`
    *   **Description**: 유저가 등록한 펫 수정
    *   **Request Body**: `PetRegisterReq`, `MultipartFile` (petImg)
        ```
        // PetRegisterReq
        {
            "name": "String",
            "age": "Integer",
            "gender": "Gender", // Enum (e.g., "MALE", "FEMALE")
            "weight": "BigDecimal",
            "url": "String",
            "birthday": "LocalDate", // YYYY-MM-DD
            "speciesId": "Long"
        }
        // MultipartFile (petImg)
        ```
    *   **Response**: `CommonRes<String>`

4.  **Endpoint**: `DELETE /pets/{id}`
    *   **Description**: 유저가 등록한 펫 삭제
    *   **Request Body**: None (path variable `id`)
    *   **Response**: `CommonRes<String>`

---

## SpeciesController

**Base Path**: `/species`

1.  **Endpoint**: `GET /species/list`
    *   **Description**: Species 목록 조회
    *   **Request Body**: None
    *   **Response**: `CommonRes<List<SpeciesListRes>>`

2.  **Endpoint**: `GET /species/search`
    *   **Description**: Species 검색
    *   **Request Body**: `SpeciesSearchReq` (as `@ModelAttribute`, typically URL parameters)
        ```
        {
            "petOrder": "String",
            "species": "String",
            "size": "Size" // Enum (e.g., "SMALL", "MEDIUM", "LARGE")
        }
        ```
    *   **Response**: `CommonRes<List<SpeciesListRes>>`

---

## STOMP Endpoints (WebSocket)

These endpoints are handled via WebSocket STOMP messages, not traditional HTTP requests. Request bodies are described conceptually as they are not standard JSON/form data.

### StompController

**Base Path**: (STOMP)

1.  **Endpoint**: `MESSAGE /app/chat-rooms/{roomId}/chat-message`
    *   **Description**: 채팅 메시지 전송
    *   **Request Body**: `ChatMessageReq` (Conceptual: `{"message": "String", "sender": "String"}`)
    *   **Response**: (Published via Redis)

2.  **Endpoint**: `MESSAGE /app/chat-rooms/{roomId}/invite`
    *   **Description**: 채팅방에 사용자 초대
    *   **Request Body**: `List<ChatParticipantAddReq>` (Conceptual: `[{"inviteeEmail": "String"}, ...]`)
    *   **Response**: (Published via Redis)

3.  **Endpoint**: `MESSAGE /app/chat-rooms/{roomId}/leave`
    *   **Description**: 채팅방 나가기
    *   **Request Body**: None
    *   **Response**: (Published via Redis)

4.  **Endpoint**: `MESSAGE /app/chat-rooms/{roomId}/online`
    *   **Description**: 사용자 온라인 상태 알림
    *   **Request Body**: `ChatOnlineParticipantReq` (Conceptual: `{"email": "String"}`)
    *   **Response**: (Published via Redis)

5.  **Endpoint**: `MESSAGE /app/chat-rooms/{roomId}/offline`
    *   **Description**: 사용자 오프라인 상태 알림 및 메시지 읽음 처리
    *   **Request Body**: `ChatOnlineParticipantReq` (Conceptual: `{"email": "String"}`)
    *   **Response**: (Published via Redis)
