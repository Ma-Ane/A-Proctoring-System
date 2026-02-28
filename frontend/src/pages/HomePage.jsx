import React, { useState } from 'react'
import UpcomingExams from '../components/UpcomingExams';

const HomePage = () => {

  // for the display view of the exams
  const [displayStyle, setDisplayStyle] = useState("list");

  return (
    <div className='home'>
      <h1 className='text-3xl'>Upcoming Exams</h1>

      {/* div for entire line below the heading  */}
      <div className='flex justify-between mt-10 flex-col gap-5 sm:flex-row'>

        {/* for search bar and some filters  */}
        <div className='flex gap-3 w-full'>

          {/* section for search  */}
          <section className='border-black border-2 p-1.5 rounded-lg w-1/3 flex items-center'>
            <i className="ri-search-line hover:cursor-pointer"></i>
            <input 
              type="text" 
              name="search" 
              id="search" 
              placeholder='Search for exam'
              className='border-none ml-4 w-full h-full focus:outline-none'
            />
          </section>

          {/* section for filter button  */}
          <section className='border-black border-2 p-1.5 rounded-lg flex gap-1 hover:cursor-pointer text-white bg-primary'>
            <i className="ri-filter-line text-xl"></i>
            <span className='text-lg'>Filter</span>
          </section>
        </div>

        {/* div for some extra functionality  */}
        <div className='flex gap-3 text-xl'>
          <i 
            className={`p-2 hover:cursor-pointer ri-list-check ${displayStyle === 'list' ? "bg-black text-white" : "bg-white hover:bg-black hover:text-white"}`}
            onClick={() => setDisplayStyle("list")}
          />
          <i 
            className={`p-2 hover:cursor-pointer ${displayStyle === 'grid' ? "bg-black text-white" : "bg-white hover:bg-black hover:text-white"} ri-layout-grid-line`}
            onClick={() => setDisplayStyle("grid")}
          />
          <i 
            className={`p-2 hover:cursor-pointer ${displayStyle === 'block' ? "bg-black text-white" : "bg-white hover:bg-black hover:text-white"} ri-calendar-line`}
            onClick={() => setDisplayStyle("block")}
          />
        </div>
      </div>

        



        {/* display all the ucoming exams from this compoenent  */}
        <UpcomingExams displayStyle={displayStyle}/>

    </div>
  )
}

export default HomePage