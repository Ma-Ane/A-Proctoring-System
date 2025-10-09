import React, { useEffect, useState } from 'react'

const Portfolio = () => {

    // for now 
    const batch = "BCT";

    // paxii user lai fetch garnuu parxaa
    const user = {
        name: "Hari Bansa Acharya",
        batch: "BCT",
        gender: "Male",
        age: 22,
        role: "Student",
        email: "hari_ji@gmail.com"
    };

    // for chosing between attendance and personal details 
    const [isAttendance, setIsAttendance] = useState(true);
    // for attendance exam
    const [examInBatch, setExamInBatch] = useState([]);

    // render the available exams for the user in his/her batch
    useEffect(() => {
        const fetchExamInBatch = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/exam/${encodeURIComponent(batch)}`);

                const data = await response.json();

                setExamInBatch(data);
                console.log(data);
            } catch (error) {
                console.log("Error fetching exams", error);
            }
        };

        fetchExamInBatch();
    }, []);

  return (
    // main dic for all contents 
    <div className='home flex flex-col items-center gap-4'>

        {/* section for student image and name  */}
        <section className='flex flex-col gap-3 items-center'>
            <img 
                src="logo.webp" 
                alt="" 
                className='size-28 rounded-full'
            />
            <h1 className='text-2xl font-bold'>Hari Bansa Acharya</h1>
        </section>

        <section className='flex justify-between w-full px-5 text-xl'>
            <span 
                className={`p-2 hover:cursor-pointer hover:bg-primary rounded-lg ${isAttendance ? 'bg-primary' : ''}`}
                onClick={() => setIsAttendance(true)}
            >
                    Attendance
            </span>
            <span 
                className={`p-2 hover:cursor-pointer hover:bg-primary rounded-lg ${!isAttendance ? 'bg-primary' : ''}`}
                onClick={() => setIsAttendance(false)}
            >
                    Personal Details
            </span>
        </section>

        <hr className="border-gray-700 w-full" />

        {/* show whether attendace or personal details section  */}
        {
            isAttendance === true ? 
            // attendance section 
                (
                    <ul className='flex flex-col w-full text-lg gap-3'>
                        <li className='flex text-xl font-bold mb-3'>
                            <span className='flex-[1]'>S.N</span>
                            <span className='flex-[5]'>Title</span>
                            <span className='flex-[1]'>Date</span>
                            <span className='flex-[1]'>Status</span>
                        </li>
                        {
                            examInBatch.map((exam, index) => (
                                <li key={index} className='flex'>
                                    <span className='flex-[1]'>{index+1}</span>
                                    <span className='flex-[5]'>{exam.title}</span>
                                    <span className='flex-[1]'>{exam.date.split("T")[0]}</span>
                                    <span className='flex-[1]'>Attended</span>
                                </li>
                            ))
                        }    
                    </ul>
                )
            :
            // personal detials section
            <div className='grid grid-cols-2 w-full gap-6 pt-4 px-3'>
                {/* for left side part  */}
                <section className='flex flex-col gap-5'>
                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Name: </label>
                        <span className='text-lg'>{user.name}</span>
                    </div>
                    
                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Batch: </label>
                        <span className='text-lg'>{user.batch}</span>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Gender: </label>
                        <span className='text-lg'>{user.gender}</span>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Age: </label>
                        <span className='text-lg'>{user.age}</span>
                    </div>

                </section>

                {/* for right side part  */}
                <section className='flex flex-col gap-5'>
                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Role: </label>
                        <span className='text-lg'>{user.role}</span>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Email: </label>
                        <span className='text-lg'>{user.email}</span>
                    </div>
                </section>
            </div>
        }

    </div>
  )
}

export default Portfolio