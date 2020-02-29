import React from 'react';
import PropTypes from 'prop-types';
import DefinitionLink from '../DefinitionLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import './ResultsContainer.scss';
import { IResultObject } from '../../models/data-models';

const ResultsContainer = (props: { result: IResultObject }) => (
  <div className="results-container">
    {props.result.chain &&
      props.result.chain.map((word: object, i: number) => {
        return (
          <div className="result-wrapper">
            {word &&
              <DefinitionLink
                word={word}
              />
            }
            {(props.result.chain && i < props.result.chain.length - 1) &&
              <FontAwesomeIcon icon={faLink} />
            }
          </div>
        )
      })
    }
    {!props.result.status && <span>{props.result.message}</span>}
  </div>
);

ResultsContainer.propTypes = {
  result: PropTypes.object,
};

ResultsContainer.defaultProps = {
  // bla: 'test',
};

export default ResultsContainer;
