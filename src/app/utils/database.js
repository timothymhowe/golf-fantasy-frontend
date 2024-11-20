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
      const token = await user.getIdToken();
      const response = await fetch('/api/management/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firebase_id: user.uid,
          email: user.email,
          display_name: user.displayName || '',
          first_name: firstName,
          last_name: lastName,
          avatar_url: user.photoURL || ''
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to create user in database');
      }
    } catch (error) {
      console.error("Database creation error:", error);
      throw error;
    }
  };