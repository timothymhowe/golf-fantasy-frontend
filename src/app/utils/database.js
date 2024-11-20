/**
 * Creates a user record in the database after Firebase authentication
 * 
 * TODO: This will be replaced by Firebase Functions in production
 * 
 * @param {Object} user - Firebase user object
 * @param {string} firstName - User's first name (optional for Google sign-in)
 * @param {string} lastName - User's last name (optional for Google sign-in)
 * @throws {Error} If database creation fails
 */
export const createUserInDatabase = async (user, firstName = '', lastName = '') => {
    try {
      console.log("Starting database creation for user:", user.uid);
      
      // Log the user object (excluding sensitive data)
      console.log("User data:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        firstName,
        lastName,
        photoURL: user.photoURL
      });

      const token = await user.getIdToken();
      console.log("Got ID token");

      const userData = {
        firebase_id: user.uid,
        email: user.email,
        display_name: user.displayName || '',
        first_name: firstName,
        last_name: lastName,
        avatar_url: user.photoURL || ''
      };
      
      console.log("Sending request to API with data:", userData);

      const response = await fetch('/api/management/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
  
      if (!response.ok) {
        // Try to get more error details from response
        const errorData = await response.text();
        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Failed to create user in database: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Database creation successful:", result);
      
      return result;
    } catch (error) {
      console.error("Database creation error:", {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };