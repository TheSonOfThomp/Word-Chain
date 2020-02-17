export default interface IWordObject {
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