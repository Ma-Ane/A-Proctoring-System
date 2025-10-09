import React, { useState } from 'react'
import UpcomingExams from '../components/UpcomingExams';

const HomePage = () => {

  return (
    <div className='home'>
      <h1 className='text-3xl'>Upcoming Exams</h1>

      {/* div for entire line below the heading  */}
      <div className='flex justify-between mt-10'>

        {/* for search bar and some filters  */}
        <div className='flex gap-3 w-full'>

          {/* section for search  */}
          <section className='border-black border-2 p-1.5 rounded-lg w-1/3 flex items-center'>
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              name="search" 
              id="search" 
              placeholder='Search for exam'
              className='border-none ml-4 w-full h-full focus:outline-none'
            />
          </section>

          {/* section for filter button  */}
          <section className='border-black border-2 p-1.5 rounded-lg flex gap-1'>
            <i className="ri-filter-line text-xl"></i>
            <span className='text-lg'>Filter</span>
          </section>
        </div>

        {/* div for some extra functionality  */}
        <div className='flex gap-5 text-xl'>
          <i className="home__show__items ri-list-check"></i>
          <i className="home__show__items ri-layout-grid-line"></i>
          <i className="home__show__items ri-calendar-line"></i>
        </div>
      </div>

        
        {/* for the headings  */}
        <section className=' mt-9 flex text-xl font-bold'>
          <span className='flex-[1]'>S.N</span>
          <span className='flex-[4]'>Title</span>
          <span className='flex-[2]'>Type</span>
          <span className='flex-[2]'>Time</span>
          <span className='flex-[2]'>Date</span>
          <span className='flex-[1]'>Owner</span>
        </section>


        {/* display all the ucoming exams from this compoenent  */}
        <UpcomingExams/>

    </div>
  )
}

export default HomePage