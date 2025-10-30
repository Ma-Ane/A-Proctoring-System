import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const StartExam = () => {

    // get the title of the exam from the req params in link
    const { title } = useParams();


    // to enter full screen
    function enterFullScreen() {
        const elem = document.documentElement; // entire page

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari, Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
    }

    // to exit the full screen
    function exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari, Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    }

    // to enter into full screen on component mount
    useEffect(() => {
        enterFullScreen();
    });

  return (
    <>
        <div>
            {title}
        </div>

    </>
  )
}

export default StartExam