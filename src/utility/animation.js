import { animate } from "framer-motion"

export const slideUp = (delay)=>{
    console.log("delay " + delay);
    return {
        inital:{
            y: -50,
            opacity: 0
        },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                delay:delay,
                duration: 0.5
            }
        },
    }
}