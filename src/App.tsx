import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import WordChain from './word-chain';
import { upperFirst } from 'lodash';
import './App.scss';
import Textbox from './components/Textbox';
import LoadingModal from './components/LoadingModal';
import IWordObject from './models/IWordObject';
import ConfirmModal from './components/ConfirmModal';

function App() {
  
  const [word1, setWord1] = useState('')
  const [word2, setWord2] = useState('')

  const [WordObj1, setWordObj1] = useState()
  const [WordObj2, setWordObj2] = useState()

  const [confirmingModalJSX, setConfirmingModal] = useState(<></>)
  const [isConfirmingWord, setIsConfirmingWord] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [chainIsSet, setChainIsSet] = useState(false)
  const [chainData, setChain] = useState({})

  // Confirm word 1
  async function getWords() {
    console.log(word1, word2)
    if (word1 && word2) {
      let obj1: Array<IWordObject> = await WordChain.getWord(word1)

      if (!obj1) {
        alert(`Can't find word: ${word1}`)
      } else if (obj1.length > 1) {
        setIsConfirmingWord(true)
        setConfirmingModal(
          <ConfirmModal
            word={word1}
            wordOptions={obj1}
            set={setWordObj1}
          />
        )
      } else {
        setWordObj1(obj1[0])
      }
    }
  }

  // Confirm word 2 after word 1 is set
  useEffect(() => {
    if (!!WordObj1) {
      WordChain.getWord(word2).then(d => {
        let obj2: Array<IWordObject> = d

        if (!obj2) {
          alert(`Can't find word: ${word2}`)
        } else if (obj2.length > 1) {
          setIsConfirmingWord(true)
          setConfirmingModal(
            <ConfirmModal
              word={word2}
              wordOptions={obj2}
              set={setWordObj2}
            />
          )
        } else {
          setWordObj2(obj2[0])
        }
      })
    }

    return () => { };
  }, [WordObj1])

  // Find links once both words are set
  useEffect(() => {
    setIsConfirmingWord(false)
    findLink(WordObj1, WordObj2)
  }, [WordObj2])

  function findLink(w1:IWordObject, w2:IWordObject) {
    if(w1 && w2) {
      setChainIsSet(false)
      setLoading(true)
      WordChain.find(w1, w2).then((data: any) => {
        console.log(data)
        setChain(data)
        setChainIsSet(true)
        setLoading(false)
      })
    }
  }

  return (
    <div className="App">

      <header>
        <h1>Word Chain</h1>
        <h2>Find the word that links two oher words</h2>
      </header>

      <div className="input-form"> 

        <Textbox 
          placeholder="First word"
          value={word1}
          setValue={setWord1}
        />

        <FontAwesomeIcon icon={faLink} />

        <Textbox
          placeholder="Second word"
          value={word2}
          setValue={setWord2}
        />

        <button className="submit-button" onClick={() => getWords()}>Find linking word</button>
      </div>

      {!!isConfirmingWord && 
        confirmingModalJSX
      }

      {!!loading && <LoadingModal />}

      {!!chainIsSet &&
        <div className="results-container">
        {!!chainData &&
          Object.values(chainData).map((word:any, i: number) => {
            return (
              <>
                {word &&
                  <a
                    href={`https://www.merriam-webster.com/dictionary/${word.word}`} 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className={`word-link ${word.isKeyWord ? 'key-word' : ''}`} 
                    key={word.uuid} >
                    <h3>{upperFirst(word.word)} </h3>
                    <span>{upperFirst(word.shortdef)}</span>
                    <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                  </a>
                }
                {(i < Object.values(chainData).length - 1) && 
                  <FontAwesomeIcon icon={faLink} /> 
                }
              </>
            )
          })
        }
        {!chainData && <span>No Link words found</span>}
        </div>
      }
    </div>
  );
}

export default App;
