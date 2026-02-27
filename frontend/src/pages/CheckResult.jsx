import { useEffect, useState } from "react";

export default function CheckResult() {
  const userId = localStorage.getItem("userId");

  const [examForTeacher, setExamForTeacher] = useState([]);
  const [examId, setExamId] = useState(null);
  const [attemptCount, setAttemptCount] = useState({});
  const [selectedExamResults, setSelectedExamResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // to check if any ungraded result is present
  const [isUngraded, setIsUngraded] = useState(false);

  // for the violations of the student for each subject 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentViolations, setStudentViolations] = useState([]);
  const [loadingViolations, setLoadingViolations] = useState(false);

  const [selectedStudentName, setSelectedStudentName] = useState("");

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

  // fetch how many students have appeared for the exam
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
  // for teacher to fetch the exam
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

  // for setting the isUngraded variable
  useEffect(() => {
    if (selectedExamResults.length === 0) {
      setIsUngraded(false);
      return;
    }

    const hasUngraded = selectedExamResults.some(
      (result) => result.score === 0 || result.score === null || result.score === undefined
    );

    setIsUngraded(hasUngraded);
}, [selectedExamResults]);

  // to calculate the scores of all students for that exam
  const handleCalculateScore = async () => {
    if (!isUngraded) {
      alert("All students are already graded.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/result/calculate_score/${encodeURIComponent(examId)}`,
        { method: "POST" }
      );

      if (!response.ok) {
        alert("Failed to calculate scores.");
        return;
      }

      // After calculating, refetch updated results
      await getResultsWithUserDetails(examId);

    } catch (error) {
      console.log(error);
    }
  };

  // ---------------- FETCH VIOLATIONS ----------------
  const fetchViolations = async (userId, examId, name) => {
    try {
      setLoadingViolations(true);
      setSelectedStudent(userId);
      setSelectedStudentName(name);

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

  // ---------------- CLOSE MODAL ----------------
  const closeModal = () => {
    setSelectedStudent(null);
    setStudentViolations([]);
  };

  // --------- to delete any violations by teacher 
  const handleDeleteViolation = async (violationId) => {
    try {
      // Call backend API (we will build it later)
      const response = await fetch(
        `http://localhost:3000/flag/delete_violation/${violationId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        console.error("Failed to delete violation");
        return;
      }

      // Optimistic UI update (remove from state)
      setStudentViolations((prev) =>
        prev.filter((v) => v._id !== violationId)
      );

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
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
              className="border rounded-lg p-4 cursor-pointer hover:shadow-xl transition bg-slate-100"
            >
              <h2 className="text-xl font-extrabold mb-2">{exam.title}</h2>

              <p className="text-gray-600">
                <span className="font-bold">Subject:</span> {exam.subject}
              </p>

              <p className="text-gray-600">
                <span className="font-bold">Date:</span>{" "}
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
            className="mb-4 px-3 py-1 border rounded hover:bg-gray-100 text-xl"
          >
            ←
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
                  <div key={result._id} className="border rounded-md mt-6 hover:scale-105 transition-all">
                    <div
                      className={`flex p-4 justify-between items-center cursor-pointer  rounded-xl`}
                      onClick={() =>
                        fetchViolations(result.userId, examId, result.name)
                      }
                    >
                      <span className="font-medium text-lg">{result.name}</span>

                      <span className={`text-sm px-3 py-2 rounded ${result.score>0.5 ? "bg-green-300" : "bg-red-300"}`}>
                        Score: {result.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Only show calculate score button if results exist */}
              <div className={`flex w-full justify-end`}>
                <button
                  className={`button rounded-lg px-3 py-2 mt-8 ${isUngraded ? "button" : "bg-gray-400 cursor-not-allowed"}`}
                  onClick={handleCalculateScore}
                >
                  Calculate Score
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Violations for each user in full screeen*/}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white w-[90%] h-[85%] rounded-xl shadow-2xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              Violations - {selectedStudentName}
            </h2>

            {loadingViolations ? (
              <p className="text-center">Loading violations...</p>
            ) : studentViolations.length === 0 ? (
              <p className="text-center text-gray-600">
                No violations recorded.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentViolations.map((violation, index) => (
                  <div
                    key={index}
                    className="relative group border rounded-xl p-4 shadow-md hover:shadow-2xl transition"
                  >

                    {/* delete button for removing the violations  */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteViolation(violation._id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-600 text-white text-lg px-2 py-1 rounded hover:bg-red-700"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                    
                    {/* date and time of violations  */}
                    <p className="font-semibold mb-2">
                      {new Date(
                        violation.timestamp * 1000
                      ).toLocaleString()}
                    </p>

                    <p className="text-red-600 mb-3 text-lg">
                      {violation.violation}
                    </p>

                    {/* violations image  */}
                    {violation.screenshot && (
                      <img
                        src={`data:image/jpeg;base64,${violation.screenshot}`}
                        alt="Violation Screenshot"
                        className="w-full rounded-md border"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}