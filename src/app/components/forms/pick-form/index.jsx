import React, { useState } from 'react';

const PickForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selection, setSelection] = useState('');

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSelectionChange = (e) => {
        setSelection(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
    };

    const handleCancel = () => {
        // Handle cancel logic here
    };

    return (
        <form className="bg-white rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={handleNameChange}
            />
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-3 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
            />
            <select className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline mt-3" value={selection} onChange={handleSelectionChange}>
                <option value="">Select an option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
            </select>
           
           <div className='flex justify-end'>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mr-1 rounded focus:outline-none focus:shadow-outline mt-3" type="button" onClick={handleCancel}>
                Cancel
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-1 rounded focus:outline-none focus:shadow-outline mt-3" type="submit">
                Submit
            </button>
            </div>
        </form>
    );
};

export default PickForm;
