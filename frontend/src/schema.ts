export type UserRole = 'admin' | 'teacher' | 'parent';
export type StudentStatus = 'مقبول' | 'مجاز' | 'متخرج' | 'منسحب';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type QualityRating = 'ممتاز' | 'جيد' | 'يحتاج_مراجعة';

export type User = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
}

export type Student = {
  id: string;
  full_name: string;
  id_number?: string;
  birth_date?: string;
  guardian_phone?: string;
  circle_id: string;
  circle_level: string;
  program: string;
  status: StudentStatus;
  attendance_percentage?: number;
}

export type Circle = {
  id: string;
  name: string;
  teacher_id: string;
  level: string;
  students_count: number;
  location?: string;
}

export type AttendanceRecord = {
  id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
}

export type ProgressRecord = {
  id: string;
  student_id: string;
  surah_name: string;
  start_verse: number;
  end_verse: number;
  completion_date: string;
  quality_rating: QualityRating;
  notes?: string;
}
