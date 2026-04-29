# 🎯 مواصفات مشروع: نظام إدارة حلقات تحفيظ القرآن الكريم
## وثيقة مواصفات تقنية شاملة للمطورين والمساعدين الذكيين

---

## 📌 معلومات المشروع الأساسية

| البند | القيمة |
|-------|--------|
| **اسم المشروع** | Quran Circle Management System (QCMS) |
| **المرجعية المؤسسية** | حلقات بن خميس – الفصل الدراسي الثاني 1447هـ |
| **نوع النظام** | ويب تطبيقي مؤسسي (Web Application) |
| **الجمهور المستهدف** | إداريو الجمعيات، معلمو الحلقات، الطلاب، أولياء الأمور |
| **اللغة الأساسية** | العربية (مع دعم كامل لـ RTL) |
| **طريقة النشر** | Docker + Cloud/VPS |
| **رخصة المشروع** | خاصة / مؤسسية |

---

## 🎯 الهدف العام

أنت خبير في تطوير أنظمة الويب المؤسسية باستخدام أحدث الممارسات. مهمتك بناء نظام متكامل لإدارة حلقات تحفيظ القرآن الكريم بناءً على ملفات بيانات موجودة مسبقاً، مع تطبيق أعلى معايير الأمان، الأداء، وقابلية التوسع.

**ملاحظة جوهرية:** البيانات الحقيقية للمشروع هي المرجع الإلزامي — لا يُقبل أي تصميم يتجاهلها أو يخالفها.

---

## 🛠️ المكدس التقني المطلوب (إلزامي)

| الطبقة | التقنية | الإصدار / الملاحظات |
|--------|---------|-------------------|
| **الواجهة الأمامية** | Next.js + TypeScript + Tailwind CSS | 14+ مع App Router |
| **إطار الواجهة** | TailAdmin (نسخة Next.js) | https://tailadmin.com/ |
| **الخلفية** | Laravel (API Only Mode) | 10+ مع PHP 8.2+ |
| **قاعدة البيانات** | PostgreSQL | 15+ مع extensions: `uuid-ossp`, `pgcrypto`, `pg_trgm` |
| **المصادقة** | Laravel Sanctum + NextAuth.js | Multi-guard + JWT |
| **إدارة الصلاحيات** | spatie/laravel-permission | Roles: `super_admin`, `admin`, `teacher`, `student`, `parent` |
| **معالجة الإكسل** | maatwebsite/excel | مع Validation و Batch Insert |
| **إدارة الملفات** | spatie/laravel-medialibrary | للصور والمستندات |
| **الوقت الفعلي** | Laravel Reverb أو Pusher | للإشعارات المباشرة |
| **الاختبار** | Pest (Laravel) + Vitest (Next.js) | تغطية >80% |
| **التوثيق** | Scribe أو Swagger | توثيق تلقائي للـ API |
| **النشر** | Docker + docker-compose | جاهز للإنتاج |

---

## 📂 هيكل ملفات البيانات الفعلية (المرجع الإلزامي)

### الملف الأول: `حلقات_بن_خميس_1447_تحضير_الفصل_الدراسي_الثاني.csv`

**وصف الملف:** سجل الحضور اليومي للفصل الدراسي الثاني من عام 1447هـ.

| الحقل | النوع | القيم المسموحة / الملاحظات |
|-------|-------|--------------------------|
| `الاسم` | نص | اسم الطالب كاملاً |
| `الحلقة` | نص | اسم الحلقة (أحد الأسماء العشرة أدناه) |
| `المعلم` | نص | اسم المعلم المسؤول عن الحلقة |
| `[اليوم+التاريخ]` | نص | عمود لكل يوم دراسي (37 يوماً في الفصل) |
| `اجمالي الحضور` | عدد صحيح | إجمالي أيام الحضور |
| `اجمالي الغياب` | عدد صحيح | إجمالي أيام الغياب |
| `اجمالي التأخر` | عدد صحيح | إجمالي أيام التأخر |

**الحلقات الموجودة (11 حلقة):**
الإخاء، الأمانة، التنافس، الإكرام، الأناة، الحلم، الإحسان، الإجلال، التقوى، الإتقان، الصدق

**المعلمون الموجودون (11 معلماً):**
أحمد الشغدري، أحمد مأمون، حسين عبدالعزيز، خالد باحبيب، سيد عبدالحي، شفيق الأقرم، عماد إسماعيل، قناف الشغدري، محمد التوم، منصور الكثيري، عبدالباسط

