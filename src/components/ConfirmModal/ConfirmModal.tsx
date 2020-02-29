import React from 'react';
import PropTypes from 'prop-types';
import './ConfirmModal.scss';

const ConfirmModal = (props:any) => {
  console.log(props)
  return (
    <div className="confirm-modal">
      <h2>There are multiple senses of the word <em>{props.word}</em></h2>
      <div className="sense-list">
        {props.wordClasses.map( (wordclass:any, i:number) => {
          return props.definitions[i].map((def: string, j:number) => {
            return (
              <button onClick={() => props.set([i,j])}>
                <h4>{props.word}</h4> <em>{wordclass}</em>
                <div>{def}</div>
              </button>
            )
          })
        })}
      </div>
    </div>
  )
}

ConfirmModal.propTypes = {
  // wordOptions: PropTypes.object,
  word: PropTypes.string,
  wordClasses: PropTypes.array,
  definitions: PropTypes.array,
  set: PropTypes.func
};

ConfirmModal.defaultProps = {
  // bla: 'test',
};

export default ConfirmModal;
