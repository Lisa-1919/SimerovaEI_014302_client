import React, { useState } from 'react';
import './photo.css';
import { useTranslation } from "react-i18next";
import authServer from '../../services/auth.server';

const Photo = () => {
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };

        if (file) {
            reader.readAsDataURL(file);
            try {
                const response = await authServer.handleUpload(file);
                console.log(response); // Handle the response from the server if needed
            } catch (error) {
                console.error(error); // Handle any errors that occur during the upload
            }
        }
    };

    return (
        <div className='photo'>
          <div className="photo-container">
            {selectedImage ? (
              <img src={selectedImage} alt="Фото" className="rounded-photo" />
            ) : (
              <div className="placeholder">{t("select_img")}</div>
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
        </div>
      );
};

export default Photo;


// const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     const formData = new FormData();
//     formData.append('image', file);
  
//     // Send the image file to the server
//     fetch('/upload', {
//       method: 'POST',
//       body: formData,
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         // Handle the response from the server, if needed
//         console.log(data);
//         setSelectedImage(data.imageUrl);
//       })
//       .catch((error) => {
//         // Handle any errors that occur during the upload
//         console.error(error);
//       });
//   };
  