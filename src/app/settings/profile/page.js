"use client"
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../components/auth-provider';
import { updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PageLayout from '../../components/hg-layout';
import GuardedPage from '../../components/guarded-page';
import Image from 'next/image';
import Avatar from '../../components/avatar';
import WidgetContainer from '../../components/widget-container';
import { PencilIcon } from '@heroicons/react/24/solid';


/**
 * ProfileSettings Component
 * Allows users to update their profile information including display name and profile picture
 * 
 * TODO: 
 * - Implement image size validation and compression
 * - Add file type validation
 * - Consider adding image cropping functionality
 * - Add loading state for image upload
 * - Consider implementing image optimization before upload (max size: 1MB)
 * 
 * @component
 * @returns {JSX.Element} The ProfileSettings component
 */
export default function ProfileSettings() {
  const { user, loading } = useAuth();
  
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  /**
   * Form data state containing user profile information
   * @type {Object}
   * @property {string} displayName - User's display name
   * @property {string} firstName - User's first name
   * @property {string} lastName - User's last name
   * @property {File} [imageFile] - Optional profile image file to upload
   */
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
  });

  // Update form data and image preview when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      setImagePreview(user.photoURL || null);
    }
  }, [user]);

  /**
   * Handles form submission for profile updates
   * Uploads new profile image if provided and updates user profile
   * 
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
   */
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

  /**
   * Triggers file input click when profile image is clicked
   */
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles profile image selection
   * Creates a preview URL and stores the file for upload
   * 
   * TODO: Add image size validation (max 1MB)
   * TODO: Add file type validation (jpg, png only)
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Validate file size
      // if (file.size > 1024 * 1024) {
      //   setMessage({ type: 'error', text: 'Image must be less than 1MB' });
      //   return;
      // }
      
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
        <WidgetContainer title='Profile Settings' canCollapse={false} noMaxHeight={true}>
          <form className="w-full max-w-md mx-auto px-2 py-6" onSubmit={handleSubmit}>
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full overflow-hidden cursor-pointer 
                            group border border-white/10 hover:border-white/20 transition-colors"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile"
                      fill
                      className="object-cover rounded-full border-2 border-white/10 hover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="w-full h-full bg-black/40 flex items-center justify-center">
                      <span className="text-white/30">No Image</span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full
                                opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white/90 text-sm">Change Photo</span>
                  </div>
                </div>
                {/* Edit Badge */}
                <div className="absolute -top-[-5px] -right-[-5px] bg-black/75 rounded-full p-1.5
                              border border-white/10 group-hover:border-[#BFFF00]/50
                              transition-colors duration-200 z-10 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <PencilIcon className="h-3.5 w-3.5 text-white/70 group-hover:text-[#BFFF00]" />
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

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm text-white/70 mb-1">
                  Display Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full py-3 px-4 
                            bg-black/40 
                            text-white/90 
                            placeholder:text-white/30
                            border border-white/10
                            hover:border-white/20
                            focus:border-[#BFFF00]/50
                            focus:ring-1 
                            focus:ring-[#BFFF00]/20
                            rounded-lg
                            transition-colors
                            duration-200
                            font-[Verdana]
                            text-lg
                            outline-none"
                />
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm text-white/70 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full py-3 px-4 
                            bg-black/40 
                            text-white/90 
                            placeholder:text-white/30
                            border border-white/10
                            hover:border-white/20
                            focus:border-[#BFFF00]/50
                            focus:ring-1 
                            focus:ring-[#BFFF00]/20
                            rounded-lg
                            transition-colors
                            duration-200
                            font-[Verdana]
                            text-lg
                            outline-none"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm text-white/70 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full py-3 px-4 
                            bg-black/40 
                            text-white/90 
                            placeholder:text-white/30
                            border border-white/10
                            hover:border-white/20
                            focus:border-[#BFFF00]/50
                            focus:ring-1 
                            focus:ring-[#BFFF00]/20
                            rounded-lg
                            transition-colors
                            duration-200
                            font-[Verdana]
                            text-lg
                            outline-none"
                />
              </div>
            </div>

            {/* Status Message */}
            {message.text && (
              <div className={`mt-6 px-3 py-2 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'text-[#BFFF00] bg-[#BFFF00]/10 border border-[#BFFF00]/20'
                  : 'text-red-500 bg-red-500/10 border border-red-500/20'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isLoading 
                    ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10' 
                    : 'bg-black/40 text-gray-200 border border-[#BFFF00]/50 hover:border-[#BFFF00] hover:bg-[#BFFF00]/10'
                  }
                `}
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </WidgetContainer>
      </PageLayout>
    </GuardedPage>
  );
}