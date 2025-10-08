import React, { useState } from 'react'

const LoginPage = () => {

    // for checking if login or sign up y user
    const [isLogIn, setIsLogIn] = useState(false);

    // for storing values before creating a new user
    const [tempUser, setTempUser] = useState({
        name: "",
        batch: "",
        age: 0,
        gender: "",
        role: "",
        email: "", 
        password: ""
    });

    // for setting the valuues in the tempUser
    function handleTempUser (e) {
        const {name, value} = e.target;

        setTempUser((prev) => ({...prev, [name]: value}));
    }

    // save the user to db after clicking the singup button
    const saveUserToDB = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json', // type of data to send
                },
                body: JSON.stringify(tempUser)
            });

            // check if response if ok or not
            if (res.ok) {
                const data = await res.json();
                console.log(data);
            } else {
                const error = await res.json();
                console.log(error);
            }
        } catch (error) {
            console.log("Error creating user", error);
        }
    };

  return (
    <div className='flex items-center relative justify-center'>
        <img 
            src="login-background.jpg" 
            alt="Background Image" 
            className='w-screen h-screen object-cover'
        />

        {/* main div for the content  */}
        <div className='bg-primary p-6 rounded-xl absolute flex flex-col items-center justify-center'>

            <img 
                src="logo.webp" 
                alt="Logo"
                className='size-44 rounded-full' 
            />
            <h1 className='text-3xl font-bold text-white mb-6'>A Proctoring System</h1>

            {/* a div for login  */}
            {
                isLogIn && (
                    <div className='w-full h-full mt-5 flex flex-col gap-5'>
                        {/* <h2 className='text-2xl mb-4'>LogIn Options</h2> */}

                        {/* for email option  */}
                        <div className='flex flex-col gap-1'>
                            <label className='text-xl'>Email</label>
                            <input
                                type='email'
                                value=''
                                className='p-1 rounded-md'
                                placeholder='aaa@gmail.com'
                            />
                        </div>

                        {/* for password option  */}
                        <div className='flex flex-col gap-1'>
                            <label className='text-xl'>Password</label>
                            <input
                                type='password'
                                value=''
                                className='p-1 rounded-md'
                                placeholder='********'
                            />
                        </div>

                        {/* button for login  */}
                        <button className='button'>Login</button>

                        <p className='flex w-full justify-end gap-3 text-white'>
                            Don't have an account? 
                            <span 
                                className='underline hover:cursor-pointer hover:text-secondary'
                                onClick={() => setIsLogIn(false)}
                            >
                                Sign up
                            </span>
                        </p>
                    </div>
                )
            }
            

            {
                /* a div for signupp  */
                !isLogIn && (
                    <div className='flex flex-col gap-3 w-full mt-4'>
                        <div className='flex flex-col gap-1'>
                            <label className='text-xl'>Name</label>
                            <input
                                type='text'
                                name= "name"
                                value={tempUser.name}
                                onChange={handleTempUser}
                                className='p-1 rounded-md'
                                placeholder=''
                            />
                        </div>                         

                        <div className='flex gap-4'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xl'>Batch</label>
                                <select 
                                    id="batch"
                                    name="batch" 
                                    value={tempUser.batch}
                                    onChange={handleTempUser}
                                    className='h-full rounded-md'
                                >
                                    <option value="">-- Select --</option>
                                    <option value="BCT">BCT</option>
                                    <option value="BCE">BCE</option>
                                    <option value="BEX">BEX</option>
                                    <option value="Other">OtherX</option>
                                </select>
                            </div>                         
                            <div className='flex flex-col gap-1'>
                                <label className='text-xl'>Age</label>
                                <input
                                    type='number'
                                    name='age'
                                    value={tempUser.age}
                                    onChange={handleTempUser}
                                    className='p-1 rounded-md'
                                    placeholder=''
                                />
                            </div> 

                        </div>

                        <div className='flex gap-4'>                        
                            <div className='flex flex-col gap-1'>
                                <label className='text-xl'>Gender</label>
                                <select 
                                    id="gender" 
                                    name="gender" 
                                    value={tempUser.gender}
                                    onChange={handleTempUser}
                                    className='h-8 rounded-md'
                                >
                                    <option value="">-- Select --</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>                         
                            <div className='flex flex-col gap-1'>
                                <label className='text-xl'>Role</label>
                                <select 
                                    id="role" 
                                    name="role" 
                                    value={tempUser.role}
                                    onChange={handleTempUser}
                                    className='h-full rounded-md'
                                >
                                    <option value="">-- Select --</option>
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                </select>
                            </div>
                        </div>

                        <div className='flex flex-col gap-1'>
                            <label className='text-xl'>Email</label>
                            <input
                                type='email'
                                name='email'
                                value={tempUser.email}
                                onChange={handleTempUser}
                                className='p-1 rounded-md'
                                placeholder=''
                            />
                        </div>    
                                             
                        <div className='flex flex-col gap-1'>
                            <label className='text-xl'>Password</label>
                            <input
                                type='password'
                                name='password'
                                value={tempUser.password}
                                onChange={handleTempUser}
                                className='p-1 rounded-md'
                                placeholder=''
                            />
                        </div>                         

                        {/* sign up button  */}
                        <button 
                            className='button mt-2'
                            onClick={saveUserToDB}
                        >
                            Sign Up
                        </button>

                        <p className="flex justify-end gap-3 text-white">
                            Already have an account? 
                            <span 
                                className='underline hover:cursor-pointer hover:text-secondary'
                                onClick={() => setIsLogIn(true)}
                            >
                                Log In
                            </span>
                        </p>
                    </div>
                )
            }
            
        </div>
    </div>
  )
}

export default LoginPage