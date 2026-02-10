import { useEffect, useState } from "react";


export default function CheckResult() {
  const userId = localStorage.getItem("userId");

  const [selectedExam, setSelectedExam] = useState(null);
  
  const [examForTeacher, setExamForTeacher] = useState([]);

  // fetch the exams created by the teacher
  const getExamCreated = async () => {
      try {
          const response = await fetch(`http://localhost:3000/api/exam/get_exam_teacher/${encodeURIComponent(userId)}`);

          if (!response.ok) throw new Error ("Error while fetching exams for teacher.");

          const data = await response.json();

          setExamForTeacher(data);
          console.log(data);
      } catch (error) {
          console.log(error);
      }
  };

  useEffect(() => {
    getExamCreated();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="mt-5 text-2xl lg:text-4xl font-bold text-center mb-16">Results</h1>

      {/* ---------------- EXAM LIST VIEW ---------------- */}
      {
        !selectedExam && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {examForTeacher.length !== 0 && examForTeacher.map((exam, index) => (
              <div
                key={exam._id}
                onClick={() => setSelectedExam(exam)}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
              >
                <h2 className="text-xl font-bold mb-2">
                  {exam.title}
                </h2>

                <p className="text-base text-gray-600">
                  <span className="font-bold">Subject:</span> {exam.subject}
                </p>

                <p className="text-base text-gray-600">
                  <span className="font-bold">Date:</span> {exam.date.split("T")[0]}
                </p>

                <p className="text-base mt-3 font-bold text-gray-500">
                  Students Attempted: {10}
                </p>
              </div>
            ))}
          </div>
        )
      }

      {/* ---------------- USERS LIST VIEW ---------------- */}
      {selectedExam && (
        <div className="mt-6">
          <button
            onClick={() => setSelectedExam(null)}
            className="mb-4 px-3 py-1 border rounded hover:bg-gray-100"
          >
            ← Back to Exams
          </button>

          <h2 className="text-2xl font-semibold mb-4">
            {selectedExam.title}
          </h2>

          <div className="space-y-3">
            {selectedExam.users.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center border rounded-md p-4"
              >
                <span className="font-medium">
                  {user.name}
                </span>

                <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                  Score: {user.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
