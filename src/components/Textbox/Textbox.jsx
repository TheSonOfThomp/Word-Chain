import React from 'react';
import PropTypes from 'prop-types';
import './Textbox.scss';

const Textbox = (props) => {
  return (
    <input 
      type="text" 
      spellCheck="true"
      placeholder={props.placeholder}
      value={props.value} 
      onChange={(e) => props.setValue(e.target.value)}
    />
  )
};

Textbox.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func,
  placeholder: PropTypes.string
};

Textbox.defaultProps = {
  // bla: 'test',
};

export default Textbox;