**قيم الحضور اليومي:**
- `حاضر` — حضر في الموعد
- `غائب` — غاب بدون عذر
- `متأخر` — حضر بعد الموعد
- `مستأذن` — غاب بعذر مسبق
- (فارغ / NaN) — أيام لم تُسجّل بعد

**الإحصاء:**
- إجمالي الطلاب في هذا الملف: **93 طالباً**
- عدد أعمدة الأيام: **37 يوماً دراسياً** ممتدة عبر أشهر الفصل

---

### الملف الثاني: `قاعدة_بيانات_الحلقات.xls`

**وصف الملف:** قاعدة البيانات الرئيسية لجميع الطلاب المسجلين (الحاليين والسابقين) — 928 سجلاً طلابياً.

| الحقل | النوع | القيم / الملاحظات |
|-------|-------|------------------|
| `اسم الطالب` | نص | الاسم الكامل الرباعي |
| `الاسم المختصر` | نص | الاسم الثنائي للاستخدام الداخلي |
| `تاريخ الميلاد` | تاريخ | بصيغة YYYY-MM-DD |
| `العمر` | عدد عشري | محسوب تلقائياً |
| `الجنسية` | نص | يمني، سعودي، مصري، سوداني، صومالي... |
| `رقم الإثبات` | نص | رقم الهوية أو الإقامة |
| `الحي` | نص | حي السكن |
| `الصف` | نص | المرحلة الدراسية في المدرسة |
| `المرحلة` | نص | المرحلة في الحلقة (انظر القيم أدناه) |
| `البرنامج` | نص | البرنامج الدراسي |
| `الحلقة` | نص | اسم الحلقة المسجّل فيها (أو فارغ إن كان متخرجاً) |
| `جوال ولي الأمر1` | نص | رقم الجوال الأول لولي الأمر (مع رمز الدولة) |
| `القرابة1` | نص | صلة القرابة (أب، أم، أخ...) |
| `جوال ولي الأمر 2` | نص | رقم جوال ثانٍ لولي الأمر (اختياري) |
| `القرابة2` | نص | صلة القرابة الثانية (اختياري) |
| `جوال الطالب` | نص | رقم جوال الطالب مباشرة |
| `فصل القبول` | نص | الفصل الدراسي لأول تسجيل (مثال: 1436-1) |
| `حالة الطالب` | نص | الحالة الراهنة (انظر القيم أدناه) |
| `فصول الدراسة` | عدد | عدد الفصول التي أمضاها في الحلقات |
| `سنة الختمة` | نص | سنة ختم القرآن الكريم (إن انطبق) |
| `فصل الانتهاء` | نص | الفصل الدراسي للخروج (إن انطبق) |
| `سبب الانتهاء` | نص | السبب (انتقال، تخرج، سفر...) |

**قيم `حالة الطالب` (8 قيم):**
- `مقبول` — طالب نشط حالياً
- `مجاز` — طالب حصل على إجازة بالقرآن
- `متخرج` — أتم مسيرته في الحلقات
- `مستبعد` — تم استبعاده
- `منسحب` — انسحب باختياره
- `منقطع` — انقطع دون إشعار
- `احتياط` — في قائمة الانتظار

**قيم `المرحلة` (10 قيم):**
دنيا، متوسط، ثانوي، عليا، خاتم، إقراء، رائدة، متخرج، لايدرس، (فارغ)

**قيم `البرنامج` (4 برامج):**
الصفوة، تميز، إبداع، المتخرجين

**قيم `الصف` (15 صف دراسي):**
تمهيدي، أولى–سادس ابتدائي، أولى–ثالث متوسط، أولى–ثالث ثانوي، متخرج

---

## 📥 المرحلة 1: تحليل واستيراد البيانات من الملفات

### ✅ المطلوب تنفيذياً في Laravel:

**1. أوامر Artisan مخصصة:**
```bash
# استيراد قاعدة البيانات الرئيسية
php artisan import:students --file=قاعدة_بيانات_الحلقات.xls

# استيراد سجل الحضور الفصلي
php artisan import:attendance --file=حلقات_بن_خميس_1447.csv --semester=1447-2
```

**2. Classes الاستيراد (maatwebsite/excel):**

