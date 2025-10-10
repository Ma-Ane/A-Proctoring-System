import React from 'react'

const Instructions = () => {
  return (

    // yoo paxiii exam start hunuu aagadii rakhneee ho
    // <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-4">
    // <h2 className="text-xl font-bold text-gray-800 text-center">Before You Begin</h2>
    
    // <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm">
    //     <li>Your identity will be verified using face recognition.</li>
    //     <li>Your webcam and microphone will be monitored throughout the exam.</li>
    //     <li>Only suspicious activities are recorded for review.</li>
    //     <li>All monitoring is strictly for exam security purposes.</li>
    // </ol>
    
    // <p className="text-gray-600 text-sm">
    //     By continuing, you agree to this monitoring. Please ensure you are in a quiet, well-lit place, with only yourself visible on screen.
    // </p>
    
    // <button className="w-full py-2 bg-blue-600 text-white rounded-lg mt-4">Start Exam</button>
    // </div>

    <div className='home'>
        <h1 className='text-4xl font-bold'>Instructions</h1>

        <p className="text-xl mt-10 text-gray-700">
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

export default Instructions