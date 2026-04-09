# LMS Backend - Do an 2

## 1) Tu duy thiet ke tong the
- Tach he thong theo 4 domain: Core, Learning, Content, Live.
- Phan quyen bang RBAC: `ADMIN`, `TEACHER`, `STUDENT`.
- Kien truc backend theo MVC: `routes -> controllers -> services -> repositories (Prisma)`.
- Luong user:
  1. Dang ky -> `PENDING`.
  2. Admin approve -> `ACTIVE`.
  3. User login va duoc cap JWT.
- Luong hoc tap:
  - `Program` (CTDT) -> nhieu `Course` -> nhieu `Class`.
  - Student enroll vao `Class`.
  - `Lecture` thuoc `Course`, co nhieu `Module`.
  - `Module` co nhieu `Content` theo `orderIndex` de giu sequence.
  - `Content` co the la `VIDEO`/`DOCUMENT`/`QUIZ`.

## 2) KPI hoc tap de xuat
- `progress`: % hoan thanh noi dung trong lop (0-100).
- `avgScore`: diem trung binh quiz.
- `attendanceRate`: ty le tham gia live session.
- `lastActiveAt`: lan hoc gan nhat.
- `riskLevel`: canh bao hoc vien co nguy co bo hoc (thap/vua/cao).

## 3) Cau truc DB (Prisma)
Schema da co day du cac nhom bang:
- Core: `users`, `roles`, `user_roles`
- Learning: `programs`, `courses`, `classes`, `enrollments`
- Content: `lectures`, `modules`, `contents`, `videos`, `documents`, `quizzes`, `questions`, `answers`
- Live: `live_sessions`, `session_attendance`

## 4) Cai dat va chay
1. Tao file env:
   - Copy `.env.example` -> `.env`
2. Dien thong tin DB vao `DATABASE_URL`.
3. Tao migration + generate client:
   - `npm run prisma:migrate -- --name init_lms`
   - `npm run prisma:generate`
4. Seed role:
   - `npm run seed`
5. Chay backend:
   - `npm run dev`

## 5) API co san (ban dau)
- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Admin User
  - `GET /api/users`
  - `PATCH /api/users/:id/status`
  - `PATCH /api/users/:id/roles`
- Learning
  - `POST /api/learning/programs`
  - `POST /api/learning/courses`
  - `POST /api/learning/classes`
  - `POST /api/learning/enrollments`
- Content
  - `POST /api/content/lectures`
  - `POST /api/content/modules`
  - `POST /api/content/contents`
- Live
  - `POST /api/live/sessions`
  - `POST /api/live/attendance`
- Student
  - `GET /api/student/me`
  - `GET /api/student/progress`
- Teacher
  - `GET /api/teacher/classes`
  - `GET /api/teacher/classes/:classId/students`

## 5.1) Quy tac phan quyen da ap dung
- `ADMIN`
  - Quan tri user, role, tao CTDT/course/lop.
  - Co the thao tac du lieu toan he thong.
- `TEACHER`
  - Tao lop cho chinh minh.
  - Tao module/content cho lecture do minh so huu.
  - Tao live session + diem danh cho lop duoc giao.
  - Xem danh sach va KPI hoc vien trong lop duoc giao.
- `STUDENT`
  - Chi enroll chinh minh vao lop.
  - Xem thong tin profile va KPI hoc tap cua chinh minh.

## 6) Lo trinh phat trien tiep theo
- Them validation chuan cho tat ca request (zod schemas tung endpoint).
- Them upload file/video (S3/Cloudinary/MinIO) va luu metadata.
- Them bai nop quiz va bang ket qua quiz attempt.
- Them tracking xem video/doc theo user de tinh progress chinh xac hon.
- Viet test API (Jest + Supertest).

## 7) Cau truc MVC trong source
- Moi module nam trong `src/modules/<module-name>/`:
  - `<module>.routes.js`: dinh nghia endpoint va middleware.
  - `<module>.controller.js`: nhan request, goi service, tra response.
  - `<module>.service.js`: xu ly nghiep vu/chinh sach phan quyen.
  - `<module>.repository.js`: truy cap DB thong qua Prisma.
- Cac module da theo MVC: `auth`, `users`, `learning`, `content`, `live`, `teacher`, `student`.
