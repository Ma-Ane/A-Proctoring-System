import React, { useState } from 'react'

const UpcomingExams = () => {

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

  return (
    <ul className='flex flex-col gap-3 mt-4 text-lg'>
        {
            upcomingExam.map((exam, index) => (
                <li className='flex'>
                    <span className='flex-[1]'>{index+1}</span>
                    <span className='flex-[4]'>{exam.title}</span>
                    <span className='flex-[2] text-base'><p className='p-1 border-gray-300 border-2 rounded-md w-fit'>{exam.type}</p></span>
                    <span className='flex-[2] text-base'><p className='p-1 border-gray-300 border-2 rounded-md w-fit'>{exam.time}</p></span>
                    <span className='flex-[2]'>{exam.date}</span>
                    <span className='flex-[1]'><img src={exam.owner} alt="" className='size-6 rounded-full'/></span>
                </li>
            ))
        }
    </ul>
  )
}

export default UpcomingExams