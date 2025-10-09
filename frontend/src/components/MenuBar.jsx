import React, { useState } from 'react'

const MenuBar = () => {

    // to show if notification is clicked ot not
    const [isnotification , setIsNotification] = useState(false);
    

  return (
    <div className='relative flex flex-col bg-background py-10 px-3 gap-10 border-r-2 border-r-gray-500'>

        {/* show if notification is clicked  */}
        {
            isnotification && 
                <div 
                    className='absolute top-0 left-0 opacity-80 bg-black w-screen h-screen flex items-center justify-center' 
                    onClick={() => setIsNotification(false)}
                >
                    <div 
                        className='bg-primary text-white w-1/3 h-1/2 rounded-3xl flex items-center justify-center z-10' 
                        onClick={(e) => e.stopPropagation()}
                    >
                    <p className='text-2xl'>Notification</p>
                    </div>
                </div>
        }

        {/* a div for logo and name  */}
        <div className='w-full flex flex-col gap-3 items-center'>
            <img 
                src="logo.webp" 
                alt="Logo" 
                className='rounded-full size-20'
            />
            <h1 className='text-2xl'>A Proctoring System</h1>
        </div>

        {/* // menu options list  */}
        <ul className='flex flex-col gap-4'>
            <li className='menu__options'>
                <i className="ri-user-line"></i>
                <span>Portfolio</span>    
            </li>
            <li className='menu__options'>
                <i className="ri-notification-3-line"></i>
                <span onClick={() => setIsNotification(true)}>Notifications</span>    
            </li>
            <li className='menu__options'>
                <i className="ri-file-text-line"></i>
                <span>Results</span>    
            </li>
            <li className='menu__options'>
                <i className="ri-reset-left-line"></i>
                <span>Updates</span>    
            </li>
            {/* <li className='menu__options'></li> */}
        </ul>

        {/* settings button at last  */}
        <div className='absolute bottom-3 flex flex-col gap-3 w-full '>
            <hr className="border-gray-700 w-11/12" />
            <section className='flex gap-2 justify-center items-center'>
                <i className="ri-settings-5-line text-2xl"></i>
                <p className='text-xl'>Settings</p>
            </section>
        </div>
    </div>
  )
}

export default MenuBar