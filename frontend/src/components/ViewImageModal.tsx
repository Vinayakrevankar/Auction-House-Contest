import React from 'react';
import { Modal } from 'flowbite-react';

interface ViewImageModalProps {
  show: boolean;
  images: string[];
  onClose: () => void;
}

const ViewImageModal: React.FC<ViewImageModalProps> = ({ show, images, onClose }) => {
  return (
    <Modal show={show} size="lg" popup onClose={onClose}>
      <Modal.Header>View Images</Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={`https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/${image}`}
              alt={`Item ${index + 1}`}
              className="w-full h-auto rounded shadow-md"
            />
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ViewImageModal;
