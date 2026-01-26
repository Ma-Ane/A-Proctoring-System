import React, { useEffect, useState } from 'react'

const Result = () => {
    const [userName, setuserName] = useState('');

    // taking the email of the logged in user
    const email = localStorage.getItem("email");

    // a sample of the exam results to be printed
    const [examResults, setExamResults] = useState([
        {
            title: "Computer Test",
            date: "2002-01-01",
            status: "Graded",
            score: 70,
        },
        {
            title: "Computer Test",
            date: "2002-01-01",
            status: "Graded",
            score: 70,
        },
        {
            title: "Computer Test",
            date: "2002-01-01",
            status: "Graded",
            score: 70,
        },
    ]);

    // fetch the exam history of the user
    useEffect(() => {
        const fetchExamHistory= async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/auth/get_exam/${encodeURIComponent(email)}`);
                
                const data = await response.json();
                setExamResults(data);
                // console.log("Exam history fetched");
            } catch (error) {
                console.log("Error fetching exam history", error);
            }
        };

        setuserName(localStorage.getItem('name'));
        fetchExamHistory();
    }, []);

  return (
    <div className='home flex flex-col items-center gap-4'>
        {/* section for student image and name  */}
        <section className='flex flex-col gap-3 items-center'>
            <img 
                src="logo.webp" 
                alt="" 
                className='size-28 rounded-full'
            />
            
            <h1 className='text-lg sm:text-xl md:text-2xl font-bold'>{userName}</h1>

        </section>

        {/* to show the results of the user  */}
        <div className='flex flex-col w-full mt-10'>
            <ul className='grid grid-cols-2 sm:flex flex-col'>
                <li className=' flex flex-col sm:grid text-xl font-bold mb-6 md:grid-cols-5 sm:grid-cols-3 gap-2'>
                    <span>S.N</span>
                    <span>Title</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span>Marks</span>
                </li>

                {/* loop through the fetched result of the user  */}
                {
                    examResults.map((exam, index) => (
                        <li key={index} className='grid text-base mb-6 md:grid-cols-5 sm:grid-cols-3 gap-2'>
                            <span className='flex-[1]'>{index+1}</span>
                            <span className='flex-[5]'>{exam.title}</span>
                            <span className='flex-[1]'>{exam.date.split("T")[0]}</span>
                            <span className={`flex-[1] ${exam.status === 'Graded' ? 'text-green-600' : 'text-red-600'}`}>{exam.status}</span>
                            <span className='flex-[1]'>{exam.score}</span>
                        </li>
                    ))
                }
            </ul>
        </div>
    </div>
  )
}

export default Result