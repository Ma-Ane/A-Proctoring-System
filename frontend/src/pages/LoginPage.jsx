import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

    const navigate = useNavigate();

    // for checking if login or sign up y user
    const [isLogIn, setIsLogIn] = useState(true);

    // for checking if the user uploaded the image or not
    const [imageUploaded, setImageUploaded] = useState(false)

    // for input user photo
    const [fileName, setFileName] = useState("No file chosen");
    const [fileData, setFileData] = useState(null);

    // for storing the login info the user 
    const [logInUser, setLogInUser] = useState({email: "", password: ""})

    // for storing values before creating a new user
    const [tempUser, setTempUser] = useState({
        name: "",
        batch: "",
        age: 1,
        gender: "",
        role: "",
        image: "",
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
        // to check if all the input fields are filled or not (except image)
        const hasEmpty = Object.entries(tempUser)
            .filter(([key]) => key !== "image")
            .some(([_, v]) => v === '' || v === null || v === undefined);


        if (hasEmpty) return alert("All fields are required to be filled")

        // check if the suser has attached their image
        if (!fileData) return alert("No image input");

        try {
            const imageName = `user_${Date.now()}_${fileData.name}`;

            // Payload for MongoDB
            const payload = { ...tempUser, image: imageName };

            // Upload the file
            const formData = new FormData();
            formData.append("image", fileData, imageName);

            const res = await fetch("http://localhost:3000/api/uploads", {
                method: "POST",
                body: formData
            });

            if (!res.ok) return console.log("Error uploading image");
            console.log("Image uploaded successfully");

            // Store user info
            const userRes = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (userRes.ok) {
                const data = await userRes.json();
                alert(`User with ${data.name} created successfully. Please log in.`);
                setIsLogIn(true);   
                // console.log("User created:", data);
            } else {
                const err = await userRes.json();
                console.log("Error creating user:", err);
            }
        } catch (error) {
            console.log("Error creating user", error);
        }
    };


    // for handling the user input image
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFileName(file.name);
            setFileData(file);

            // convert to base64 and store
            const reader = new FileReader();
            reader.onload = () => {
                localStorage.setItem("userImagePreview", reader.result); // just for preview
            };
            reader.readAsDataURL(file);
        }

        setImageUploaded(true);
    };  

    // to handle the login option for the user
    const handleLogIn = async() => {
        try {
            const res = await fetch('http://localhost:3000/api/auth/verify_credentials', {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(logInUser)
            });

            const data = await res.json();

            console.log("A", data)
            
            if (data.error)
                alert(data.error);
            else {
                localStorage.setItem("email", logInUser.email);
                localStorage.setItem("name", data.name);
                localStorage.setItem("image", data.image)
                // alert("User found. Press OK to go to home screen.")
                navigate('/');
            }

        } catch (error) {
            
        }
    };

  return (
    <div className='flex items-center relative justify-center'>
        <img 
            src="login-background.png" 
            alt="Background Image" 
            className='w-screen h-screen object-cover'
        />

        {/* main div for the content  */}
        <div className='p-6 rounded-xl absolute flex flex-col items-center justify-center px-10'>

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
                                value={logInUser.email}
                                onChange={(e) => setLogInUser((prev) => ({...prev, email: e.target.value}))}
                                className='p-1 rounded-md'
                                placeholder='aaa@gmail.com'
                            />
                        </div>

                        {/* for password option  */}
                        <div className='flex flex-col gap-1'>
                            <label className='text-xl'>Password</label>
                            <input
                                type='password'
                                value={logInUser.password}
                                onChange={(e) => setLogInUser((prev) => ({...prev, password: e.target.value}))}
                                className='p-1 rounded-md'
                                placeholder='********'
                            />
                        </div>

                        {/* button for login  */}
                        <button className='button' onClick={handleLogIn}>Login</button>

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
                    <div className='flex flex-col gap-3 w-full mt-1'>
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
                                    <option value="Other">Other</option>
                                </select>
                            </div>                         
                            <div className='flex flex-col gap-1'>
                                <label className='text-xl'>Age</label>
                                <input
                                    type='number'
                                    min="1"
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

                        {/* image of the user  */}
                        <div className='flex justify-between gap-1 text-white text-xl my-3'>
                            <label htmlFor='imageInput' className='hover:cursor-pointer'>{imageUploaded ? "Change picture" : "Select profile image"}</label>
                            {/* <span>{"imageUploaded" ? "✅" : "❌"}</span> */}

                            {/* hidden file input  */}
                            <input 
                                id='imageInput'
                                type='file' 
                                className='hidden'
                                accept='image/'
                                onChange={handleImageChange}
                            />

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
                        <div className='w-full justify-center items-center flex'>
                            <button 
                                className='button !py-2 !px-4 mt-4 !bg-[#bfa6a1] !text-black !rounded-xl'
                                onClick={saveUserToDB}
                            >
                                Sign Up
                            </button>
                        </div>

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