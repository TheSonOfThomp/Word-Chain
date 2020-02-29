import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner} from '@fortawesome/free-solid-svg-icons'
import './LoadingModal.scss';

const Modal = () => (
  <div className="modal">
    Searching...
    <br/>
    <FontAwesomeIcon icon={faSpinner} size="lg" />
  </div>
);
export default Modal;
