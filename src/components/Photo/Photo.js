import React, { useState } from 'react';
import './photo.css';
import { useTranslation } from "react-i18next";
import AuthServer from '../../services/auth.server';
import { IoAddOutline } from "react-icons/io5";

const Photo = () => {
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5242880) { // Check if the file size is greater than 5MB
        setErrorMessage('File size should not exceed 5MB');
      } else {
        setErrorMessage('');
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveImage = () => {
    AuthServer.uploadImage(selectedImage) // Pass the selected image and token to the uploadImage function
    .then(message => {
      console.log(message); // Handle successful response
    })
    .catch(error => {
      console.error(error); // Handle error
    });
  };

  return (
    <div className='photo'>
      <div className="photo-container">
        {selectedImage ? (
          <img src={selectedImage} alt="Фото" className="rounded-photo" />
        ) : (
          <div className="placeholder">{errorMessage || t("select_img")}</div>
        )}
      </div>
      <label htmlFor="file-upload" className="upload-button">
        {t("upload")}
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="select-img"
      />
      {selectedImage && (
        <button onClick={handleSaveImage} className="save-button">
          Save
        </button>
      )}
    </div>
  );
};

export default Photo;
