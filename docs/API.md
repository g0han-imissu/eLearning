# API Documentation — eLearning System

## Thông tin chung

- **Base URL:** `http://localhost:4000/api`
- **Format:** JSON
- **Authentication:** Bearer Token (JWT)

### Cách xác thực

Sau khi đăng nhập, thêm token vào header của mọi request:
```
Authorization: Bearer <access_token>
```

### Cấu trúc response lỗi

```json
{
  "message": "Mô tả lỗi"
}
```

### Cấu trúc response danh sách (có phân trang)

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Query params phân trang (dùng cho tất cả GET danh sách)

| Param | Mặc định | Mô tả |
|-------|----------|-------|
| `page` | 1 | Số trang |
| `limit` | 10 | Số bản ghi mỗi trang (tối đa 100) |

---

## 1. Authentication

### POST /auth/register — Đăng ký tài khoản

**Không cần token**

**Request body:**
```json
{
  "email": "student@gmail.com",
  "password": "123456",
  "fullName": "Nguyen Van A",
  "phone": "0901234567"
}
```

**Response 201:**
```json
{
  "message": "Register success, waiting admin approval",
  "user": {
    "id": "clx1abc...",
    "email": "student@gmail.com",
    "status": "PENDING"
  }
}
```

**Lỗi:**
| Code | Mô tả |
|------|-------|
| 400 | Dữ liệu không hợp lệ (thiếu trường, email sai định dạng...) |
| 409 | Email đã tồn tại |

---

### POST /auth/login — Đăng nhập

**Không cần token**

**Request body:**
```json
{
  "email": "student@gmail.com",
  "password": "123456"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "clx1abc...",
    "email": "student@gmail.com",
    "fullName": "Nguyen Van A",
    "roles": ["STUDENT"]
  }
}
```

**Lỗi:**
| Code | Mô tả |
|------|-------|
| 401 | Sai email hoặc mật khẩu |
| 403 | Tài khoản chưa được duyệt (status != ACTIVE) |

---

### POST /auth/logout — Đăng xuất *(planned)*

**Cần token**

**Response 200:**
```json
{ "message": "Logged out successfully" }
```

---

### POST /auth/refresh — Làm mới token *(planned)*

**Request body:**
```json
{ "refreshToken": "eyJhbGci..." }
```

**Response 200:**
```json
{ "accessToken": "eyJhbGci..." }
```

---

## 2. Users (ADMIN only)

### GET /users — Danh sách người dùng

**Cần token | Role: ADMIN**

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx1abc...",
      "email": "student@gmail.com",
      "fullName": "Nguyen Van A",
      "phone": "0901234567",
      "status": "PENDING",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "roles": [
        { "role": { "id": "...", "name": "STUDENT" } }
      ]
    }
  ],
  "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

---

### PATCH /users/:id/status — Cập nhật trạng thái người dùng

**Cần token | Role: ADMIN**

**Request body:**
```json
{ "status": "ACTIVE" }
```
> Giá trị hợp lệ: `PENDING`, `ACTIVE`, `INACTIVE`

**Response 200:** Trả về object user đã cập nhật

---

### PATCH /users/:id/roles — Gán role cho người dùng

**Cần token | Role: ADMIN**

**Request body:**
```json
{ "roleNames": ["TEACHER"] }
```
> Giá trị hợp lệ: `ADMIN`, `TEACHER`, `STUDENT`

**Response 200:**
```json
{ "message": "Roles updated" }
```

---

## 3. Learning

### GET /learning/programs — Danh sách chương trình đào tạo

**Cần token**

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx1abc...",
      "code": "CNTT",
      "title": "Công nghệ thông tin",
      "description": "...",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### GET /learning/programs/:id — Chi tiết chương trình *(planned)*

**Cần token**

**Response 200:** Trả về object program kèm danh sách courses

---

### POST /learning/programs — Tạo chương trình đào tạo

**Cần token | Role: ADMIN**

**Request body:**
```json
{
  "code": "CNTT",
  "title": "Công nghệ thông tin",
  "description": "Chương trình đào tạo kỹ sư CNTT"
}
```

