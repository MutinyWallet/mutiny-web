import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Receive() {
    const pageMotion = {
        initial: { opacity: 0, x: 0 },
        animate: { opacity: 1, x: 50, transition: { duration: 2 } },
        exit: { opacity: 0, x: 0, transition: { duration: 2 } }
    };

    return (
        <div className="about">
            <motion.div initial="initial" animate="animate" exit="exit" variants={pageMotion}>about page</motion.div>
            <Link to="/">Go to home page</Link>
        </div>
    )
}

export default Receive