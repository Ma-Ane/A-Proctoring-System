import React, { useEffect, useState } from 'react'

const Portfolio = () => {

    // for now 
    const batch = "BCT";

    // paxii user lai fetch garnuu parxaa

    // for chosing between attendance and personal details 
    const [isAttendance, setIsAttendance] = useState(true);
    const [userName, setuserName] = useState('');
    const [userData, setuserData] = useState(null);

    // for attendance exam
    const [examInBatch, setExamInBatch] = useState([]);

    // render the available exams for the user in his/her batch
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                let email = localStorage.getItem('email');

                if (!email) {
                    console.error("Email not found in localStorage");
                    return;
                }

                const response = await fetch(`http://localhost:3000/api/auth/get_user/${email}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch user");
                }

                const data = await response.json();

                setuserData(data);
                // console.log(data);
            } catch (error) {
                console.log("Error fetching exams", error);
            }
        };
        const fetchExamInBatch = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/exam/${encodeURIComponent(batch)}`);

                const data = await response.json();

                setExamInBatch(data);
                // console.log(data);
            } catch (error) {
                console.log("Error fetching exams", error);
            }
        };

        setuserName(localStorage.getItem('name'));

        fetchUserData();
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
            <h1 className='text-2xl font-bold'>{userName}</h1>
        </section>

        {/* // for attentance and personal details button  */}
        <section className='flex sm:flex-row flex-col justify-between w-full px-5 text-xl'>
            <span 
                className={`p-2 hover:cursor-pointer focus:text-white rounded-lg ${isAttendance ? 'bg-primary text-white' : ''}`}
                onClick={() => setIsAttendance(true)}
            >
                    Attendance
            </span>
            <span 
                className={`p-2 w-fit hover:cursor-pointer hover:bg-primary rounded-lg ${!isAttendance ? 'bg-primary text-white' : ''}`}
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
            <div className='grid lg:grid-cols-2 sm:grid-cols-1 w-full gap-6 pt-4 px-3'>
                {/* for left side part  */}
                <section className='flex flex-col gap-5'>
                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Name: </label>
                        <span className='text-lg'>{userData.name}</span>
                    </div>
                    
                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Batch: </label>
                        <span className='text-lg'>{userData.batch}</span>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Gender: </label>
                        <span className='text-lg'>{userData.gender}</span>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Age: </label>
                        <span className='text-lg'>{userData.age}</span>
                    </div>

                </section>

                {/* for right side part  */}
                <section className='flex flex-col gap-5'>
                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Role: </label>
                        <span className='text-lg'>{userData.role}</span>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-lg font-bold'>Email: </label>
                        <span className='text-lg'>{userData.email}</span>
                    </div>
                </section>
            </div>
        }

    </div>
  )
}

export default Portfolio