**Response 201:** Trả về object program vừa tạo

---

### GET /learning/courses — Danh sách môn học

**Cần token**

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx2...",
      "code": "WEB101",
      "title": "Lập trình Web",
      "program": { "id": "...", "title": "Công nghệ thông tin" },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "total": 20, "page": 1, "limit": 10, "totalPages": 2 }
}
```

---

### GET /learning/courses/:id — Chi tiết môn học *(planned)*

**Cần token**

**Response 200:** Trả về object course kèm danh sách classes

---

### POST /learning/courses — Tạo môn học

**Cần token | Role: ADMIN**

**Request body:**
```json
{
  "programId": "clx1abc...",
  "code": "WEB101",
  "title": "Lập trình Web",
  "description": "Học HTML, CSS, JavaScript"
}
```

**Response 201:** Trả về object course vừa tạo

---

### GET /learning/classes — Danh sách lớp học

**Cần token**

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx3...",
      "code": "WEB101-01",
      "title": "Lớp Web 01",
      "status": "OPEN",
      "startDate": "2025-02-01T00:00:00.000Z",
      "endDate": "2025-06-01T00:00:00.000Z",
      "course": { "id": "...", "title": "Lập trình Web" },
      "teacher": { "id": "...", "fullName": "Tran Thi B" },
      "_count": { "enrollments": 32 }
    }
  ],
  "meta": { "total": 15, "page": 1, "limit": 10, "totalPages": 2 }
}
```

---

### GET /learning/classes/:id — Chi tiết lớp học *(planned)*

**Cần token**

**Response 200:** Trả về object class kèm danh sách enrollments và live sessions

---

### POST /learning/classes — Tạo lớp học

**Cần token | Role: ADMIN, TEACHER**

**Request body:**
```json
{
  "courseId": "clx2...",
  "teacherId": "clx_teacher...",
  "code": "WEB101-01",
  "title": "Lớp Web 01",
  "startDate": "2025-02-01T00:00:00.000Z",
  "endDate": "2025-06-01T00:00:00.000Z"
}
```
> Teacher chỉ được tạo lớp cho chính mình (teacherId tự động = id của teacher)

**Response 201:** Trả về object class vừa tạo

---

### POST /learning/enrollments — Đăng ký lớp học

**Cần token | Role: ADMIN, STUDENT**

**Request body:**
```json
{ "classId": "clx3..." }
```
> Student không cần truyền `studentId`, hệ thống tự lấy từ token

**Response 201:**
```json
{
  "id": "clx4...",
  "classId": "clx3...",
  "studentId": "clx_student...",
  "status": "ENROLLED",
  "progress": 0,
  "avgScore": 0
}
```

---

## 4. Content

### GET /content/lectures — Danh sách bài giảng

