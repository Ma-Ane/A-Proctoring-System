import { useEffect, useState } from "react";

export default function CheckResult() {
  const userId = localStorage.getItem("userId");

  const [examForTeacher, setExamForTeacher] = useState([]);
  const [examId, setExamId] = useState(null);
  const [attemptCount, setAttemptCount] = useState({});
  const [selectedExamResults, setSelectedExamResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // for the violations of the student for each subject 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentViolations, setStudentViolations] = useState([]);
  const [loadingViolations, setLoadingViolations] = useState(false);

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

  // fetch the violations from the db for that user of the particular exam
  // ---------------- FETCH VIOLATIONS ----------------
  const fetchViolations = async (userId, examId) => {
    try {
      setLoadingViolations(true);
      const response = await fetch(
        `http://localhost:3000/flag/get_student_violations/${encodeURIComponent(examId)}/${encodeURIComponent(userId)}`
      );

      if (!response.ok) {
        setStudentViolations([]);
        return;
      }

      const data = await response.json();
      setStudentViolations(data.violations || []);
    } catch (error) {
      console.error(error);
      setStudentViolations([]);
    } finally {
      setLoadingViolations(false);
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
              className="border rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
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
                  <div key={result._id} className="border rounded-md p-4 mb-2">
                    <div
                      className={`flex p-2 justify-between items-center cursor-pointer ${
                        result.score > 0.5 ? "bg-green-200" : "bg-red-200"
                      }`}
                      onClick={() => {
                        setSelectedStudent(result.userId);
                        
                        // call the API to fetch the violations from db
                        fetchViolations(result.userId, examId); 
                      }}
                    >
                      <span className="font-medium">{result.name}</span>

                      <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                        Score: {result.score}
                      </span>
                    </div>

                    {/* ---------------- Student Violations Section ---------------- */}
                    {selectedStudent === result.userId && (
                      <div className="mt-2 p-2 border-t border-gray-300 bg-gray-50">
                        {loadingViolations ? (
                          <p>Loading violations...</p>
                        ) : studentViolations.length === 0 ? (
                          <p className="text-gray-600 text-sm">No violations for this student.</p>
                        ) : (
                          <ul className="list-disc list-inside text-sm space-y-2">
                            {studentViolations.map((violation, index) => (
                              <li key={index} className="border p-2 rounded bg-red-50">
                                <p>
                                  <span className="font-semibold">
                                    {new Date(violation.timestamp * 1000).toLocaleString()}:
                                  </span>{" "}
                                  {violation.violation}
                                </p>
                                {violation.screenshot && (
                                  <img
                                    src={`data:image/jpeg;base64,${violation.screenshot}`}
                                    alt="Violation Screenshot"
                                    className="mt-1 max-w-xs border rounded"
                                  />
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
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