```php
// app/Excel/Imports/StudentsImport.php
class StudentsImport implements WithMapping, WithValidation, WithBatchInserts, WithHeadingRow
{
    public function map($row): array
    {
        return [
            'full_name'        => $row['اسم الطالب'],
            'short_name'       => $row['الاسم المختصر'],
            'birth_date'       => $this->parseDate($row['تاريخ الميلاد']),
            'nationality'      => $row['الجنسية'],
            'id_number'        => $row['رقم الإثبات'],
            'district'         => $row['الحي'],
            'school_grade'     => $row['الصف'],
            'circle_level'     => $row['المرحلة'],   // دنيا / متوسط / ثانوي ...
            'program'          => $row['البرنامج'],   // الصفوة / تميز / إبداع ...
            'circle_name'      => $row['الحلقة'],
            'guardian_phone1'  => $row['جوال ولي الأمر1'],
            'guardian_rel1'    => $row['القرابة1'],
            'guardian_phone2'  => $row['جوال ولي الأمر 2'] ?? null,
            'guardian_rel2'    => $row['القرابة2'] ?? null,
            'student_phone'    => $row['جوال الطالب'],
            'enrollment_sem'   => $row['فصل القبول'],  // مثال: 1436-1
            'status'           => $row['حالة الطالب'], // مقبول / مجاز / متخرج ...
            'study_semesters'  => $row['فصول الدراسة'] ?? null,
            'graduation_year'  => $row['سنة الختمة'] ?? null,
            'exit_semester'    => $row['فصل الانتهاء'] ?? null,
            'exit_reason'      => $row['سبب الانتهاء'] ?? null,
        ];
    }

    public function rules(): array
    {
        return [
            'full_name'   => 'required|string|max:200',
            'id_number'   => 'nullable|string',
            'status'      => 'required|in:مقبول,مجاز,متخرج,مستبعد,منسحب,منقطع,احتياط',
            'circle_level'=> 'nullable|in:دنيا,متوسط,ثانوي,عليا,خاتم,إقراء,رائدة,متخرج,لايدرس',
            'program'     => 'nullable|in:الصفوة,تميز,إبداع,المتخرجين',
        ];
    }

    public function batchSize(): int { return 100; }
}
```

```php
// app/Excel/Imports/AttendanceImport.php
// الملف: CSV بأعمدة ديناميكية (37 عموداً للأيام)
class AttendanceImport implements WithMapping, WithHeadingRow
{
    // تكتشف الأعمدة الزمنية تلقائياً (كل عمود غير [الاسم, الحلقة, المعلم, إجمالي...])
    // القيم المسموحة: حاضر | غائب | متأخر | مستأذن | فارغ (لم تُسجَّل)

    public function map($row): array
    {
        $attendanceDays = [];
        foreach ($row as $key => $value) {
            if ($this->isDateColumn($key)) {
                $attendanceDays[$key] = $this->normalizeStatus($value);
            }
        }
        return [
            'student_name'    => $row['الاسم'],
            'circle_name'     => $row['الحلقة'],
            'teacher_name'    => $row['المعلم'],
            'days'            => $attendanceDays,
            'total_present'   => $row['اجمالي الحضور'],
            'total_absent'    => $row['اجمالي الغياب'],
            'total_late'      => $row['اجمالي التأخر'],
        ];
    }

    private function normalizeStatus(?string $val): ?string
    {
        $map = ['حاضر' => 'present', 'غائب' => 'absent', 'متأخر' => 'late', 'مستأذن' => 'excused'];
        return $map[trim($val ?? '')] ?? null;
    }
}
```

**3. معايير الجودة للاستيراد:**
- التحقق من صحة البيانات قبل الإدخال (Validation)
- معالجة الأخطاء وحفظها في `error_log.json`
- دعم التحديث الشرطي (Upsert) بناءً على `id_number` أو `student_phone`
- حفظ نسخة من الملف الأصلي في `storage/app/imports/` مع ربطه بالسجل
- إرجاع تقرير مفصل: `{added: X, updated: Y, errors: Z, file_path: "..."}`

**4. واجهة رفع الملفات في Next.js:**
- مكون `<FileImporter type="students" />` يدعم السحب والإفلات
- معاينة البيانات قبل التأكيد (Preview Table)
- شريط تقدم (Progress Bar) أثناء المعالجة

---

## 🗄️ المرحلة 2: تصميم هيكل قاعدة البيانات (PostgreSQL)

### 🔑 المبادئ التصميمية:
- استخدام UUID كمفاتيح أساسية لجميع الجداول
- تفعيل Soft Deletes للجداول القابلة للحذف المنطقي
- استخدام JSONB للبيانات المرنة (الجداول، الإعدادات، البيانات الإضافية)
- إضافة فهارس (Indexes) للحقول المستخدمة في البحث والفرز

---

### 📐 مخطط الجداول الأساسي

#### 1️⃣ جدول `users` (المستخدمون - جميع الأدوار)

