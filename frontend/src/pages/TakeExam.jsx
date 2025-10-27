import React, { useEffect, useState } from 'react'
import CameraStream from '../components/CameraStream';

const TakeExam = () => {

    // to track the page 
    const [page, setPage] = useState(1);

    // to see if the verify user button is clicked
    const [isUserVerify, setIsUserVerify] = useState(false);

    // captured image
    const [capturedImage, setCapturedImage] = useState("");

    // to check for match from the backend API (face verification)
    useEffect(() => {
        const verifyUser = async () => {
            if (!capturedImage) return;

            try {
                const payload = {
                    image: capturedImage
                };

                const response = await fetch('http://127.0.0.1:8000/check-verification', {
                    method: "POST", 
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
            } catch (error) {
                
            }
        }
        verifyUser();
    }, [capturedImage]);

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
                    <div className='mt-16 p-5  flex flex-col items-center gap-6'>

                        {/* duita hunxa... euta image hernaa ko lagi.... eut chaii info dekhaunee.... tara paxii after verified  */}
                        <CameraStream 
                            isUserVerify={isUserVerify} 
                            onCapture={(img) => setCapturedImage(img)}
                        />

                        <button 
                            className='exam-button' 
                            onClick={() => setIsUserVerify(true)}>Verify</button>               

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
            <button className='exam-button' onClick={() => setPage((prev) => prev-1)}>Back</button>
            <button className='exam-button' onClick={() => setPage((prev) => prev+1)}>Next</button>
        </div>
    </div>
  )
}

export default TakeExam