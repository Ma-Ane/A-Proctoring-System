import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const UpcomingExams = () => {

  // for nmavigation to a new page
  const navigate = useNavigate();

  // for now we are fetching exams only for BCT batch
  const batch = "BCT";

  // for kati oota upcoming exam teskoo lagiiii
  const [upcomingExam, setUpcomingExam] = useState([]);

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



  // check if exam is present for that batch or not
  if (upcomingExam.length === 0) return <p className='absolute top-1/2 text-xl left-1/2'>No any upcoming exams. Relax !!</p>
  else return (
    <ul className='flex flex-col gap-3 mt-4 text-lg'>
        {
          // if upcoming exam is present in the db
           upcomingExam.map((exam, index) => (
                <li className='flex' key={index}>
                    <span className='flex-[1]'>{index+1}</span>

                    <span className='flex-[4]'>
                      <Link to={`take-exam/${exam._id}`}>
                        <p 
                          className='hover:cursor-pointer w-fit'
                        >
                            {exam.title}
                        </p>
                      </Link>
                    </span>

                    <span className='flex-[2] text-base'>
                      <p className='p-1 border-2 rounded-md w-fit bg-primary text-white'>{exam.type}</p>
                    </span>

                    <span className='flex-[2] text-base'>
                      <p className='p-1'>{exam.time}</p>
                    </span>
                    
                    <span className='flex-[2]'>{exam.date.split('T')[0]}</span>

                    {/* image milaunuu parxa  */}
                    <span className='flex-[1]'><img src="logo.webp" alt="" className='size-6 rounded-full'/></span>
                </li>
            ))
        }
    </ul>
  )
}

export default UpcomingExams;