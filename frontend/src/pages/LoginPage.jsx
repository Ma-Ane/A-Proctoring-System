import React, { useState } from 'react'

const LoginPage = () => {

    const [isLogIn, setIsLogIn] = useState(true);

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
                                value=''
                                className='p-1 rounded-md'
                                placeholder=''
                            />
                        </div>                         

                        <div className='flex gap-4'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xl'>Batch</label>
                                <select id="gender" name="gender" className='h-full rounded-md'>
                                    <option value="">-- Select --</option>
                                    <option value="bct">BCT</option>
                                    <option value="bce">BCE</option>
                                    <option value="bex">BEX</option>
                                    <option value="other">OtherX</option>
                                </select>
                            </div>                         
                            <div className='flex flex-col gap-1'>
                                <label className='text-xl'>Age</label>
                                <input
                                    type='number'
                                    value=''
                                    className='p-1 rounded-md'
                                    placeholder=''
                                />
                            </div> 

                        </div>

                        <div className='flex gap-4'>                        
                            <div className='flex flex-col gap-1'>
                                <label className='text-xl'>Gender</label>
                                <select id="gender" name="gender" className='h-8 rounded-md'>
                                    <option value="">-- Select --</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>                         
                            <div className='flex flex-col gap-1'>
                                <label className='text-xl'>Role</label>
                                <select id="role" name="role" className='h-full rounded-md'>
                                    <option value="">-- Select --</option>
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                </select>
                            </div>
                        </div>

                        <div className='flex flex-col gap-1'>
                            <label className='text-xl'>Email</label>
                            <input
                                type='email'
                                value=''
                                className='p-1 rounded-md'
                                placeholder=''
                            />
                        </div>    
                                             
                        <div className='flex flex-col gap-1'>
                            <label className='text-xl'>Password</label>
                            <input
                                type='password'
                                value=''
                                className='p-1 rounded-md'
                                placeholder=''
                            />
                        </div>                         

                        {/* sign up button  */}
                        <button className='button mt-2'>Sign Up</button>

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