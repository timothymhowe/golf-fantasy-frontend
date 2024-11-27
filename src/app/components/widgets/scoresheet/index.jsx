import React from 'react';
import Image from "next/image";

const Scoresheet = () => {
    return (
        <div className='w-full'>
            width={100}
            height={100}
            <Image src="/scoring.png" alt="Scoring" className='object-contain w-full h-full'/>
        </div>
    );
};

export default Scoresheet;