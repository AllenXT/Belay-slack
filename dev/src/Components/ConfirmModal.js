import React from 'react';
import '../assets/App.css';

const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content rounded-3 shadow">
        <div className="modal-body p-4 text-center">
          <h5 className="mb-0">{title}</h5>
          <p className="mb-0">{message}</p>
        </div>
        <div className="modal-footer flex-nowrap p-0">
          <button type="button" className="btn btn-lg btn-link fs-6 text-decoration-none col-6 py-3 m-0 rounded-0 border-end" onClick={onConfirm}>
            <strong>Yes</strong>
          </button>
          <button type="button" className="btn btn-lg btn-link fs-6 text-decoration-none col-6 py-3 m-0 rounded-0" onClick={onCancel}>
            <strong>No</strong>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;