import React, { useState } from 'react';
import './photo.css';
import { useTranslation } from "react-i18next";
import AuthService from '../../services/auth.server';
import { IoAddOutline } from "react-icons/io5";

const Photo = ({ userImageUrl }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const fileSizeLimit = 10 * 1024 * 1024; // 10MB in bytes

    if (file && file.size <= fileSizeLimit) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setErrorMessage("");
    } else {
      setErrorMessage("Please select another image. The file size should not exceed 10MB.");
    }
  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setErrorMessage("");
  };

  const handleSaveImage = async () => {
    if (selectedImage) {
      try {
        const response = await AuthService.uploadImage(selectedImage);
      } catch (error) {
        console.error(error);
      }
      setSelectedImage(null);
    }
  };

  return (
    <div className='photo'>
      <div className="photo-container">
        {previewImage ? (
          <img src={previewImage} alt="Предпросмотр" className="rounded-photo" />
        ) : userImageUrl ? (
          <img src={`http://localhost:8080/images/${userImageUrl}`} alt="Фото" className="rounded-photo" />
        ) : (
          <img src={'http://localhost:8080/images/default.jpg'} alt="Загрузить Фото" className="rounded-photo" />
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
        <>
          <button onClick={handleSaveImage} className="save-button">
            Save
          </button>
          <button onClick={handleCancelImage} className="cancel-button">
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default Photo;
