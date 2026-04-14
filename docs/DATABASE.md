# Database Design — eLearning System

## Entity Relationship Diagram

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String passwordHash
        String fullName
        String phone
        String avatarUrl
        UserStatus status
        DateTime createdAt
        DateTime updatedAt
    }

    Role {
        String id PK
        String name UK
        DateTime createdAt
    }

    UserRole {
        String userId FK
        String roleId FK
        DateTime assignedAt
    }

    Program {
        String id PK
        String code UK
        String title
        String description
        DateTime createdAt
        DateTime updatedAt
    }

    Course {
        String id PK
        String programId FK
        String code UK
        String title
        String description
        DateTime createdAt
        DateTime updatedAt
    }

    Class {
        String id PK
        String courseId FK
        String teacherId FK
        String code UK
        String title
        DateTime startDate
        DateTime endDate
        ClassStatus status
        DateTime createdAt
        DateTime updatedAt
    }

    Enrollment {
        String id PK
        String classId FK
        String studentId FK
        EnrollmentStatus status
        Decimal progress
        Decimal avgScore
        DateTime completedAt
        DateTime createdAt
        DateTime updatedAt
    }

    Lecture {
        String id PK
        String courseId FK
        String ownerId FK
        String title
        String description
        Boolean isPublished
        DateTime createdAt
        DateTime updatedAt
    }

    Module {
        String id PK
        String lectureId FK
        String title
        String description
        Int orderIndex
        DateTime createdAt
        DateTime updatedAt
    }

    Content {
        String id PK
        String moduleId FK
        ContentType type
        String title
        Int orderIndex
        DateTime createdAt
        DateTime updatedAt
    }

    Video {
        String id PK
        String contentId FK
        String provider
        String videoUrl
        Int durationSecond
    }

    Document {
        String id PK
        String contentId FK
        String fileUrl
        String fileType
        Int fileSize
    }

    Quiz {
        String id PK
        String contentId FK
        String title
        Int timeLimitMin
        Decimal passScore
    }

    Question {
        String id PK
        String quizId FK
        String content
        Int orderIndex
        Decimal score
    }

    Answer {
        String id PK
        String questionId FK
        String content
        Boolean isCorrect
        Int orderIndex
    }

    LiveSession {
        String id PK
        String classId FK
        String title
        String description
        String meetingUrl
        DateTime startAt
        DateTime endAt
        DateTime createdAt
    }

    SessionAttendance {
        String sessionId FK
        String userId FK
        AttendanceStatus status
        DateTime joinedAt
        Int durationMin
    }

    User ||--o{ UserRole : "has"
    Role ||--o{ UserRole : "assigned to"
    User ||--o{ Enrollment : "enrolls as student"
    User ||--o{ Class : "teaches"
    User ||--o{ Lecture : "owns"
    User ||--o{ SessionAttendance : "attends"

    Program ||--o{ Course : "contains"
    Course ||--o{ Class : "has"
    Course ||--o{ Lecture : "has"

    Class ||--o{ Enrollment : "has"
    Class ||--o{ LiveSession : "has"

    Lecture ||--o{ Module : "contains"
    Module ||--o{ Content : "contains"

    Content ||--o| Video : "is"
    Content ||--o| Document : "is"
    Content ||--o| Quiz : "is"

    Quiz ||--o{ Question : "has"
    Question ||--o{ Answer : "has"

    LiveSession ||--o{ SessionAttendance : "tracks"
```

---

## Mô tả các bảng

### Nhóm Người dùng

| Bảng | Mô tả |
|------|-------|
| `users` | Lưu thông tin tài khoản. `status`: PENDING (chờ duyệt) → ACTIVE → INACTIVE |
| `roles` | 3 vai trò: ADMIN, TEACHER, STUDENT |
| `user_roles` | Bảng trung gian nhiều-nhiều giữa user và role. 1 user có thể có nhiều role |

### Nhóm Học tập

| Bảng | Mô tả |
|------|-------|
| `programs` | Chương trình đào tạo (ví dụ: "Kỹ thuật phần mềm") |
| `courses` | Môn học thuộc một chương trình (ví dụ: "Lập trình Web") |
| `classes` | Lớp học cụ thể của một môn, do 1 giáo viên phụ trách |
| `enrollments` | Sinh viên đăng ký lớp. Lưu tiến độ (`progress`) và điểm TB (`avgScore`) |

### Nhóm Nội dung

| Bảng | Mô tả |
|------|-------|
| `lectures` | Bài giảng tổng thể của một môn học |
| `modules` | Chương/phần trong bài giảng, có thứ tự (`orderIndex`) |
| `contents` | Nội dung cụ thể trong module, có 3 loại: VIDEO, DOCUMENT, QUIZ |
| `videos` | Chi tiết video: URL, độ dài |
| `documents` | Chi tiết tài liệu: URL file, loại file, kích thước |
| `quizzes` | Bài kiểm tra: thời gian làm bài, điểm đạt |
| `questions` | Câu hỏi trong quiz |
| `answers` | Đáp án của câu hỏi, đánh dấu đáp án đúng |

### Nhóm Học trực tiếp

| Bảng | Mô tả |
|------|-------|
| `live_sessions` | Buổi học trực tuyến của một lớp, có link meeting |
| `session_attendance` | Điểm danh sinh viên trong buổi học: trạng thái, giờ vào, thời lượng |

---

## Enums

| Enum | Giá trị |
|------|---------|
| `UserStatus` | PENDING, ACTIVE, INACTIVE |
| `ClassStatus` | DRAFT, OPEN, CLOSED, ARCHIVED |
| `EnrollmentStatus` | ENROLLED, IN_PROGRESS, COMPLETED, DROPPED |
| `ContentType` | VIDEO, DOCUMENT, QUIZ |
| `AttendanceStatus` | PRESENT, ABSENT, LATE |