```sql
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(200) NOT NULL,
    phone             VARCHAR(20) UNIQUE NOT NULL,
    email             VARCHAR(255) UNIQUE NULL,
    password          VARCHAR(255) NOT NULL,
    role              VARCHAR(30) CHECK (role IN ('super_admin','admin','teacher','student','parent')),
    avatar            VARCHAR(255) NULL,
    is_active         BOOLEAN DEFAULT TRUE,
    last_login_at     TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    remember_token    VARCHAR(100) NULL,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW(),
    deleted_at        TIMESTAMP NULL
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role  ON users(role) WHERE is_active = TRUE;
```

---

#### 2️⃣ جدول `students` (بيانات الطالب التفصيلية — مستمدة من قاعدة_بيانات_الحلقات.xls)

```sql
CREATE TABLE students (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- الهوية
    full_name        VARCHAR(200) NOT NULL,
    short_name       VARCHAR(100) NULL,
    id_number        VARCHAR(50) UNIQUE NULL,    -- رقم الإثبات (هوية/إقامة)
    nationality      VARCHAR(50) NULL,           -- يمني / سعودي / مصري ...
    birth_date       DATE NULL,
    district         VARCHAR(100) NULL,          -- الحي

    -- المسار الأكاديمي
    school_grade     VARCHAR(50) NULL,           -- أولى ابتدائي ... ثالث ثانوي / متخرج
    circle_level     VARCHAR(30) NULL            -- دنيا / متوسط / ثانوي / عليا / خاتم / إقراء / رائدة / لايدرس
                     CHECK (circle_level IN ('دنيا','متوسط','ثانوي','عليا','خاتم','إقراء','رائدة','متخرج','لايدرس')),
    program          VARCHAR(30) NULL            -- الصفوة / تميز / إبداع / المتخرجين
                     CHECK (program IN ('الصفوة','تميز','إبداع','المتخرجين')),

    -- التسجيل والحالة
    enrollment_sem   VARCHAR(10) NULL,           -- فصل القبول (مثال: 1436-1)
    status           VARCHAR(20) NOT NULL DEFAULT 'مقبول'
                     CHECK (status IN ('مقبول','مجاز','متخرج','مستبعد','منسحب','منقطع','احتياط')),
    study_semesters  INTEGER NULL,               -- عدد فصول الدراسة المكتملة
    graduation_year  VARCHAR(10) NULL,           -- سنة الختمة
    exit_semester    VARCHAR(10) NULL,           -- فصل الانتهاء
    exit_reason      TEXT NULL,                  -- سبب الانتهاء

    -- التواصل
    student_phone    VARCHAR(20) NULL,
    guardian_phone1  VARCHAR(20) NULL,
    guardian_rel1    VARCHAR(20) NULL CHECK (guardian_rel1 IN ('أب','أم','أخ','أخت','عم','خال','جد','أخرى')),
    guardian_phone2  VARCHAR(20) NULL,
    guardian_rel2    VARCHAR(20) NULL,

    -- بيانات مرنة إضافية
    metadata         JSONB DEFAULT '{}'::jsonb,

    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_user     ON students(user_id);
CREATE INDEX idx_students_status   ON students(status);
CREATE INDEX idx_students_level    ON students(circle_level);
CREATE INDEX idx_students_program  ON students(program);
CREATE INDEX idx_students_id_num   ON students(id_number) WHERE id_number IS NOT NULL;
-- دعم البحث العربي النصي
CREATE INDEX idx_students_fullname ON students USING GIN (to_tsvector('arabic', full_name));
```

---

#### 3️⃣ جدول `circles` (الحلقات — الأسماء مستمدة من الملفات الفعلية)

```sql
CREATE TABLE circles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE, -- الإخاء / الأمانة / التنافس ...
    description     TEXT NULL,
    location        VARCHAR(255) NOT NULL,
    location_coords POINT NULL,
    schedule        JSONB NOT NULL, -- {days: ['sun','tue'], time_start: '17:00', time_end: '18:30'}
    capacity        INTEGER CHECK (capacity > 0),
    teacher_id      UUID NOT NULL REFERENCES users(id),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    deleted_at      TIMESTAMP NULL
);

-- البيانات الأولية (seed) للحلقات الإحدى عشر الفعلية:
-- الإخاء، الأمانة، التنافس، الإكرام، الأناة، الحلم، الإحسان، الإجلال، التقوى، الإتقان، الصدق

CREATE INDEX idx_circles_teacher  ON circles(teacher_id) WHERE is_active = TRUE;
CREATE INDEX idx_circles_location ON circles USING GIST (location_coords) WHERE location_coords IS NOT NULL;
```

