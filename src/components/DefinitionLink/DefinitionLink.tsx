import React from 'react';
import PropTypes from 'prop-types';
import { upperFirst } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import './DefinitionLink.scss';

const DefinitionLink = (props: { word: any }) => (
  <a
    href={`https://www.merriam-webster.com/dictionary/${props.word.word}`}
    target="_blank"
    rel="noopener noreferrer"
    className={`word-link`}
    id={`${props.word.isLinkWord ? 'link-word' : ''}`}
    key={props.word.uuid}
  >
    <h3>{upperFirst(props.word.word)} </h3>
    <span>{upperFirst(props.word.def)}</span>
    <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
  </a>
);

DefinitionLink.propTypes = {
  word: PropTypes.object,
};

DefinitionLink.defaultProps = {
  // bla: 'test',
};

export default DefinitionLink;
