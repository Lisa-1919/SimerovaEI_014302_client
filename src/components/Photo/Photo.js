import React, { useState } from 'react';
import './photo.css';
import { useTranslation } from "react-i18next";
import AuthServer from '../../services/auth.server';
import { IoAddOutline } from "react-icons/io5";

const Photo = () => {
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        const fileSizeLimit = 10 * 1024 * 1024; // 10MB in bytes

        if (file && file.size <= fileSizeLimit) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
            };

            reader.readAsDataURL(file);
            try {
                const response = await authServer.handleUpload(file);
                console.log(response);
            } catch (error) {
                console.error(error);
            }
            setErrorMessage("");
        } else {
            setErrorMessage("Please select another image. The file size should not exceed 10MB.");
        }
    };

    const handleSaveImage = async () => {
        if (selectedImage) {
            try {
                const response = await authServer.handleUpload(selectedImage);
                console.log(response);
            } catch (error) {
                console.error(error);
            }
        }
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