---

#### 4️⃣ جدول `enrollments` (تسجيل الطلاب في الحلقات)

```sql
CREATE TABLE enrollments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID NOT NULL REFERENCES students(id),
    circle_id   UUID NOT NULL REFERENCES circles(id),
    semester    VARCHAR(10) NOT NULL,   -- مثال: 1447-2
    enrolled_at TIMESTAMP DEFAULT NOW(),
    status      VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active','paused','completed','dropped')),
    notes       TEXT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),

    UNIQUE (student_id, circle_id, semester)
);

CREATE INDEX idx_enrollments_student  ON enrollments(student_id);
CREATE INDEX idx_enrollments_circle   ON enrollments(circle_id);
CREATE INDEX idx_enrollments_semester ON enrollments(semester);
```

---

#### 5️⃣ جدول `attendance` (سجل الحضور اليومي — مستمد من ملف CSV)

```sql
CREATE TABLE attendance (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id),
    date          DATE NOT NULL,
    -- القيم: present | absent | late | excused | null (لم تُسجَّل)
    status        VARCHAR(20) CHECK (status IN ('present','absent','late','excused')) NULL,
    teacher_note  TEXT NULL,
    recorded_by   UUID NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP DEFAULT NOW(),

    UNIQUE (enrollment_id, date)
);

CREATE INDEX idx_attendance_date       ON attendance(date);
CREATE INDEX idx_attendance_enrollment ON attendance(enrollment_id);
CREATE INDEX idx_attendance_absent     ON attendance(status) WHERE status = 'absent';
-- فهرس للغياب المتتالي (لتنبيه أولياء الأمور)
CREATE INDEX idx_attendance_date_status ON attendance(enrollment_id, date DESC, status);
```

---

#### 6️⃣ جدول `attendance_summaries` (الملخصات الفصلية — مستمد من أعمدة الإجمالي في CSV)

```sql
CREATE TABLE attendance_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id   UUID NOT NULL REFERENCES enrollments(id),
    semester        VARCHAR(10) NOT NULL,
    total_present   INTEGER DEFAULT 0,
    total_absent    INTEGER DEFAULT 0,
    total_late      INTEGER DEFAULT 0,
    total_excused   INTEGER DEFAULT 0,
    total_days      INTEGER GENERATED ALWAYS AS
                    (total_present + total_absent + total_late + total_excused) STORED,
    attendance_rate NUMERIC(5,2) GENERATED ALWAYS AS
                    (CASE WHEN (total_present + total_absent + total_late + total_excused) > 0
                     THEN ROUND(total_present::numeric /
                          (total_present + total_absent + total_late + total_excused) * 100, 2)
                     ELSE 0 END) STORED,
    updated_at      TIMESTAMP DEFAULT NOW(),

    UNIQUE (enrollment_id, semester)
);
```

---

#### 7️⃣ جدول `progress_tracking` (تتبع التقدم في الحفظ)

```sql
CREATE TABLE progress_tracking (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID NOT NULL REFERENCES students(id),
    surah_name          VARCHAR(100) NOT NULL,
    surah_number        INTEGER CHECK (surah_number BETWEEN 1 AND 114),
    start_verse         INTEGER CHECK (start_verse >= 1),
    end_verse           INTEGER CHECK (end_verse >= start_verse),
    completion_date     DATE NULL,
    quality_rating      VARCHAR(20) CHECK (quality_rating IN ('ممتاز','جيد','يحتاج_مراجعة')),
    teacher_id          UUID NOT NULL REFERENCES users(id),
    notes               TEXT NULL,
    audio_recording_url VARCHAR(255) NULL,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_progress_student ON progress_tracking(student_id);
CREATE INDEX idx_progress_surah   ON progress_tracking(surah_number);
```

---

## 🌐 المرحلة 3: واجهة برمجة التطبيقات (API)

### 🔗 نقاط النهاية الأساسية (RESTful)

#### الطلاب
```
GET    /api/students                    # قائمة الطلاب (مع فلاتر: الحالة، المرحلة، البرنامج، الحلقة)
GET    /api/students/{id}               # بيانات طالب محدد
POST   /api/students                    # إضافة طالب جديد
PUT    /api/students/{id}               # تعديل بيانات طالب
DELETE /api/students/{id}               # حذف منطقي
GET    /api/students/{id}/attendance    # سجل حضور طالب
GET    /api/students/{id}/progress      # تقدم طالب في الحفظ
```

