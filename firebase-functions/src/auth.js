const functions = require('firebase-functions');
const fetch = require('node-fetch');

exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user;
    
    // Call your Flask API to create user
    const response = await fetch('http://localhost:5000/api/user/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': functions.config().api.key // We'll set this up later
      },
      body: JSON.stringify({
        firebase_uid: uid,
        email: email || '',
        display_name: displayName || '',
        photo_url: photoURL || ''
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    console.log(`Successfully created user record for ${uid}`);
    return { success: true };

  } catch (error) {
    console.error('Error creating user record:', error);
    throw error;
  }
});