**Cần token**

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx5...",
      "title": "Bài giảng HTML cơ bản",
      "isPublished": true,
      "course": { "id": "...", "title": "Lập trình Web" },
      "owner": { "id": "...", "fullName": "Tran Thi B" },
      "modules": [
        {
          "id": "...",
          "title": "Chương 1: Giới thiệu HTML",
          "orderIndex": 1,
          "contents": [
            { "id": "...", "title": "Video giới thiệu", "type": "VIDEO", "orderIndex": 1 },
            { "id": "...", "title": "Bài tập 1", "type": "QUIZ", "orderIndex": 2 }
          ]
        }
      ]
    }
  ],
  "meta": { "total": 8, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### GET /content/lectures/:id — Chi tiết bài giảng *(planned)*

**Cần token**

**Response 200:** Trả về bài giảng đầy đủ kèm video/document/quiz

---

### POST /content/lectures — Tạo bài giảng

**Cần token | Role: ADMIN, TEACHER**

**Request body:**
```json
{
  "courseId": "clx2...",
  "title": "Bài giảng HTML cơ bản",
  "description": "Học các thẻ HTML cơ bản"
}
```

**Response 201:** Trả về object lecture vừa tạo

---

### POST /content/modules — Tạo module trong bài giảng

**Cần token | Role: ADMIN, TEACHER**

**Request body:**
```json
{
  "lectureId": "clx5...",
  "title": "Chương 1: Giới thiệu HTML",
  "description": "...",
  "orderIndex": 1
}
```

**Response 201:** Trả về object module vừa tạo

---

### POST /content/contents — Tạo nội dung trong module

**Cần token | Role: ADMIN, TEACHER**

**Request body (Video):**
```json
{
  "moduleId": "clx6...",
  "type": "VIDEO",
  "title": "Video giới thiệu HTML",
  "orderIndex": 1,
  "payload": {
    "videoUrl": "https://youtube.com/...",
    "provider": "youtube",
    "durationSecond": 600
  }
}
```

**Request body (Document):**
```json
{
  "moduleId": "clx6...",
  "type": "DOCUMENT",
  "title": "Slide bài giảng",
  "orderIndex": 2,
  "payload": {
    "fileUrl": "https://storage.example.com/slide.pdf",
    "fileType": "pdf",
    "fileSize": 2048
  }
}
```

**Request body (Quiz):**
```json
{
  "moduleId": "clx6...",
  "type": "QUIZ",
  "title": "Kiểm tra chương 1",
  "orderIndex": 3,
  "payload": {
    "title": "Quiz HTML cơ bản",
    "timeLimitMin": 30,
    "passScore": 60
  }
}
```

**Response 201:** Trả về object content vừa tạo

---

### POST /content/quizzes/:quizId/questions — Thêm câu hỏi vào quiz *(planned)*

**Cần token | Role: ADMIN, TEACHER**

**Request body:**
```json
{
  "content": "HTML viết tắt của gì?",
  "orderIndex": 1,
  "score": 1,
  "answers": [
    { "content": "HyperText Markup Language", "isCorrect": true, "orderIndex": 1 },
    { "content": "High Tech Modern Language", "isCorrect": false, "orderIndex": 2 },
    { "content": "Home Tool Markup Language", "isCorrect": false, "orderIndex": 3 }
  ]
}
```

**Response 201:** Trả về câu hỏi kèm đáp án

---

## 5. Live Session

### GET /live/sessions/:classId — Danh sách buổi học trực tiếp của lớp

**Cần token**

**Path param:** `classId` — ID của lớp học

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx7...",
      "title": "Buổi học 1: Giới thiệu môn học",
      "meetingUrl": "https://meet.google.com/abc-xyz",
      "startAt": "2025-02-10T07:00:00.000Z",
      "endAt": "2025-02-10T09:00:00.000Z",
      "_count": { "attendances": 28 }
    }
  ],
  "meta": { "total": 10, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### POST /live/sessions — Tạo buổi học trực tiếp

**Cần token | Role: ADMIN, TEACHER**

**Request body:**
```json
{
  "classId": "clx3...",
  "title": "Buổi học 1: Giới thiệu môn học",
  "description": "...",
  "meetingUrl": "https://meet.google.com/abc-xyz",
  "startAt": "2025-02-10T07:00:00.000Z",
  "endAt": "2025-02-10T09:00:00.000Z"
}
```

**Response 201:** Trả về object session vừa tạo

---

### POST /live/attendance — Điểm danh sinh viên

**Cần token | Role: ADMIN, TEACHER**

**Request body:**
```json
{
  "sessionId": "clx7...",
  "userId": "clx_student...",
  "status": "PRESENT",
  "joinedAt": "2025-02-10T07:05:00.000Z",
  "durationMin": 110
}
```
> Giá trị `status`: `PRESENT`, `ABSENT`, `LATE`

**Response 200:** Trả về object attendance đã cập nhật

---

### GET /live/sessions/:sessionId/attendance — Danh sách điểm danh *(planned)*

**Cần token | Role: ADMIN, TEACHER**

**Response 200:**
```json
{
  "data": [
    {
      "userId": "...",
      "status": "PRESENT",
      "joinedAt": "2025-02-10T07:05:00.000Z",
      "durationMin": 110,
      "user": { "id": "...", "fullName": "Nguyen Van A", "email": "..." }
    }
  ]
}
```

---

## 6. Student

### GET /student/me — Thông tin cá nhân sinh viên

**Cần token | Role: STUDENT**

**Response 200:**
```json
{
  "id": "clx_student...",
  "email": "student@gmail.com",
  "fullName": "Nguyen Van A",
  "phone": "0901234567",
  "avatarUrl": null,
  "status": "ACTIVE",
  "enrollments": [
    {
      "id": "...",
      "status": "IN_PROGRESS",
      "progress": 45.5,
      "avgScore": 72.0,
      "class": {
        "id": "...",
        "title": "Lớp Web 01",
        "course": { "title": "Lập trình Web" }
      }
    }
  ]
}
```

---

### GET /student/progress — Tiến độ học tập tổng quan

**Cần token | Role: STUDENT**

**Response 200:**
```json
{
  "kpi": {
    "totalClasses": 4,
    "completedClasses": 1,
    "avgProgress": 52.25,
    "avgScore": 68.5
  },
  "enrollments": [
    {
      "id": "...",
      "status": "IN_PROGRESS",
      "progress": 45.5,
      "avgScore": 72.0,
      "class": { "id": "...", "title": "Lớp Web 01" }
    }
  ]
}
```

---

### POST /student/quizzes/:quizId/submit — Nộp bài quiz *(planned)*

**Cần token | Role: STUDENT**

**Request body:**
```json
{
  "answers": [
    { "questionId": "q1...", "answerId": "a1..." },
    { "questionId": "q2...", "answerId": "a3..." }
  ]
}
```

**Response 200:**
```json
{
  "score": 8.0,
  "totalScore": 10.0,
  "passed": true,
  "correctCount": 8,
  "totalQuestions": 10
}
```

---

### GET /student/quizzes/:quizId/result — Kết quả quiz *(planned)*

**Cần token | Role: STUDENT**

**Response 200:** Trả về kết quả bài làm kèm đáp án đúng

---

## 7. Upload

> **Lưu ý:** Upload endpoint phải gọi **trước** khi tạo content. Lấy URL từ response rồi mới gọi `POST /content/contents`.

### POST /upload/video — Upload video lên Cloudinary

**Cần token | Role: ADMIN, TEACHER**

**Request:** `multipart/form-data`, field tên `file`

> Định dạng cho phép: `mp4`, `webm`, `mov` — tối đa 500MB

**Response 200:**
```json
{
  "url": "https://res.cloudinary.com/your_cloud/video/upload/elearning/videos/abc123.mp4",
  "publicId": "elearning/videos/abc123",
  "durationSecond": 360,
  "provider": "cloudinary"
}
```

---

### POST /upload/document — Upload tài liệu lên Cloudinary

**Cần token | Role: ADMIN, TEACHER**

**Request:** `multipart/form-data`, field tên `file`

> Định dạng cho phép: `pdf`, `doc`, `docx` — tối đa 20MB

**Response 200:**
```json
{
  "url": "https://res.cloudinary.com/your_cloud/raw/upload/elearning/documents/abc123.pdf",
  "publicId": "elearning/documents/abc123",
  "fileType": "application/pdf",
  "fileSize": 204800,
  "provider": "cloudinary"
}
```

---

### POST /upload/image — Upload ảnh lên Cloudinary

**Cần token**

**Request:** `multipart/form-data`, field tên `file`

> Định dạng cho phép: `jpg`, `png`, `webp` — tối đa 5MB. Ảnh tự động resize tối đa 800px.

**Response 200:**
```json
{
  "url": "https://res.cloudinary.com/your_cloud/image/upload/elearning/images/abc123.jpg",
  "publicId": "elearning/images/abc123",
  "provider": "cloudinary"
}
```

---

### Luồng upload video hoàn chỉnh

```
Bước 1: POST /api/upload/video  → nhận { url, durationSecond }
Bước 2: POST /api/content/contents với payload:
{
  "type": "VIDEO",
  "payload": {
    "videoUrl": "<url từ bước 1>",
    "durationSecond": <durationSecond từ bước 1>,
    "provider": "cloudinary"
  }
}
```

---

## 8. Teacher

### GET /teacher/classes — Danh sách lớp đang dạy

**Cần token | Role: TEACHER, ADMIN**

**Response 200:**
```json
[
  {
    "id": "clx3...",
    "code": "WEB101-01",
    "title": "Lớp Web 01",
    "status": "OPEN",
    "course": {
      "title": "Lập trình Web",
      "program": { "title": "Công nghệ thông tin" }
    },
    "_count": {
      "enrollments": 32,
      "liveSessions": 10
    }
  }
]
```

---

### GET /teacher/classes/:classId/students — Danh sách sinh viên trong lớp

**Cần token | Role: TEACHER, ADMIN**

**Response 200:**
```json
{
  "classId": "clx3...",
  "metrics": {
    "totalStudents": 32,
    "completedStudents": 5,
    "inProgressStudents": 20,
    "avgProgress": 48.2,
    "avgScore": 65.4
  },
  "enrollments": [
    {
      "id": "...",
      "status": "IN_PROGRESS",
      "progress": 60.0,
      "avgScore": 75.0,
      "student": {
        "id": "...",
        "email": "student@gmail.com",
        "fullName": "Nguyen Van A",
        "status": "ACTIVE"
      }
    }
  ]
}
```

---

## Tổng hợp endpoints

| Method | Endpoint | Role | Trạng thái |
|--------|----------|------|-----------|
| POST | /auth/register | Public | ✅ Hoàn thành |
| POST | /auth/login | Public | ✅ Hoàn thành |
| POST | /auth/logout | Public | 🔜 Planned |
| POST | /auth/refresh | Public | 🔜 Planned |
| GET | /users | ADMIN | ✅ Hoàn thành |
| PATCH | /users/:id/status | ADMIN | ✅ Hoàn thành |
| PATCH | /users/:id/roles | ADMIN | ✅ Hoàn thành |
| GET | /learning/programs | All | ✅ Hoàn thành |
| GET | /learning/programs/:id | All | 🔜 Planned |
| POST | /learning/programs | ADMIN | ✅ Hoàn thành |
| GET | /learning/courses | All | ✅ Hoàn thành |
| GET | /learning/courses/:id | All | 🔜 Planned |
| POST | /learning/courses | ADMIN | ✅ Hoàn thành |
| GET | /learning/classes | All | ✅ Hoàn thành |
| GET | /learning/classes/:id | All | 🔜 Planned |
| POST | /learning/classes | ADMIN, TEACHER | ✅ Hoàn thành |
| POST | /learning/enrollments | ADMIN, STUDENT | ✅ Hoàn thành |
| GET | /content/lectures | All | ✅ Hoàn thành |
| GET | /content/lectures/:id | All | 🔜 Planned |
| POST | /content/lectures | ADMIN, TEACHER | ✅ Hoàn thành |
| POST | /content/modules | ADMIN, TEACHER | ✅ Hoàn thành |
| POST | /content/contents | ADMIN, TEACHER | ✅ Hoàn thành |
| POST | /content/quizzes/:id/questions | ADMIN, TEACHER | 🔜 Planned |
| GET | /live/sessions/:classId | All | ✅ Hoàn thành |
| POST | /live/sessions | ADMIN, TEACHER | ✅ Hoàn thành |
| POST | /live/attendance | ADMIN, TEACHER | ✅ Hoàn thành |
| GET | /live/sessions/:id/attendance | ADMIN, TEACHER | 🔜 Planned |
| GET | /student/me | STUDENT | ✅ Hoàn thành |
| GET | /student/progress | STUDENT | ✅ Hoàn thành |
| POST | /student/quizzes/:id/submit | STUDENT | 🔜 Planned |
| GET | /student/quizzes/:id/result | STUDENT | 🔜 Planned |
| GET | /teacher/classes | TEACHER, ADMIN | ✅ Hoàn thành |
| GET | /teacher/classes/:id/students | TEACHER, ADMIN | ✅ Hoàn thành |
| POST | /upload/video | ADMIN, TEACHER | ✅ Hoàn thành |
| POST | /upload/document | ADMIN, TEACHER | ✅ Hoàn thành |
| POST | /upload/image | All | ✅ Hoàn thành |