#### الحلقات
```
GET    /api/circles                     # قائمة الحلقات الإحدى عشر
GET    /api/circles/{id}               # بيانات حلقة محددة (مع قائمة الطلاب)
GET    /api/circles/{id}/attendance    # سجل الحضور لحلقة في فترة زمنية
GET    /api/circles/{id}/stats         # إحصاءات الحلقة (نسب الحضور، توزيع الحالات)
```

#### الحضور
```
POST   /api/attendance/bulk            # تسجيل الحضور لحلقة كاملة ليوم واحد
GET    /api/attendance?circle_id=&date= # استعلام حضور يوم محدد
PUT    /api/attendance/{id}            # تعديل سجل حضور
GET    /api/attendance/absent-streaks  # استعلام الغياب المتتالي (لإشعارات أولياء الأمور)
```

#### الاستيراد
```
POST   /api/import/students            # رفع واستيراد قاعدة_بيانات_الحلقات.xls
POST   /api/import/attendance          # رفع واستيراد ملف الحضور الفصلي CSV
GET    /api/import/logs                # سجل عمليات الاستيراد
```

#### التقارير
```
GET    /api/reports/semester-summary   # ملخص فصل دراسي كامل
GET    /api/reports/attendance-rate    # نسب الحضور مجمّعة
GET    /api/reports/student-status     # توزيع حالات الطلاب (مقبول / متخرج ...)
GET    /api/reports/teacher-overview   # نظرة عامة لكل معلم
```

---

## 🖥️ المرحلة 4: واجهات المستخدم (Next.js)

### 📊 لوحة تحكم المدير (super_admin / admin)

**بطاقات الإحصاء السريعة:**
- إجمالي الطلاب النشطين (`حالة = مقبول`)
- عدد الطلاب المجازين (`حالة = مجاز`)
- متوسط نسبة الحضور الفصلي
- توزيع الطلاب على الحلقات الإحدى عشر

**جدول الطلاب:**
- فلتر بـ: الحالة، المرحلة، البرنامج، الحلقة، الجنسية
- بحث نصي عربي في: الاسم، رقم الإثبات، رقم الجوال
- تصدير إلى Excel

**لوحة الحضور:**
- عرض شبكي لأيام الشهر × طلاب كل حلقة
- ترميز لوني: أخضر (حاضر)، أحمر (غائب)، أصفر (متأخر)، رمادي (مستأذن)، أبيض (غير مسجّل)

---

### 📋 لوحة المعلم (teacher)

- يرى طلاب حلقته فقط
- تسجيل الحضور اليومي بنقرة واحدة لكل طالب
- عرض سجل حضور الطالب بشكل سريع
- إضافة تسجيلات التقدم في الحفظ

---

### 👨‍👧 بوابة ولي الأمر (parent)

- متابعة حضور أبنائه فقط
- استقبال تنبيهات الغياب المتتالي (3 أيام)
- عرض ملخص الفصل الدراسي

---

## 🔔 المرحلة 5: نظام التنبيهات الذكية

### قواعد الإشعار التلقائي:
```php
// تنبيه غياب متتالي — كل ليلة عبر Queue
class CheckConsecutiveAbsences implements ShouldQueue
{
    public function handle(): void
    {
        // استعلام الطلاب الغائبين 3 أيام متتالية أو أكثر
        $absentStudents = DB::select("
            SELECT s.id, s.full_name, s.guardian_phone1, s.guardian_phone2,
                   c.name as circle_name, COUNT(*) as consecutive_days
            FROM attendance a
            JOIN enrollments e ON a.enrollment_id = e.id
            JOIN students s    ON e.student_id    = s.id
            JOIN circles  c    ON e.circle_id     = c.id
            WHERE a.status = 'absent'
              AND a.date >= CURRENT_DATE - INTERVAL '3 days'
            GROUP BY s.id, s.full_name, s.guardian_phone1, s.guardian_phone2, c.name
            HAVING COUNT(*) >= 3
        ");

        foreach ($absentStudents as $student) {
            Notification::send($student, new AbsenceAlertNotification($student));
        }
    }
}
```

**قنوات الإشعار:**
- داخل التطبيق (Real-time عبر Reverb)
- رسالة SMS / واتساب على جوال ولي الأمر الأول (والثاني إن وجد)
- بريد إلكتروني إن كان متاحاً

---

## ⚠️ معايير الأمان الإلزامية

