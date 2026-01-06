import React, { useEffect, useState } from 'react'
import CameraStream from '../components/CameraStream';
import MicrophoneCheck from '../components/MicrophoneCheck';
import { Link, useParams } from 'react-router-dom';

const TakeExam = () => {

    // get the data from the parene about the exam title 
    const { title } = useParams();

    const [userData, setuserData] = useState(null);

    // to track the page 
    const [page, setPage] = useState(1);

    // to see if the verify user button is clicked
    const [isUserVerify, setIsUserVerify] = useState(false);

    // captured image
    const [capturedImage, setCapturedImage] = useState("");

    // message if the user is verified or not
    const [faceVerified, setfaceVerified] = useState(false);

    // set the profile image of the user from the db
    const [userProfileImage, setUserProfileImage] = useState('');

    // to verify if the mic is working
    const [micVerified, setMicVerified] = useState(false);
    const [isMicAvailable, setIsMicAvailable] = useState(true);

    // to set all the variables to default when mounting the component
    useEffect(() => {
        if (page === 2) {
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
                    setUserProfileImage(
                        `http://localhost:3000/uploads/${data.image}`
                    );                     // console.log(data);
                } catch (error) {
                    console.log("Error fetching user data", error);
                }
            };
        
            fetchUserData();
            
                       // reset verification-related state
            setCapturedImage("");
            setfaceVerified(false);
            setIsUserVerify(false);
        }
        
        if (page === 3) {
            setMicVerified(false);
            setIsMicAvailable(true);
        }
    }, [page]);


    // to capture the image of the user
    useEffect(() => {
        if (isUserVerify && capturedImage) {
            handleVerifyUser();
        }
    }, [capturedImage]);

    // to check for match from the backend API (face verification)
    const handleVerifyUser = async () => {
        if (!capturedImage) return;

        const formData = new FormData();

        const email = localStorage.getItem("email");
        
        // Fetch user's stored embedding
        try {
            const res = await fetch(`http://localhost:3000/api/auth/get_embedding/${email}`);
            const data = await res.json();
            formData.append(
            'user_image_embedding',
            JSON.stringify(data )
            );
        } catch (error) {
            console.log("Error fetching embedding:", error);
            alert("Failed to fetch user data for verification.");
            return;
        }

        // image from the user webcam
        // change the image to Blob before sending it to the backend
        const blob = await fetch(capturedImage).then((res) => res.blob());

        // prepare for upload to the backend
        formData.append('webcam_image', blob, 'webcam_image.png');        // name, data, filename

        //////////////////// aahile just eutaa naam diyeraa pathakoo xa
        try {
            const response = await fetch(`http://127.0.0.1:8000/check-verification`, {
                method: "POST", 
                body: formData
            });

            const data = await response.json();

            // if the user face is not detected
            if (data.error) alert(data.error)
                
            // set the output from the backend to the variable
            if (data.message == "Same person") setfaceVerified(true);
            else setfaceVerified(false);
        } catch (error) {
            console.log("Error from verificaiton model", error);
        }
    }


  return (
    <div className='relative h-screen flex flex-col items-center lg:p-16 md:p-10 sm:p-4'>
        <h1 className='text-5xl'>Ready to take Exam ?</h1>

        <>  
            {
                // the first page to show is the instructions page
                (page === 1) && (
                    <div className='mt-16 bg-third rounded-lg pb-10 text-white p-5'>
                        <p className="text-xl mt-6">
                            To ensure fairness and security, this exam uses AI-based monitoring. 
                            Please read the following instructions carefully:
                        </p>
                        <ul className="pl-5 text-base space-y-1 mt-5">
                            <li>✔ Your identity will be verified before starting the exam.</li>
                            <li>✔ Your <b>camera and microphone</b> will remain active during the exam.</li>
                            <li>✔ Only <b>suspicious activities</b> (e.g., multiple faces, unusual sounds, frequent looking away) are recorded.</li>
                            <li>✔ Monitoring is strictly for <b>exam integrity</b> and not shared with others.</li>
                            <li>✔ Sit in a <b>quiet, well-lit place</b> with only yourself visible on screen.</li>
                            <li>✔ Any type of suspicious behaviour will be <b>warned and flagged by the system.</b></li>
                            <li>✔ If you have any complaints or dissatisfaction with the model, you can <b>contact us through mail.</b></li>
                        </ul>
                    </div>
                )
            }

            {
                // second page to verify the user 
                (page === 2) && (
                    <div 
                        className={`mt-16 p-5 items-center gap-6 transition-all duration-1000 ${faceVerified === false  ? 'flex flex-col'   : 'grid sm:grid-cols-2 place-items-center gap-20'}`}>

                        <div className='mt-  flex flex-col items-center gap-6'>

                            {/* duita hunxa... euta image hernaa ko lagi.... eut chaii info dekhaunee.... tara paxii after verified  */}
                            <CameraStream 
                                isUserVerify={isUserVerify} 
                                onCapture={(img) => setCapturedImage(img)}
                            />

                            <button 
                                className='exam-button' 
                                onClick={() => {
                                    setIsUserVerify((prev) => !prev);
                                }}
                            >Verify
                            </button>               
                        </div>

                        
                        {/* if the user is verified then show the profile card */}
                        {
                            (faceVerified) && (
                                <div className='flex flex-col gap-3 items-center h-fit py-5 bg-third text-white w-fit px-6 mt-8 rounded-3xl profile__card'>
                                    <img 
                                        src={userProfileImage} 
                                        className='size-36 object-cover rounded-full mt-3'
                                    />
                                    
                                    <li className='text-2xl font-bold mb-4'>{userData.name}</li>

                                    {/* naam match hunxa ki hudainaa check garnuu parxa  */}
                                    <ul className="flex flex-col gap-4 text-xl">
                                        <li className="grid grid-cols-2">
                                            <label className="font-bold">Batch:</label>
                                            <span>{userData.batch}</span>
                                        </li>

                                        <li className="grid grid-cols-2">
                                            <label className="font-bold">Email:</label>
                                            <span>{userData.email}</span>
                                        </li>

                                        <li className="grid grid-cols-2">
                                            <label className="font-bold">Role:</label>
                                            <span>{userData.role}</span>
                                        </li>
                                    </ul>
                                </div>
                            )
                        }   
                    </div>
                )
            }

            {
                page === 3 && (
                    <>
                        <MicrophoneCheck 
                            micVerified={micVerified} 
                            setMicVerified={setMicVerified}
                            setIsMicAvailable={setIsMicAvailable}
                        />

                        <p className="mt-4 text-lg text-gray-700">
                            {
                                micVerified ? 
                                    "✅ Microphone verified! You can proceed."
                                : 
                                    isMicAvailable ? 
                                        "🎧 Speak something to verify your microphone..."
                                    : 
                                        "❌ No Microphone Detected or Permission Denied"
                            }
                        </p>

                        {
                            micVerified ? 
                                <Link to={`/start-exam/${title}`}>
                                    <button 
                                        className='mt-24 text-2xl bg-primary p-4 rounded-xl text-white hover:cursor-pointer profile__card'
                                    >
                                        Start Exam
                                    </button>
                                </Link>
                            :
                                <div />
                        }
                    </>
                )
            }
        </>

        <div className={`absolute bottom-6 items-end px-10 w-full flex ${page===1 ? "justify-end" : "justify-between"}`}>
            {            
                (page !== 1) ? 
                    <button 
                        className='exam-button' 
                        onClick={() => {
                            setPage((prev) => Math.max(1, prev - 1));
                        }}
                    >
                        Back
                    </button>  
                :
                    <div/>
            } 

            {
                // if last page .i.e 3 then no next button
                (page !== 3) ? 
                    <button 
                        className='exam-button' 
                        onClick={() => {

                            // check if the user is verified or not
                            if (page === 2 && !faceVerified) {
                                alert("Face Verification required.");
                                return;
                            }
                            
                            if (page === 3 && !micVerified) {
                                alert("Microphone verification required.");
                                return;
                            }


                            setPage((prev) => Math.min(3, prev+1));
                        }}
                    >
                        Next
                    </button>
                :
                <div />
            }

        </div>
    </div>
  )
}

export default TakeExam