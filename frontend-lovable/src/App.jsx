import { Route, Routes } from "react-router-dom"
import Portal from "./pages/Portal"
import TeacherDashboard from "./pages/TeacherDashboard"
import TeacherClass from "./pages/TeacherClass"
import TeacherStudent from "./pages/TeacherStudent"
import TeacherLive from "./pages/TeacherLive"
import StudentDashboard from "./pages/StudentDashboard"
import StudentCourse from "./pages/StudentCourse"
import StudentLive from "./pages/StudentLive"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portal />} />

      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/teacher/class/:classId" element={<TeacherClass />} />
      <Route path="/teacher/class/:classId/student/:studentId" element={<TeacherStudent />} />
      <Route path="/teacher/class/:classId/live" element={<TeacherLive />} />

      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/course/:courseId" element={<StudentCourse />} />
      <Route path="/student/course/:courseId/live" element={<StudentLive />} />
    </Routes>
  )
}