### 🔐 حماية البيانات:
- كلمات المرور: `bcrypt` مع `rounds=12` كحد أدنى
- الحقول الحساسة (الجوال، رقم الإثبات): تشفير في قاعدة البيانات باستخدام `pgcrypto`
```sql
-- تخزين مشفر لرقم الإثبات
INSERT INTO students (id_number_encrypted)
VALUES (pgp_sym_encrypt('1234567890', env('DB_ENCRYPTION_KEY')));
```
- مفاتيح التشفير تُخزن في متغيرات بيئة منفصلة عن الكود

### 🛡️ حماية التطبيق:
- تفعيل CSP headers في Nginx
- تفعيل HSTS للإجبار على HTTPS في الإنتاج
- تعطيل عرض أخطاء Laravel التفصيلية في الإنتاج: `APP_DEBUG=false`
- Rate Limiting على جميع مسارات API

### 📋 التدقيق والمراقبة:
```php
// تسجيل جميع العمليات الحساسة
activity()
    ->performedOn($model)
    ->withProperties(['old' => $old, 'new' => $new])
    ->log('updated');
```
- تنبيه المسؤول عند: محاولات دخول فاشلة متكررة، تغيير صلاحيات، حذف بيانات، استيراد ملفات

### 💾 النسخ الاحتياطي والاستعادة:
- نسخ يومي تلقائي بـ `spatie/laravel-backup`
- تشفير النسخ الاحتياطية قبل رفعها للتخزين السحابي
- اختبار استعادة النسخ شهرياً في بيئة معزولة

---

## 🎯 معيار القبول (Definition of Done)

✅ يُعتبر المشروع مكتملاً وقابلاً للتسليم عندما:

**الوظائف الأساسية:**
- يمكن استيراد ملف `قاعدة_بيانات_الحلقات.xls` (928 سجل) بنجاح خلال أقل من 60 ثانية
- يمكن استيراد ملف الحضور الفصلي CSV (93 طالب × 37 يوم) بنجاح
- تُعرض الحلقات الإحدى عشر بأسمائها الفعلية مع طلابها ومعلميها
- يمكن للمعلم تسجيل الحضور بالقيم الأربع (حاضر/غائب/متأخر/مستأذن)
- يتلقى ولي الأمر تنبيهاً تلقائياً عند غياب ابنه 3 أيام متتالية
- يعمل النظام بكامله عبر `docker-compose up` بدون أخطاء أو تحذيرات حرجة

**الجودة والأداء:**
- جميع الاختبارات تمر بنجاح: `composer test` + `npm test` (تغطية >80%)
- وقت استجابة الـ API أقل من 500ms للطلبات العادية، أقل من 2s للتقارير المعقدة
- تحميل الصفحة الأولى أقل من 3s على اتصال 3G
- لا توجد أخطاء console في المتصفح، ولا logs حرجة في السيرفر

**التوثيق والتجربة:**
- التوثيق كافٍ لمطور جديد لفهم النظام وبدء المساهمة خلال ساعة واحدة
- دليل المستخدم بالعربية واضح ويغطي 90% من السيناريوهات اليومية
- واجهة المستخدم متوافقة مع: موبايل (360px)، تابلت (768px)، ديسكتوب (1440px+)

**الأمان:**
- اجتياز فحص أمان أساسي بـ `npm audit` و `composer security-checker`
- لا توجد بيانات حساسة مخزنة في `localStorage` أو `console.log`
- جميع المسارات الحساسة محمية بـ Rate Limiting و Authentication

---

## 💡 ملاحظات ختامية للمطور الذكي

### 🎨 تجربة المستخدم العربي:
```javascript
// تأكد من:
// - اتجاه النصوص: dir="rtl" و text-align: right
// - التنسيق الهجري: استخدام moment-hijri للعرض (الفصول بصيغة 1447-2)
// - الأسماء: دعم الأحرف العربية في البحث والفرز (pg_trgm)
// - الأرقام: خيار لعرضها بالعربية (٠١٢٣٤٥٦٧٨٩) في الواجهات الرسمية
```

### 🚀 قابلية التوسع المستقبلية:
```javascript
// صمّم الـ API ليكون جاهزاً لـ:
// - تطبيق جوال (Flutter) → نفس الـ API
// - تكامل مع أنظمة خارجية (وزارات، جمعيات) → وثّق الـ Webhooks
// - ميزات ذكية (التعرف الصوتي على التلاوة) → أضف Feature Flags
```

### 🔧 أدوات التطوير الموصى بها:
```bash
# Laravel
composer require --dev laravel/telescope       # مراقبة الطلبات
composer require --dev barryvdh/laravel-debugbar # تصحيح الأخطاء

# Next.js
npm install -D @next/bundle-analyzer           # تحليل حجم الحزمة
npm install -D @playwright/test                # اختبار التكامل

# عام
npm install -D husky lint-staged               # Git hooks للجودة
```

