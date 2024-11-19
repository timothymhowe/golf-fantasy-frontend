"use client"
import { useState, useRef } from 'react';
import { useAuth } from '../../components/auth-provider';
import { updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PageLayout from '../../components/hg-layout';
import GuardedPage from '../../components/guarded-page';
import Image from 'next/image';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(user?.photoURL || null);
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let photoURL = user.photoURL;

      // Handle image upload if there's a new file
      if (formData.imageFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile-images/${user.uid}`);
        const uploadResult = await uploadBytes(storageRef, formData.imageFile);
        photoURL = await getDownloadURL(uploadResult.ref);
      }

      // Update profile using Firebase's built-in method
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: photoURL
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Update form data with the new image file
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  return (
    <GuardedPage>
      <PageLayout>
        <div className="p-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            
            <div className="bg-white shadow rounded-lg p-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-4">
                  <div 
                    onClick={handleImageClick}
                    className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group"
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm">Change Photo</span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                {/* Status Message */}
                {message.text && (
                  <div className={`rounded-md p-4 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </PageLayout>
    </GuardedPage>
  );
}