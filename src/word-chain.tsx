import IWordObject from "./models/IWordObject"

export default class WordChain {

  static async getWord(word:string) {
    const url = `https://dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${process.env.REACT_APP_THESAUSUS_KEY}`
    const resp = await fetch(url)
    const data = await resp.json()

    if (data.every((d:any) => typeof d === 'object')) {
      return data //
    }
    else { return null }
  }

  static getSyns(WordObject: IWordObject): Array<string> | null{
    if (WordObject.meta) {
      const syns = WordObject.meta.syns.flatMap((s: any) => s)
      return syns
    } else return null
  }


  static async find(WordObj1:IWordObject, WordObj2:IWordObject) {
    console.log('Searching...')
    if (WordObj1 === WordObj2) {
      console.log(`${WordObj1} and ${WordObj2} are the same word`)
      return WordObj1
    }

    const w1_key = WordObj1.meta.id
    const w2_key = WordObj2.meta.id


    const dict1: { [key: string]: any } = {}
    const dict2: { [key: string]: any } = {}

    dict1[w1_key] = {
      level: 0,
      parent: null,
      word: w1_key,
      ...WordObj1
    }

    dict2[w2_key] = {
      level: 0,
      parent: null,
      word: w2_key,
      ...WordObj2
    }

    const syns1 = this.getSyns(WordObj1)
    const syns2 = this.getSyns(WordObj2)

    if (Array.isArray(syns1) && Array.isArray(syns2)){
      for (let i = 0; i < Math.max(syns1.length, syns2.length); i++) {
        const s1 = syns1[i] ? syns1[i] : null
        const s2 = syns2[i] ? syns2[i] : null
  
        if (s1 === w2_key) {
          console.log(`'${w1_key}' and '${w2_key}' are synonyms!`)
          const chain = getWordChain(s1)
          return chain
        } else if (s2 === w1_key) {
          console.log(`'${w1_key}' and '${w2_key}' are synonyms!`)
          const chain = getWordChain(s2)
          return chain
        } else if (s1 && (s1 === s2 || dict2[s1])) {
          console.log(`"${w1_key}" and "${w2_key}" have a common synonym: "${s1}"`)
          const chain = getWordChain(s1)
          return chain
        } else if (s2 && dict1[s2]) {
          console.log(`"${w1_key}" and "${w2_key}" have a common synonym: "${s2}"`)
          const chain = getWordChain(s2)
          return chain
        } else {
  
          // else add to dicts
          if(s1) {
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

      // go through all the synonyms found
      for (let i = 0; i < Math.max(syns1.length, syns2.length); i++) {
        const s1 = syns1[i] ? syns1[i] : null
        const s2 = syns2[i] ? syns2[i] : null
  
        if(s1) {
          const s1word = await this.getWord(s1)
          const s1syns = this.getSyns(s1word[0])
          dict1[s1].uuid = s1word[0].meta.uuid
          dict1[s1].shortdef = s1word[0].shortdef.join(', ')
          if (Array.isArray(s1syns)) {
            for(let s of s1syns){
              if (!dict1[s]) {
                dict1[s] = {
                  level: 2,
                  word: s,
                  parent: s1,
                }
              }
      
              if (dict2[s]) {
                console.log(`Link word found: ${s}`)
                const chain = getWordChain(s)
                console.log(chain)
                return chain
              }
            }
          }
        }
  
        if(s2) {
          const s2word = await this.getWord(s2)
          const s2syns = this.getSyns(s2word[0])
          dict2[s2].uuid = s2word[0].meta.uuid
          dict2[s2].shortdef = s2word[0].shortdef.join(', ')
          if (Array.isArray(s2syns)) {
            for (let s of s2syns){
              if (!dict2[s]) {
                dict2[s] = {
                  level: 2,
                  word: s,
                  parent: s2,
                }
              }
      
              if (dict1[s]) {
                console.log(`Link word found: ${s}`)
                const chain = getWordChain(s)
                console.log(chain)
                return chain
              }
            }
          }
        }
      }
    }



    console.log("No Link words found")
    return false

    async function getWordChain(word:string) {
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
            const wordData = await WordChain.getWord(word)
            wordObj.uuid = wordData[0].meta.uuid
            wordObj.shortdef = wordData[0].shortdef.join(', ')
            wordObj.isKeyWord = true
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


}