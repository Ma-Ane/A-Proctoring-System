import React from 'react'

const TakeExam = () => {
  return (
    <div className='relative h-screen flex flex-col items-center lg:p-16 md:p-10 sm:p-4'>
        <h1 className='text-5xl'>Ready to take Exam ?</h1>

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

        <div className="absolute bottom-6 px-10 w-full flex justify-between">
            <button className='exam-button'>Back</button>
            <button className='exam-button'>Next</button>
        </div>
    </div>
  )
}

export default TakeExam