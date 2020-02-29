import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import './App.scss';
import Textbox from './components/Textbox';
import LoadingModal from './components/LoadingModal';
import { IAPIResponseWordObject, IWordStateObject, IResultObject, IDictEntry, IDictionary } from './models/data-models';
import ConfirmModal from './components/ConfirmModal';
import Button from './components/Button';
import ResultsContainer from './components/ResultsContainer';
import { usePrevious } from './utils/usePrevious';

function App() {

  const emptyWordObject: IWordStateObject = {
    word: '',
    class: '',
    def: '',
    syns: []
  }
  const [Word1, setWord1] = useState<IWordStateObject>(emptyWordObject)
  const setWord1String = (s:string) => {
    setWord1({
      ...Word1,
      word: s
    })
  }

  const [Word2, setWord2] = useState<IWordStateObject>(emptyWordObject)
  const setWord2String = (s: string) => {
    setWord2({
      ...Word2,
      word: s
    })
  }

  

  const [confirmingModalJSX, setConfirmingModal] = useState(<></>)
  const [isConfirmingWord, setIsConfirmingWord] = useState(false)
  
  // const [loading, setLoading] = useState(false)

  const [state, setState] = useState<'ready' | 'started' | 'searching'>('ready')

  // const wasLoading = usePrevious(loading)
  const prevState = usePrevious(state)
  const [result, setResult] = useState<IResultObject>()


  // Starts the whole process
  const search = (w1: string, w2: string) => {
    if (w1 === w2) {
      setResult({
        message: `Please enter two different words`,
        status: false,
        chain: null
      })
      return
    } else {
      // reset any previous words
      setWord1({...Word1, class: '', def: '', syns: []})
      setWord2({...Word2, class: '', def: '', syns: []})
      setState('started')
      fetchAndSetSense(w1, setWord1)
    }
  }

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
  const getWordSense = async (word:string, wordOptions:Array<any>, setWordState: Function): Promise<boolean> => {
    
    // use only the word options that exactly match the typed word
    wordOptions = wordOptions.filter(w => w.hwi.hw === word.toLocaleLowerCase())

    if (wordOptions.length <= 0) {
      setResult({
        message: `Couldn't find word: "${word}"`,
        status: false,
        chain: null
      })
      return Promise.resolve(false) 
    } else if (wordOptions.length === 1) {
      setWordState({
        word: word,
        class: wordOptions[0].fl,
        def: wordOptions[0].shortdef[0],
        syns: wordOptions[0].meta.syns[0]
      })
      return Promise.resolve(true)
    }

    const wordClasses = wordOptions.map(opt => opt.fl)
    const shortDefs = wordOptions.map(opt => opt.shortdef)
    const wordSyns = wordOptions.map(opt => opt.meta.syns)
    // const index = parseInt(prompt(`${shortDefs.flatMap(d => d)}`) as string)

    const setWordSense = (indexPath:Array<number>):Promise<boolean> => {
      const returnValue = {
        word,
        wordClass: wordClasses[indexPath[0]],
        def: shortDefs[indexPath[0]][indexPath[1]],
        syns: wordSyns[indexPath[0]][indexPath[1]]
      }
      setWordState(returnValue)
      setIsConfirmingWord(false)
      return Promise.resolve(true)
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
    return Promise.resolve(true)
  }

  // an asynchronous function that performs the above 2 functions synchronously
  // sets the word state variable
  const fetchAndSetSense = async (word:string, setWord: Function) => {
    let arr: Array<any> = await fetchWord(word)
    if(!arr) {
      setResult({
        message: `Couldn't find word: "${word}"`,
        status: false,
        chain: null
      })
    } else {
      // sets the word state variable
      getWordSense(word, arr, setWord)
    }
  }

  // Where the bulk of logic lives
  const findLinkWord = async (WordObj1: IWordStateObject, WordObj2: IWordStateObject): Promise<IResultObject> => {
    console.log('Searching...')
    if (WordObj1 === WordObj2) {
      const message = `${WordObj1} and ${WordObj2} are the same word`
      console.log(message)
      return {
        status: false,
        message,
        chain: [WordObj1]
      }
    }
    
    const createDict = (WordObj: IWordStateObject) => {
      const dict: IDictionary = {}
      dict[WordObj.word] = {
        level: 0,
        parent: null,
        ...WordObj
      }
      return dict
    }

    const dict1 = createDict(WordObj1)
    const dict2 = createDict(WordObj2)

    if (Array.isArray(WordObj1.syns) && Array.isArray(WordObj2.syns)) {

      // loop thru all the synonyms for each word
      // add them to the dictionary
      // return if we find the link work
      for (let i = 0; i < Math.max(WordObj1.syns.length, WordObj2.syns.length); i++) {
        const s1: string | null = WordObj1.syns[i] ? WordObj1.syns[i] : null
        const s2: string | null = WordObj2.syns[i] ? WordObj2.syns[i] : null

        // return if the words are already synonyms
        // or if there is a common synonym
        if (s1 === WordObj2.word) {
          const message = `'${s1}' and '${WordObj2.word}' are synonyms!`
          const chain = await fetchWordChain(s1, [WordObj1, WordObj2], [dict1, dict2])
          console.log(message, chain)
          return {
            status: true,
            message,
            chain
          }
        } else if (s2 === WordObj1.word) {
          const message = `'${s2}' and '${WordObj1.word}' are synonyms!`
          const chain = await fetchWordChain(s2, [WordObj1, WordObj2], [dict1, dict2])
          console.log(message, chain)
          return {
            status: true,
            message,
            chain
          }
        } else if (s1 && (s1 === s2 || dict2[s1] )) {
          const message = `"${WordObj1.word}" and "${WordObj2.word}" have a common synonym: "${s1}"`
          const chain = await fetchWordChain(s1, [WordObj1, WordObj2], [dict1, dict2])
          console.log(message, chain)
          return {
            status: true,
            message,
            chain
          }
        } else if (s2 && dict1[s2]) {
          const message = `"${WordObj1.word}" and "${WordObj2.word}" have a common synonym: "${s2}"`
          const chain = await fetchWordChain(s2, [WordObj1, WordObj2], [dict1, dict2])
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
              parent: WordObj1.word,
              word: s1
            }
          }
          if (s2) {
            dict2[s2] = {
              level: 1,
              parent: WordObj2.word,
              word: s2
            }
          }
        }
      }

      // now go through all the synonyms found
      // find the lvl 2 synonyms of each synonym
      for (let i = 0; i < Math.max(WordObj1.syns.length, WordObj2.syns.length); i++) {
        const s1: string | null = WordObj1.syns[i] ? WordObj1.syns[i] : null
        const s2: string | null = WordObj2.syns[i] ? WordObj2.syns[i] : null

        const addNextSynonym = async (word:string, currentDict: IDictionary, otherDict: IDictionary): Promise<IResultObject | undefined> => {
          const wordResponse: Array<IAPIResponseWordObject> = await fetchWord(word)
          const syns: Array<string> = wordResponse[0].meta.syns.flat()
          currentDict[word].uuid = wordResponse[0].meta.uuid
          currentDict[word].def = wordResponse[0].shortdef[0]
          if (Array.isArray(syns)) {
            for (let s of syns) {
              if (!currentDict[s]) {
                currentDict[s] = {
                  level: 2,
                  word: s,
                  parent: s1,
                }
              }

              // Check if the current word exists in the other dictionary of synonyms
              if (otherDict[s]) {
                const chain = await fetchWordChain(s, [WordObj1, WordObj2], [dict1, dict2])
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

        if (s1) {
          const res = await addNextSynonym(s1, dict1, dict2)
          if (res) { return res }
        }

        if (s2) {
          const res = await addNextSynonym(s2, dict2, dict1)
          if (res) { return res}
        }
      }
    }
    
    console.log("No Link words found")
    return {
      status: false,
      message: "No link words found",
      chain: []
    }
  }

  async function fetchWordChain(keyword: string, WordObjs: Array<IWordStateObject>, Dictionaries: Array<IDictionary>): Promise<Array<IDictEntry>> {
    let chain = []

    const [startWord, endWord] = WordObjs
    const [dict1, dict2] = Dictionaries

    const p1_key = dict1[keyword] ? dict1[keyword].parent : null
    const p2_key = dict2[keyword] ? dict2[keyword].parent : null

    chain.push(dict1[startWord.word])

    if (p1_key && p1_key !== startWord.word) {
      chain.push(dict1[p1_key])
    }

    if (keyword !== startWord.word && keyword !== endWord.word) {
      const wordObj = dict1[keyword] || dict2[keyword]
      if (wordObj) {
        if (!wordObj.uuid) {
          const wordData = await fetchWord(keyword)
          wordObj.uuid = wordData[0].meta.uuid
          wordObj.def = wordData[0].shortdef[0]
          wordObj.isLinkWord = true
        }
        chain.push(wordObj)
      }
    }

    if (p2_key && p2_key !== endWord.word) {
      chain.push(dict2[p2_key])
    }

    chain.push(dict2[endWord.word])
    return chain
  }
  
  function findLink(w1: IWordStateObject, w2: IWordStateObject) {
    if (w1 && w2) {
      // reset old words
      setState('searching')
      findLinkWord(w1, w2).then((data: any) => {
        console.log(data)
        setResult(data)
        setState('ready')
      })
    }
  }

  // Confirm word 2 after word 1 is set
  useEffect(() => {
    if (state !== 'ready') {
      if (Word1.syns.length > 0) {
        fetchAndSetSense(Word2.word, setWord2)
      }
    }
  }, [Word1, state])

  // Find links once both words are set
  useEffect(() => {
    if (state !== 'ready') {
      if(Word2.syns.length > 0) {
        findLink(Word1, Word2)  
      }
    }
  }, [Word2, state])

  useEffect(() => {
    if (state === 'ready') {
      window.location.href = `#link-word`
    }
  }, [state])


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
          buttonClick={() => search(Word1.word, Word2.word)}
        ></Button>
      </div>

      {!!isConfirmingWord &&  confirmingModalJSX}

      {state === 'searching' && <LoadingModal />}

      {!!result &&
        <ResultsContainer result={result}/>
      }
    </div>
  );
}

export default App;