### 🌐 دعم الهجري والتقويم الإسلامي:
```php
// في Laravel:
Carbon::setLocale('ar');
$hijriDate = Carbon::now()->translatedFormat('j F Y هـ'); // مثال: 15 رمضان 1447 هـ

// تنسيق الفصل الدراسي المستخدم في البيانات: YYYY-N (مثال: 1447-2)
// حيث N: 1 = الفصل الأول، 2 = الفصل الثاني، 3 = الفصل الصيفي
```

---

## 📄 ملف `.env.example` مبسط:

```env
# === التطبيق ===
APP_NAME="QCMS - إدارة حلقات بن خميس"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost

# === قاعدة البيانات ===
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=quran_circles
DB_USERNAME=quran_user
DB_PASSWORD=your_secure_password_here
DB_ENCRYPTION_KEY=32_char_encryption_key_here

# === المصادقة ===
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:8000
DEFAULT_ADMIN_PASSWORD=ChangeMe123!

# === الخدمات ===
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# === Reverb/WebSockets ===
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# === البريد ===
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_FROM_ADDRESS="noreply@quran-circles.local"
MAIL_FROM_NAME="${APP_NAME}"

# === التخزين ===
FILESYSTEM_DISK=local
# للإنتاج: FILESYSTEM_DISK=s3
```

---

## 🌱 بيانات أولية للتطوير (Seeder)

```php
// database/seeders/QuranCirclesSeeder.php
public function run(): void
{
    // المعلمون الإحدى عشر الفعليون
    $teachers = [
        'أحمد الشغدري', 'أحمد مأمون', 'حسين عبدالعزيز', 'خالد باحبيب',
        'سيد عبدالحي', 'شفيق الأقرم', 'عماد إسماعيل', 'قناف الشغدري',
        'محمد التوم', 'منصور الكثيري', 'عبدالباسط'
    ];

    // الحلقات الإحدى عشر الفعلية (بأسمائها الحقيقية)
    $circleNames = [
        'الإخاء', 'الأمانة', 'التنافس', 'الإكرام', 'الأناة',
        'الحلم', 'الإحسان', 'الإجلال', 'التقوى', 'الإتقان', 'الصدق'
    ];

    foreach ($circleNames as $i => $name) {
        $teacher = User::factory()->teacher()->create(['name' => $teachers[$i]]);
        Circle::create([
            'name'       => $name,
            'teacher_id' => $teacher->id,
            'location'   => 'المقر الرئيسي',
            'schedule'   => ['days' => ['sun','tue','thu'], 'time_start' => '17:00', 'time_end' => '18:30'],
            'capacity'   => 15,
        ]);
    }

    // مدير النظام
    $admin = User::firstOrCreate(
        ['phone' => '0500000000'],
        ['name' => 'مدير النظام', 'password' => bcrypt(env('DEFAULT_ADMIN_PASSWORD')), 'role' => 'super_admin']
    );
    $admin->assignRole('super_admin');
}
```

---

## 📋 قائمة التسليمات (Checklist)

- [ ] قاعدة البيانات بالجداول السبعة المذكورة
- [ ] استيراد `قاعدة_بيانات_الحلقات.xls` (928 سجل)
- [ ] استيراد ملف الحضور CSV مع دعم الأعمدة الديناميكية (37 يوم)
- [ ] API كامل موثّق بـ Swagger/Scribe
- [ ] لوحة تحكم المدير مع الفلاتر الستة
- [ ] لوحة المعلم بتسجيل الحضور الرباعي
- [ ] بوابة ولي الأمر
- [ ] نظام تنبيهات الغياب المتتالي (3 أيام)
- [ ] تغطية اختبارات >80%
- [ ] Docker + docker-compose جاهز للإنتاج
- [ ] دليل مستخدم بالعربية

---

> 🌟 **تذكير:** الجودة أهم من السرعة. ابدأ صغيراً، اختبر كل جزء، ثم توسع.
>
> 🤲 **دعوة:** اجعل نية المشروع خالصة لخدمة كتاب الله وتسهيل حفظه.
>
> 🚀 **انطلق:** انسخ هذا البرومبت وابدأ التنفيذ خطوة بخطوة.
>
> **بالتوفيق في مشروعك المبارك! 🕌✨**

---
*📄 هذا المشروع مملوك ومؤسسي. يُمنع النسخ أو التوزيع دون إذن كتابي.*