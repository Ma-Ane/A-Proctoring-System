import React, { useEffect, useState } from 'react'

const UpcomingExams = () => {

  // for now we are fetching exams only for BCT batch
  const batch = "BCT";

  // for kati oota upcoming exam teskoo lagiiii
  const [upcomingExam, setUpcomingExam] = useState([
    {
      title: "Computer Test",
      type: "MCQ",
      time: "40 mins",
      date: "Jan 1",
      owner: "logo.webp"
    },
    {
      title: "Computer Test",
      type: "MCQ",
      time: "40 mins",
      date: "Jan 1",
      owner: "logo.webp"
    },
    {
      title: "Computer Test",
      type: "MCQ",
      time: "40 mins",
      date: "Jan 1",
      owner: "logo.webp"
    }
  ]);

  // fetch all the exams for each batch from backend
  useEffect(() => {
    const fetchUpcomingExam = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/exam/${encodeURIComponent(batch)}`);

        const data = await res.json();

        // set the upcomingExam to the fetched data from db
        setUpcomingExam(data);
        // console.log("Exam fetched successfully");
      } catch (error) {
        console.log("Error while fetching upcoming exams", error);
      }
    }

    fetchUpcomingExam();
  }, []);

  return (
    <ul className='flex flex-col gap-3 mt-4 text-lg'>
        {
            upcomingExam.map((exam, index) => (
                <li className='flex' key={index}>
                    <span className='flex-[1]'>{index+1}</span>
                    <span className='flex-[4]'>{exam.title}</span>
                    <span className='flex-[2] text-base'><p className='p-1 border-gray-300 border-2 rounded-md w-fit'>{exam.type}</p></span>
                    <span className='flex-[2] text-base'><p className='p-1 border-gray-300 border-2 rounded-md w-fit'>{exam.time}</p></span>
                    <span className='flex-[2]'>{exam.date.split('T')[0]}</span>
                    <span className='flex-[1]'><img src={exam.owner} alt="" className='size-6 rounded-full'/></span>
                </li>
            ))
        }
    </ul>
  )
}

export default UpcomingExams