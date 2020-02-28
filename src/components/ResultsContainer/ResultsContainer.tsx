import React from 'react';
import PropTypes from 'prop-types';
import DefinitionLink from '../DefinitionLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import './ResultsContainer.scss';
import { IResultObject } from '../../models/data-models';

const ResultsContainer = (props: { chainData: IResultObject }) => (
  <div className="results-container">
    {props.chainData.chain.length > 0 &&
      props.chainData.chain.map((word: object, i: number) => {
        return (
          <div className="result-wrapper">
            {word &&
              <DefinitionLink
                word={word}
              />
            }
            {(i < props.chainData.chain.length - 1) &&
              <FontAwesomeIcon icon={faLink} />
            }
          </div>
        )
      })
    }
    {!props.chainData.status && <span>{props.chainData.message}</span>}
  </div>
);

ResultsContainer.propTypes = {
  chainData: PropTypes.object,
};

ResultsContainer.defaultProps = {
  // bla: 'test',
};

export default ResultsContainer;
