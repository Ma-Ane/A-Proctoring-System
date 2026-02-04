import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const MenuBar = () => {

    // to show if notification is clicked ot not
    const [isnotification , setIsNotification] = useState(false);

    // to check if the setting button is clicked
    const [openSettings, setOpenSettings] = useState(false);
    
    // to set the active menu that is being clicked
    const [activeMenu, setActiveMenu] = useState('home');

    // get the role of the user
    const role = localStorage.getItem("role");

  return (
    <div className='relative flex flex-col bg-background py-10 px-3 gap-10 border-r-2 border-r-gray-200'>

        {/* show if notification is clicked  */}
        {
            isnotification && 
                <div 
                    className='fixed inset-0 opacity-80 bg-black w-screen h-screen flex items-center justify-center' 
                    onClick={() => setIsNotification(false)}
                >
                    <div 
                        className='bg-primary text-white w-11/12 sm:w-2/3 md:w-1/3 h-1/2 rounded-3xl flex items-center justify-center z-10' 
                        onClick={(e) => e.stopPropagation()}
                    >
                    <p className='text-2xl'>Notification</p>
                    </div>
                </div>
        }

        {/* a div for logo and name  */}
        <div className='w-full flex flex-col gap-3 items-center'>
            <Link to='/'>
                <img 
                    src="logo.webp" 
                    alt="Logo" 
                    className='rounded-full size-20'
                />
            </Link>
            <h1 className='text-2xl'>A Proctoring System</h1>
        </div>

        {/* // menu options list  */}
        <ul className='flex flex-col gap-4'>
            <Link to='/' onClick={() => setActiveMenu('home')}>
                <li className={`menu__options ${activeMenu === 'home' ? 'bg-primary text-white hover:!bg-primary' : ''}`}>
                    <i className="ri-home-8-line"></i>
                    <span>Home</span>    
                </li>
            </Link>

            <Link to='/portfolio' onClick={() => setActiveMenu('portfolio')}>
                <li className={`menu__options ${activeMenu === 'portfolio' ? 'bg-primary text-white hover:!bg-primary' : ''}`}>
                    <i className="ri-user-line"></i>
                    <span>Portfolio</span>    
                </li>
            </Link>

                <li onClick={() => setIsNotification(true)} className='menu__options'>
                    <i className="ri-notification-3-line"></i>
                    <span >Notifications</span>    
                </li>

            {
                role === "Student" ?
                    <Link to='/results' onClick={() => setActiveMenu('results')}>
                        <li className={`menu__options ${activeMenu === 'results' ? 'bg-primary text-white hover:!bg-primary' : ''}`}>
                            <i className="ri-file-text-line"></i>
                            <span>Results</span>    
                        </li>
                    </Link>
                :
                    <></>
            }

            <Link to='/instructions' onClick={() => setActiveMenu('instructions')}>
                <li className={`menu__options ${activeMenu === 'instructions' ? 'bg-primary text-white hover:!bg-primary' : ''}`}>
                    <i className="ri-reset-left-line"></i>
                    <span>Instructions</span>    
                </li>
            </Link>

            {
                role === "Teacher" ? 
                    <Link to='/set_questions' onClick={() => setActiveMenu('set_questions')}>
                        <li className={`menu__options ${activeMenu === 'set_questions' ? 'bg-primary text-white hover:!bg-primary' : ''}`}>
                            <i className="ri-questionnaire-line"></i>
                            <span>Questions</span>    
                        </li>
                    </Link>
                : 
                    <></>
            }

            {
                role === "Teacher" ?
                    <Link to='/check_result' onClick={() => setActiveMenu('check_result')}>
                        <li className={`menu__options ${activeMenu === 'check_result' ? 'bg-primary text-white hover:!bg-primary' : ''}`}>
                            <i className="ri-calculator-line"></i>
                            <span>Check Result</span>    
                        </li>
                    </Link>
                :
                    <></>
            }

            {/* <li className='menu__options'></li> */}
        </ul>

        {/* settings button at last  */}
        <div className='absolute bottom-3 flex flex-col gap-3 w-full '>
            <hr className="border-gray-700 w-11/12" />
            <div className='flex gap-2 justify-center items-center hover:cursor-pointer hover:bg-primary hover:p-2 hover:w-[90%] hover:text-white rounded-xl'>
                <i className="ri-settings-5-line text-2xl"></i>
                <p className='text-xl' onClick={() => setOpenSettings(true)}>Settings</p>
            </div>
        </div>
    </div>
  )
}

export default MenuBar