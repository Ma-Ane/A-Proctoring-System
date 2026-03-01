import React, { useEffect, useState } from 'react'
import { useContext } from "react";
import { UserContext } from "../UserContext";

const Portfolio = () => {

    // for now 
    const batch = "BCT";

    // get the user from context
    const { user, loading } = useContext(UserContext);

    
    // for chosing between attendance and personal details 
    const [isAttendance, setIsAttendance] = useState(true);
    
    // for attendance exam
    const [examAttended, setExamAttended] = useState([]);
    
    // for the exams for teacher 
    const [examForTeacher, setExamForTeacher] = useState([]);
    // check if the exam status is changed
    const [toggleStatus, setToggleStatus] = useState(true);
    
    // render the available exams for the user in his/her batch
    useEffect(() => {
        if (!user) return;
        
        const fetchExamInBatch = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/exam/my_exams/${encodeURIComponent(user._id)}`);
                
                const data = await response.json();
                
                setExamAttended(data);
            } catch (error) {
                console.log("Error fetching exams", error);
            }
        };
        fetchExamInBatch();
    }, [user]);
    
    // to fetch the exams cretaed by the teacher account
    const getExamCreated = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/exam/get_exam_teacher/${encodeURIComponent(user._id)}`);
            
            if (!response.ok) throw new Error ("Error while fetching exams for teacher.");
            
            const data = await response.json();
            
            setExamForTeacher(data);
        } catch (error) {
            console.log(error);
        }
    };
    
    // to load the exams for user or the func above (teacher)
    useEffect(() => {
        if (!user) return;
        
        if (user.role === 'Teacher') {
            getExamCreated();
        }
    }, [user, toggleStatus]);
    
    // to change the active status of the exam
    const changeActiveStatus = async (examId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/exam/toggle_active_status/${encodeURIComponent(examId)}`, {
                method: "PATCH"
            });
            
            if (!response.ok) throw new Error("Error in toggle API.");
            
            const data = await response.json();
            setToggleStatus((prev) => !prev);
            console.log(data.message);
        } catch (error) {
            console.log(error);
        }
    };
    
    if (loading) return <p>Loading user data...</p>;
    if (!user) return <p>User not logged in.</p>;

    
    return (
        // main dic for all contents 
        <div className='home flex flex-col items-center gap-4'>

        {/* section for student image and name  */}
        <section className='flex flex-col gap-3 items-center'>
            <img 
                src={`http://localhost:3000/uploads/${user.image}`}
                alt="" 
                className='size-28 rounded-full object-cover'
                />
            <h1 className='text-2xl font-bold'>{user?.name}</h1>
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
                    <ul className='flex flex-col w-full text-base md:text-lg lg:text-xl gap-3'>
                        <li className='flex text-xl font-bold mb-3'>
                            <span className='flex-[1]'>S.N</span>
                            <span className='flex-[5]'>Title</span>
                            <span className='flex-[1]'>Date</span>
                            <span className='flex-[1]'>Status</span>
                        </li>

                        {/* different content for students and teachers  */}
                        {
                            user.role === 'Student' ?
                                /* for students to see which exams did they appear in  */
                                examAttended.map((exam, index) => (
                                    <li key={index} className='flex'>
                                        <span className='flex-[1]'>{index+1}</span>
                                        <span className='flex-[5]'>{exam.title}</span>
                                        <span className='flex-[1]'>{exam.date.split("T")[0]}</span>
                                        <span className={`flex-[1] ${exam.hasAttended ? "text-green-600" : "text-red-600"}`}>{exam.hasAttended ? "Attended" : "Absent"}</span>
                                    </li>
                                ))
                            :
                                // for teachers to check the exmas created by them
                                examForTeacher.map((exam, index) => (
                                    <li key={index} className='flex'>
                                        <span className='flex-[1]'>{index+1}</span>
                                        <span className='flex-[5]'>{exam.title}</span>
                                        <span className='flex-[1]'>{exam.date.split("T")[0]}</span>
                                        <section className='flex-[1] gap-3 flex'>
                                            {/* // for the active status  */}
                                            <span className={`${exam.isActive ? "text-green-600" : "text-red-500"}`}>{exam.isActive ? "Active" : "Ended"}</span>
                                            {/* to show the option to change the status  */}
                                            <i 
                                                className={`${exam.isActive ? "ri-toggle-fill" : "ri-toggle-line"} text-2xl hover:cursor-pointer hover:scale-105`}
                                                onClick={() => changeActiveStatus(exam._id)}
                                            >    
                                            </i>
                                        </section>
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
                        <label className='text-black text-base md:text-lg lg:text-xl font-bold'>Name: </label>
                        <span className='text-lg'>{user.name}</span>
                    </div>
                    
                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-base md:text-lg lg:text-xl  font-bold'>Batch: </label>
                        <span className='text-lg'>{user.batch}</span>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-base md:text-lg lg:text-xl  font-bold'>Gender: </label>
                        <span className='text-lg'>{user.gender}</span>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-base md:text-lg lg:text-xl  font-bold'>Age: </label>
                        <span className='text-lg'>{user.age}</span>
                    </div>

                </section>

                {/* for right side part  */}
                <section className='flex flex-col gap-5'>
                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-base md:text-lg lg:text-xl  font-bold'>Role: </label>
                        <span className='text-lg'>{user.role}</span>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <label className='text-black text-base md:text-lg lg:text-xl  font-bold'>Email: </label>
                        <span className='text-lg'>{user.email}</span>
                    </div>
                </section>
            </div>
        }

    </div>
  )
}

export default Portfolio