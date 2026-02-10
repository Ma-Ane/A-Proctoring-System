import { useState } from "react";

const subjects = [
  "Maths",
  "Computer Networks",
  "DBMS",
  "Operating Systems",
  "Machine Learning"
];

const SetQuestions = () => {
  const [subject, setSubject] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [questionTitle, setQuestionTitle] = useState("");
  const [type, setType] = useState("");
  const [time, setTime] = useState("");
  const [batch, setBatch] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questions, setQuestions] = useState([]);

  const userId = localStorage.getItem("userId");

  const allOptionsFilled = options.every(opt => opt.trim() !== "");

  const handleOptionChange = (value, index) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);

    if (correctAnswer) {
      setCorrectAnswer("");
    }
  };

  const selectCorrectOption = (option) => {
    if (!allOptionsFilled) return;
    setCorrectAnswer(option);
  };

  const resetForm = () => {
    setQuestionTitle("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
  };

  const addQuestion = () => {
    if (!questionTitle || !allOptionsFilled || !correctAnswer) {
      alert("Please complete the question and select the correct answer");
      return;
    }

    const newQuestion = {
      title: questionTitle,
      options,
      correctAnswer
    };

    setQuestions(prev => [...prev, newQuestion]);
    resetForm();
  };

  const submitExam = async () => {
    let examId;

    // create exam response
    try {
      const payload = {
        title: examTitle,
        subject,
        type,
        createdBy: userId,
        time,
        batch
      };

      // create instance of the exam and get the exam id
      const response = await fetch("http://localhost:3000/api/exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      examId = data.examId;
      console.log("Exam created and id returned.");
    } catch (error) {
      console.log(error);
      return;
    }

    // add the questions to the db
    try {
      const response = await fetch("http://localhost:3000/question/add_questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ examId, questions })
      });

      const data = await response.json();
      if (data.error) console.log(data.error);

      console.log("Questions successfully added.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">

      <h1 className="mt-5 text-2xl lg:text-4xl font-bold text-center">
        Set Questions
      </h1>

      {/* Exam Details */}
      <div className="bg-white shadow rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="font-semibold">Exam Title</label>
          <input
            type="text"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder="Final Exam"
            className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="font-semibold">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Subject --</option>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold">Exam Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Type --</option>
            <option value="Computer">Computer</option>
            <option value="Paper">Paper</option>
            <option value="Oral">Oral</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Duration</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Duration --</option>
            <option value="30 mins">30 mins</option>
            <option value="1 hr">1 hr</option>
            <option value="2 hr">2 hr</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="font-semibold">Batch</label>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Batch --</option>
            <option value="BCT">BCT</option>
            <option value="BCE">BCE</option>
            <option value="BEX">BEX</option>
          </select>
        </div>

      </div>

      {/* Added Questions */}
      {questions.length > 0 && (
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">
            Added Questions ({questions.length})
          </h2>

          <div className="flex flex-col gap-3">
            {questions.map((q, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <p className="font-medium">
                  {idx + 1}. {q.title}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {q.options.map(opt => (
                    <span
                      key={opt}
                      className={`text-sm px-2 py-1 rounded text-center ${
                        opt === q.correctAnswer
                          ? "bg-green-100 text-green-700 font-semibold"
                          : "bg-gray-100"
                      }`}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Form */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col gap-4">

        {/* // input question section  */}
        <div>
          <label className="font-medium">Question</label>
          <textarea
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            className="w-full mt-1 border rounded-lg p-2 resize-none focus:ring-2 focus:ring-blue-400"
            rows={3}
          />
        </div>

        {/* input options section  */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {options.map((opt, index) => (
            <div
              key={index}
              onClick={() => selectCorrectOption(opt)}
              className={`border rounded-lg p-3 transition text-center
                ${allOptionsFilled ? "cursor-pointer hover:border-blue-400" : ""}
                ${correctAnswer === opt ? "border-green-500 bg-green-50" : ""}
              `}
            >
              <input
                type="text"
                value={opt}
                onChange={(e) =>
                  handleOptionChange(e.target.value, index)
                }
                placeholder={`Option ${index + 1}`}
                className="w-full outline-none bg-transparent text-center"
              />
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition"
        >
          Add Question
        </button>
      </div>

      {questions.length > 0 && (
        <button
          onClick={submitExam}
          className="bg-green-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transition shadow-xl"
        >
          Submit Exam
        </button>
      )}
    </div>
  );
};

export default SetQuestions;
