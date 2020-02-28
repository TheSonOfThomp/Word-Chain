import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import './App.scss';
import Textbox from './components/Textbox';
import LoadingModal from './components/LoadingModal';
import IWordObject, { IWordStateObject, IResultObject, IDictEntry } from './models/data-models';
import ConfirmModal from './components/ConfirmModal';
import Button from './components/Button';
import ResultsContainer from './components/ResultsContainer';
import { usePrevious } from './utils/usePrevious';

function App() {

  const [Word1, setWord1] = useState({
    word: '',
    class: '',
    def: '',
    syns: []
  }) // IWordStateObject
  const setWord1String = (s:string) => {
    setWord1({
      ...Word1,
      word: s
    })
  }

  const [Word2, setWord2] = useState({
    word: '',
    class: '',
    def: '',
    syns: []
  }) // IWordStateObject
  const setWord2String = (s: string) => {
    setWord2({
      ...Word2,
      word: s
    })
  }

  const [confirmingModalJSX, setConfirmingModal] = useState(<></>)
  const [isConfirmingWord, setIsConfirmingWord] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const wasLoading = usePrevious(loading)
  const [resultIsSet, setResultIsSet] = useState(false)
  const [result, setResult] = useState()

  // fetches the definition from the API
  const fetchWord = async(word: string) => {
    const url = `https://dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${process.env.REACT_APP_THESAUSUS_KEY}`
    const resp = await fetch(url)
    const data = await resp.json()
    if (data.every((d: any) => typeof d === 'object')) { return data }
    else { return null }
  }

  // sets the state object to the appropriate sense of the word
  // i.e. if there are multiple definitions, propmt the user to select the correct one
  const setWordSense = async (word:string, wordOptions:Array<any>, setWordState: Function) => {
    // use only the word options that exactly match the typed word
    wordOptions = wordOptions.filter(w => w.hwi.hw === word.toLocaleLowerCase())
    
    if (wordOptions.length <= 1) {
      setWordState({
        word: word,
        class: wordOptions[0].fl,
        def: wordOptions[0].shortdef[0],
        syns: wordOptions[0].meta.syns[0]
      })
      console.log('resolve setWordSense')
      return Promise.resolve(1)
    }

    const wordClasses = wordOptions.map(opt => opt.fl)
    const shortDefs = wordOptions.map(opt => opt.shortdef)
    const wordSyns = wordOptions.map(opt => opt.meta.syns)
    // const index = parseInt(prompt(`${shortDefs.flatMap(d => d)}`) as string)

    const setWordSense = (indexPath:Array<number>) => {
      const returnValue = {
        word,
        wordClass: wordClasses[indexPath[0]],
        def: shortDefs[indexPath[0]][indexPath[1]],
        syns: wordSyns[indexPath[0]][indexPath[1]]
      }
      setWordState(returnValue)
      setIsConfirmingWord(false)
      console.log('resolve setWordSense')
      return Promise.resolve(1)
    }

    setIsConfirmingWord(true)
    setConfirmingModal(
      <ConfirmModal
        word={word}
        wordClasses={wordClasses}
        definitions={shortDefs}
        set={setWordSense}
      />
    )
  }

  // an asynchronous function that performs the above 2 functions synchronously
  const fetchAndSetSense = async (word:string, setWord: Function) => {
    let arr: Array<any> = await fetchWord(word)
    if (!arr) {
      alert(`Can't find word: ${word}`)
    } else {
      setWordSense(word, arr, setWord)
      console.log('resolve fetchAndSetSense')
      return Promise.resolve(1)
    }
  }

  function getSyns(WordObject: IWordObject): Array<string> | null{
    if(WordObject.meta) {
      const syns = WordObject.meta.syns.flatMap((s: any) => s)
      return syns
    } else return null
  }

  const findLinkWord = async (WordObj1: IWordStateObject, WordObj2: IWordStateObject): Promise<IResultObject> => {
    console.log('Searching...')

    if (WordObj1 === WordObj2) {
      console.log(`${WordObj1} and ${WordObj2} are the same word`)
      return {
        status: true,
        message: `${WordObj1} and ${WordObj2} are the same word`,
        chain: [WordObj1]
      }
    }

    const w1_key = WordObj1.word
    const syns1 = WordObj1.syns
    const dict1: { [key: string]: IDictEntry } = {}
    dict1[w1_key] = {
      level: 0,
      parent: null,
      ...WordObj1
    }

    const w2_key = WordObj2.word
    const dict2: { [key: string]: IDictEntry } = {}
    const syns2 = WordObj2.syns
    dict2[w2_key] = {
      level: 0,
      parent: null,
      ...WordObj2
    }

    if (Array.isArray(syns1) && Array.isArray(syns2)) {

      // loop thru all the synonyms for each word
      // add them to the dictionary
      // return if we find the link work
      for (let i = 0; i < Math.max(syns1.length, syns2.length); i++) {
        const s1: string | null = syns1[i] ? syns1[i] : null
        const s2: string | null = syns2[i] ? syns2[i] : null

        // return if the words are already synonyms
        // or if there is a common synonym
        if (s1 === w2_key) {
          const message = `'${s1}' and '${w2_key}' are synonyms!`
          const chain = await fetchWordChain(s1)
          console.log(message, chain)
          return {
            status: true,
            message,
            chain
          }
        } else if (s2 === w1_key) {
          const message = `'${s2}' and '${w1_key}' are synonyms!`
          const chain = await fetchWordChain(s2)
          console.log(message, chain)
          return {
            status: true,
            message,
            chain
          }
        } else if (s1 && (s1 === s2 || dict2[s1])) {
          const message = `"${w1_key}" and "${w2_key}" have a common synonym: "${s1}"`
          const chain = await fetchWordChain(s1)
          console.log(message, chain)
          return {
            status: true,
            message,
            chain
          }
        } else if (s2 && dict1[s2]) {
          const message = `"${w1_key}" and "${w2_key}" have a common synonym: "${s2}"`
          const chain = await fetchWordChain(s2)
          console.log(message, chain)
          return {
            status: true,
            message,
            chain
          }
        } else {
          // else add to dicts
          if (s1) {
            dict1[s1] = {
              level: 1,
              parent: w1_key,
              word: s1
            }
          }
          if (s2) {
            dict2[s2] = {
              level: 1,
              parent: w2_key,
              word: s2
            }
          }
        }
      }

      // now go through all the synonyms found
      // find the lvl 2 synonyms of each synonym
      for (let i = 0; i < Math.max(syns1.length, syns2.length); i++) {
        const s1: string | null = syns1[i] ? syns1[i] : null
        const s2: string | null = syns2[i] ? syns2[i] : null

        if (s1) {
          const s1word: Array<IWordObject> = await fetchWord(s1)
          const s1syns = getSyns(s1word[0])
          dict1[s1].uuid = s1word[0].meta.uuid
          dict1[s1].def = s1word[0].shortdef[0]
          if (Array.isArray(s1syns)) {
            for (let s of s1syns) {
              if (!dict1[s]) {
                dict1[s] = {
                  level: 2,
                  word: s,
                  parent: s1,
                }
              }

              if (dict2[s]) {
                const chain = await fetchWordChain(s)
                console.log(`Link word found: ${s}`)
                console.log(chain)
                return {
                  status: true,
                  message: `Link word found: ${s}`,
                  chain: chain
                }
              }
            }
          }
        }

        if (s2) {
          const s2word = await fetchWord(s2)
          const s2syns = getSyns(s2word[0])
          dict2[s2].uuid = s2word[0].meta.uuid
          dict2[s2].def = s2word[0].shortdef.join(', ')
          if (Array.isArray(s2syns)) {
            for (let s of s2syns) {
              if (!dict2[s]) {
                dict2[s] = {
                  level: 2,
                  word: s,
                  parent: s2,
                }
              }

              if (dict1[s]) {
                const chain = await fetchWordChain(s)
                console.log(`Link word found: ${s}`)
                console.log(chain)
                return {
                  status: true,
                  message: `Link word found: ${s}`,
                  chain,
                }
              }
            }
          }
        }
      }
    }
    console.log("No Link words found")
    return {
      status: false,
      message: "No link words found",
      chain: []
    }

    async function fetchWordChain(word: string): Promise<Array<IDictEntry>> {
      let chain = []
      const p1_key = dict1[word] ? dict1[word].parent : null
      const p2_key = dict2[word] ? dict2[word].parent : null

      chain.push(dict1[w1_key])

      if (p1_key && p1_key !== w1_key) {
        chain.push(dict1[p1_key])
      }

      if (word !== w1_key && word !== w2_key) {
        const wordObj = dict1[word] || dict2[word]
        if (wordObj) {
          if (!wordObj.uuid) {
            const wordData = await fetchWord(word)
            wordObj.uuid = wordData[0].meta.uuid
            wordObj.def = wordData[0].shortdef[0]
            wordObj.isLinkWord = true
          }
          chain.push(wordObj)
        }
      }

      if (p2_key && p2_key !== w2_key) {
        chain.push(dict2[p2_key])
      }

      chain.push(dict2[w2_key])
      return chain
    }
  }

  // Confirm word 2 after word 1 is set
  useEffect(() => {
    if (Word1.syns.length > 0) {
      fetchAndSetSense(Word2.word, setWord2)
    }
  }, [Word1])

  // Find links once both words are set
  useEffect(() => {
    if(Word2.syns.length > 0) {
      findLink(Word1, Word2)  
    }
  }, [Word2])

  useEffect(() => {
    if (!loading && wasLoading) {
      window.location.href = `#link-word`
    }
  }, [loading, wasLoading])


  function findLink(w1: IWordStateObject, w2: IWordStateObject) {
    if(w1 && w2) {
      setResultIsSet(false)
      setLoading(true)
      findLinkWord(w1, w2).then((data: any) => {
        console.log(data)
        setResult(data)
        setResultIsSet(true)
        setLoading(false)
      })
    }
  }

  return (
    <div className="App">

      <header>
        <h1>Word Chain</h1>
        <h2>Find the closest synonym that links two words</h2>
      </header>

      <div className="input-form"> 

        <Textbox 
          placeholder="First word"
          value={Word1.word}
          setValue={setWord1String}
        />

        <FontAwesomeIcon icon={faLink} />

        <Textbox
          placeholder="Second word"
          value={Word2.word}
          setValue={setWord2String}
        />

        <Button 
          className="submit-button" 
          text="Find a link word"
          buttonClick={() => fetchAndSetSense(Word1.word, setWord1)}
        ></Button>
      </div>

      {!!isConfirmingWord &&  confirmingModalJSX}

      {!!loading && <LoadingModal />}

      {!!resultIsSet && !!result &&
        <ResultsContainer result={result}/>
      }
    </div>
  );
}

export default App;