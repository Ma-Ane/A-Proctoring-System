import React from 'react'

const MenuBar = () => {
  return (
    <div className='flex flex-col bg-background py-10 px-3 gap-10 border-r-2 border-r-gray-500'>

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
                <span>Notifications</span>    
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
    </div>
  )
}

export default MenuBar