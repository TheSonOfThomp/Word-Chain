export interface IAPIResponseWordObject {
  def: Array<object>,
  fl: string,
  hwi: object,
  meta: IWordMeta,
  shortdef: Array<string>
}

interface IWordMeta {
  ants: Array<Array<string>>,
  id: string,
  offensive: boolean,
  section: string,
  src: string
  stems: Array<string>,
  syns: Array<Array<string>>
  target: Object,
  uuid: string
}

export interface IResultObject {
  status: boolean,
  message: string,
  chain: Array<IWordStateObject | IDictEntry> | null
}

export interface IWordStateObject {
  word: string,
  class: string,
  def: string,
  syns: Array<string>
}

export interface IDictEntry {
  level: number,
  parent: string | null,
  word: string,
  class?: string,
  def?: string,
  syns?: Array<string>,
  uuid?: string,
  isLinkWord?: boolean
}

export interface IDictionary { [key: string]: IDictEntry }