import React from 'react';

const SignUpForm = ({ title, firstName, setFirstName, lastName, setLastName, phoneNumber, setPhoneNumber, displayName, setDisplayName, email, setEmail, password, setPassword, handleSignUp, error }) => (
    <form onSubmit={handleSignUp} className='flex flex-col space-y-4 justify-center'>
        {error && <p className='text-red-500'>{error}</p>}

        <div className='flex items-center space-x-2 justify-end'>
            <label htmlFor='firstName'>First Name:</label>
            <input
                id='firstName'
                type='text'
                placeholder='First Name'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className='border-2 border-gray-300 p-2 rounded-md'
            />
        </div>
        <div className='flex items-center space-x-2 justify-end'>
            <label htmlFor='lastName'>Last Name:</label>
            <input
                id='lastName'
                type='text'
                placeholder='Last Name'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className='border-2 border-gray-300 p-2 rounded-md'
            />
        </div>
        <div className='flex items-center space-x-2 justify-end'>
            <label htmlFor='phoneNumber'>Phone Number:</label>
            <input
                id='phoneNumber'
                type='text'
                placeholder='Phone Number'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className='border-2 border-gray-300 p-2 rounded-md'
            />
        </div>
        <div className='flex items-center space-x-2 justify-end'>
            <label htmlFor='displayName'>Display Name:</label>
            <input
                id='displayName'
                type='text'
                placeholder='Display Name'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className='border-2 border-gray-300 p-2 rounded-md'
            />
        </div>
        <div className='flex items-center space-x-2 justify-end'>
            <label htmlFor='email'>Email:</label>
            <input
                id='email'
                type='email'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='border-2 border-gray-300 p-2 rounded-md'
            />
        </div>
        <div className='flex items-center space-x-2 justify-end'>
            <label htmlFor='password'>Password:</label>
            <input
                id='password'
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='border-2 border-gray-300 p-2 rounded-md'
            />
        </div>
        <button type='submit' className='bg-blue-500 text-white p-2 rounded-md'>
            Sign Up
        </button>
    </form>
);

export default SignUpForm;