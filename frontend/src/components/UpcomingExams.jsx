import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const UpcomingExams = ({ displayStyle }) => {

  // for now we are fetching exams only for BCT batch
  const batch = "BCT";
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  // for kati oota upcoming exam teskoo lagiiii
  const [upcomingExam, setUpcomingExam] = useState([]);

  // fetch all the exams for each batch from backend
  useEffect(() => {
    const fetchUpcomingExam = async () => {
      try {

        // below onee forr not showing the attended exam in upcoming Exam
        const res = await fetch(`http://localhost:3000/api/exam/get_exam_batch/${encodeURIComponent(batch)}`);
        // const res = await fetch(`http://localhost:3000/api/exam/get_exam_batch/${encodeURIComponent(batch)}/${encodeURIComponent(userId)}`);

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
  if (upcomingExam.length === 0) 
    return <p className='absolute top-1/2 text-xl left-1/2'>No any upcoming exams. Relax !!</p>
  else {
    return (
      <div>
        {/* for the headings  */}
        <section className=' mt-9 flex text-xl font-bold'>
          <span className='flex-[1]'>S.N</span>
          <span className='flex-[4]'>Title</span>
          <span className='flex-[2]'>Type</span>
          <span className='flex-[2]'>Time</span>
          <span className='flex-[2]'>Date</span>
          <span className='flex-[1]'>Owner</span>
        </section>
        
        {
          displayStyle === 'list' ? (
            <ul className='flex flex-col gap-3 mt-4 text-lg'>
              {
                upcomingExam.map((exam, index) => (
                  <li className='flex' key={exam._id}>
                    <span className='flex-[1]'>{index + 1}</span>

                    <span className='flex-[4]'>
                      {
                        role === "Teacher" ? (
                          <p className="w-fit">{exam.title}</p>
                        ) : (
                          <Link
                            to={`/take-exam/${exam._id}?title=${encodeURIComponent(exam.title)}`}
                          >
                            <p className="hover:cursor-pointer w-fit">
                              {exam.title}
                            </p>
                          </Link>
                        )
                      }
                    </span>

                    <span className='flex-[2] text-base'>
                      <p className='p-1 border-2 rounded-md w-fit bg-primary text-white'>
                        {exam.type}
                      </p>
                    </span>

                    <span className='flex-[2] text-base'>
                      <p className='p-1'>{exam.time}</p>
                    </span>

                    <span className='flex-[2]'>
                      {exam.date?.split('T')[0]}
                    </span>

                    <span className='flex-[1]'>
                      <img 
                        src={`http://localhost:3000/uploads/${exam.image}`} 
                        alt="Profile"
                        className='size-6 rounded-full'
                      />
                    </span>
                  </li>
                ))
              }
            </ul>
          ) : displayStyle === 'grid' ? (

            <div className="mt-4">
              {/* Grid View */}
              Grid View Coming Soon
            </div>

          ) : displayStyle === 'block' ? (

            <div className="mt-4">
              {/* Block View */}
              Block View Coming Soon
            </div>

          ) : null
        }

      </div>
    
    )
  }

}

export default UpcomingExams;