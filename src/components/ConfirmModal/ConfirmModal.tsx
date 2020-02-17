import React from 'react';
import PropTypes from 'prop-types';
import IWordObject from '../../models/IWordObject';
import './ConfirmModal.scss';

const ConfirmModal = (props:any) => (
  <div className="confirm-modal">
    <h2>There are multiple senses of the word <em>{props.word}</em></h2>
    <h3>Select the sense you mean:</h3>
    <div className="sense-list">
      {props.wordOptions.map((sense: IWordObject) => {
        return (
          <button onClick={() => props.set(sense)}>
            <h4>{props.word}</h4> <em>{sense.fl}</em>
            <div>{sense.shortdef.join(', ')}</div>
          </button>
        )
      })}
    </div>
  </div>
);

ConfirmModal.propTypes = {
  wordOptions: PropTypes.object,
  word: PropTypes.string,
  set: PropTypes.func
};

ConfirmModal.defaultProps = {
  // bla: 'test',
};

export default ConfirmModal;
