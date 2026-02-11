import { useEffect, useState } from "react";

export default function CheckResult() {
  const userId = localStorage.getItem("userId");

  const [examForTeacher, setExamForTeacher] = useState([]);
  const [examId, setExamId] = useState(null);
  const [attemptCount, setAttemptCount] = useState({});
  const [selectedExamResults, setSelectedExamResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // ---------------- FETCH EXAMS CREATED BY TEACHER ----------------
  const getExamCreated = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/exam/get_exam_teacher/${encodeURIComponent(userId)}`
      );

      if (!response.ok) throw new Error("Error fetching exams");

      const data = await response.json();
      setExamForTeacher(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- FETCH ATTEMPT COUNT PER EXAM ----------------
  const getAttemptCount = async (examId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/result/student_exam_details/${examId}`
      );

      if (!response.ok) return 0;

      const data = await response.json();
      return data.length;
    } catch {
      return 0;
    }
  };

  // ---------------- FETCH RESULTS + USER DETAILS ----------------
  const getResultsWithUserDetails = async (examId) => {
    try {
      setLoadingResults(true);

      const response = await fetch(
        `http://localhost:3000/result/student_exam_details/${examId}`
      );

      if (!response.ok) {
        setSelectedExamResults([]);
        return;
      }

      const results = await response.json();

      if (results.length === 0) {
        setSelectedExamResults([]);
        return;
      }

      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          try {
            const userRes = await fetch(
              `http://localhost:3000/api/auth/get_user_userId/${result.userId}`
            );

            if (!userRes.ok) {
              return { ...result, name: "Unknown User" };
            }

            const userData = await userRes.json();
            return { ...result, name: userData.name };
          } catch {
            return { ...result, name: "Unknown User" };
          }
        })
      );

      setSelectedExamResults(enrichedResults);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResults(false);
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    getExamCreated();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = {};
      for (const exam of examForTeacher) {
        counts[exam._id] = await getAttemptCount(exam._id);
      }
      setAttemptCount(counts);
    };

    if (examForTeacher.length > 0) fetchCounts();
  }, [examForTeacher]);

  useEffect(() => {
    if (examId) {
      getResultsWithUserDetails(examId);
    }
  }, [examId]);

  // to calculate the scores of all studets for that exam
  const handleCalculateScore = async(req, res) => {
    try {
      const response = await fetch(`http://localhost:3000/result/calculate_score/${encodeURIComponent(examId)}`);

      const data = response.json();
    } catch (error) { 
      console.log(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="mt-5 text-2xl lg:text-4xl font-bold text-center mb-16">
        Results
      </h1>

      {/* ---------------- EXAM LIST ---------------- */}
      {examId === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {examForTeacher.map((exam) => (
            <div
              key={exam._id}
              onClick={() => setExamId(exam._id)}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
            >
              <h2 className="text-xl font-bold mb-2">{exam.title}</h2>

              <p className="text-gray-600">
                <span className="font-semibold">Subject:</span> {exam.subject}
              </p>

              <p className="text-gray-600">
                <span className="font-semibold">Date:</span>{" "}
                {exam.date.split("T")[0]}
              </p>

              <p className="mt-3 font-bold text-gray-700">
                Students Attempted: {attemptCount[exam._id] ?? "Loading..."}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- RESULT LIST ---------------- */}
      {examId !== null && (
        <div className="mt-6">
          <button
            onClick={() => {
              setExamId(null);
              setSelectedExamResults([]);
            }}
            className="mb-4 px-3 py-1 border rounded hover:bg-gray-100"
          >
            ← Back to Exams
          </button>

          {loadingResults ? (
            <p className="text-center">Loading results...</p>
          ) : selectedExamResults.length === 0 ? (
            <p className="text-center text-gray-600 font-semibold">
              No students have taken the exam.
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {selectedExamResults.map((result) => (
                  <div
                    key={result._id}
                    className={`flex justify-between items-center border rounded-md p-4 ${
                      result.score > 0.5 ? "bg-green-200" : "bg-red-200"
                    }`}
                  >
                    <span className="font-medium">{result.name}</span>

                    <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                      Score: {result.score}
                    </span>
                  </div>
                ))}
              </div>

              {/* Only show calculate score button if results exist */}
              <div className="flex w-full justify-end">
                <button 
                  className="button rounded-lg px-3 py-2 mt-8"
                  onClick={handleCalculateScore}
                >
                  Calculate Score
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
