import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

const Button = (props:any) => (
  <button 
    className={props.className}
    onClick={() => props.buttonClick()}>
    {props.text}
  </button>
);

Button.propTypes = {
  buttonClick: PropTypes.func,
  className: PropTypes.string,
  text: PropTypes.string
};

Button.defaultProps = {
  // bla: 'test',
};

export default Button;
