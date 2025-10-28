import React, { useEffect, useState } from 'react'
import CameraStream from '../components/CameraStream';

const TakeExam = () => {

    // to track the page 
    const [page, setPage] = useState(1);

    // to see if the verify user button is clicked
    const [isUserVerify, setIsUserVerify] = useState(false);

    // captured image
    const [capturedImage, setCapturedImage] = useState("");

    // message if the user is verified or not
    const [verifyMessage, setVerifyMessage] = useState(null);


    // to set all the variables to default when mounting the component
    useEffect(() => {
        if (page === 2) {
            // reset verification-related state
            setCapturedImage("");
            setVerifyMessage(null);
            setIsUserVerify(false);
        }
    }, [page]);


    // to check for match from the backend API (face verification)
    const handleVerifyUser = async () => {
        if (!capturedImage) return;

        const formData = new FormData();
        
        // original image from db
        // get the image name of the user from the mongodb and change the image into blob
        try {
            const res = await fetch(`http://localhost:3000/getUserImage/${encodeURIComponent("Ali Baba")}`);

            const data = await res.json();

            // get the image from the uploads folders
            const response = await fetch(`http://localhost:3000/uploads/${data.image}`);
            const blob = await response.blob();
            formData.append('hd_image', blob, 'hd_image.png');

        } catch (error) {
            console.log(error)
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

            // set the output from the backend to the variable
            setVerifyMessage(data.message);
            console.log(data)
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
                    <div className='mt-16 bg-slate-200 p-5'>
                        <p className="text-xl mt-6 text-gray-700">
                            To ensure fairness and security, this exam uses AI-based monitoring. 
                            Please read the following instructions carefully:
                        </p>
                        <ul className="pl-5 text-base text-gray-600 space-y-1 mt-5">
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
                        className={`mt-16 p-5 items-center gap-6 transition-all duration-700 ${verifyMessage === null  ? 'flex flex-col'   : 'grid grid-cols-2 place-items-center gap-20'}`}>

                        <div className='mt-16 p-5  flex flex-col items-center gap-6'>

                            {/* duita hunxa... euta image hernaa ko lagi.... eut chaii info dekhaunee.... tara paxii after verified  */}
                            <CameraStream 
                                isUserVerify={isUserVerify} 
                                onCapture={(img) => setCapturedImage(img)}
                            />

                            <button 
                                className='exam-button' 
                                onClick={() => {
                                    setIsUserVerify((prev) => !prev);
                                    handleVerifyUser() ;
                                }}
                            >Verify
                            </button>               
                        </div>

                        
                        {/* if  something is returned from the model or backend FastAPI  */}
                        {
                            (verifyMessage) && (
                                <div className='flex flex-col gap-3 justify-center items-center'>
                                    <img src='logo.webp' className='size-36'></img>
                                    {/* naam match hunxa ki hudainaa check garnuu parxa  */}
                                    <h1 className='text-2xl'>Ali Baba</h1>
                                </div>
                            )
                        }
                    </div>
                )
            }

            {
                // page to check the micropphone of the user
                (page === 3) && (
                    <div>Check the user microphone</div>
                )
            }
        </>

        <div className="absolute bottom-6 px-10 w-full flex justify-between">
            <button 
                className='exam-button' 
                onClick={() => {
                    if (page === 1) setPage(1)
                    else setPage((prev) => prev-1)
                }}
            >
                Back
            </button>

            <button 
                className='exam-button' 
                onClick={() => {
                    if (page === 3) setPage(3)
                    else setPage((prev) => prev+1)
                }}
            >
                Next
            </button>

        </div>
    </div>
  )
}

export default TakeExam