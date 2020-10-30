/**
 * 读取tiff中的idf和其中的de
 * @return {Tiff}
 * @constructor
 * @author Lejianwen
 */
function Tiff () {
  this.array = []
  this.isII = true
  this.fileIDFs = []

  /**
   * tiff中的类型
   1 = BYTE 8-bit unsigned integer.
   2 = ASCII 8-bit byte that contains a 7-bit ASCII code; the last byte
   must be NUL (binary zero).
   3 = SHORT 16-bit (2-byte) unsigned integer.
   4 = LONG 32-bit (4-byte) unsigned integer.
   5 = RATIONAL Two LONGs: the first represents the numerator
   6 = SBYTE An 8-bit signed (twos-complement) integer.
   7 = UNDEFINED An 8-bit byte that may contain anything, depending on
   the definition of the field.
   8 = SSHORT A 16-bit (2-byte) signed (twos-complement) integer.
   9 = SLONG A 32-bit (4-byte) signed (twos-complement) integer.
   10 = SRATIONAL Two SLONG’s: the first represents the numerator of a
   fraction, the second the denominator.
   11 = FLOAT Single precision (4-byte) IEEE format.
   12 = DOUBLE Double precision (8-byte) IEEE format.
   * @type {({len: number, name: string}|{len: number, name: string})[]}
   */
  this.types = [
    { name: '', len: 1 },
    { name: 'Byte', len: 1 },
    { name: 'ASCII', len: 1 },
    { name: 'SHORT', len: 2 },
    { name: 'LONG', len: 4 },
    { name: 'RATIONAL', len: 8 },
    { name: 'SBYTE', len: 1 },
    { name: 'UNDEFINED', len: 1 },
    //其余的再补充
  ]
  return this

}

Tiff.prototype.readTiffInfo = function (fileArrayBuffer) {
  this.fileIDFs = []
  this.array = new Uint8Array(fileArrayBuffer)
  if (this.array[0] === 0x49 && this.array[0] === 0x49) {
    this.isII = true
    //II
  } else if (this.array[0] === 0x4D && this.array[0] === 0x4D) {
    //MM
    this.isII = false
  }
  const firstIDFOffset = this.getValue(4, 4) //第一个ifd的偏移
  while (1) {
    let nextIDFOffset = this.readIDF(firstIDFOffset)
    if (!nextIDFOffset) {
      break
    }
  }
  return this.fileIDFs
}

Tiff.prototype.readIDF = function (startOffset) {
  console.log('IDF offset start', startOffset)
  const DENum = this.getValue(startOffset, 2) //de个数
  console.log('DENum', DENum)
  const endOffset = startOffset + 2 + 12 * DENum + 4 //idf结尾偏移
  console.log('IDF offset end', endOffset)
  let DEOffsetStart = startOffset + 2 //DE开始
  const DEs = []
  while (DEOffsetStart < endOffset - 4) {
    DEs.push(this.readDE(DEOffsetStart))
    DEOffsetStart += 12
  }
  this.fileIDFs.push({ startOffset, endOffset, DEs })
  return this.getValue(startOffset + 2 + 12 * DENum, 4) //下一个idf的偏移
}

Tiff.prototype.readDE = function (start) {
  let offset = start
  const tag = this.getValue(offset, 2)
  offset += 2
  const type = this.getValue(offset, 2)
  const typeLen = this.types[type].len
  offset += 2
  const len = this.getValue(offset, 4)
  offset += 4

  let trueValue = []
  const trueLen = typeLen * len
  // console.log( { typeLen, type, trueLen })
  if (trueLen > 4) {
    const offsetValue = this.getValue(offset, 4)
    if (type === 5) {
      trueValue.push(this.getValue(offsetValue, 4))
      trueValue.push(this.getValue(offsetValue + 4, 4))
    } else {
      for (let i = 0; i < len; i++) {
        trueValue.push(this.getValue(offsetValue + i * typeLen, typeLen))
      }
    }
  } else {
    trueValue.push(this.getValue(offset, typeLen))
  }
  // console.log('DE=>', start,
  //   { tag16: tag.toString(16), tag, type, len, trueValue })

  return {
    start,
    tag16: tag.toString(16),
    tag,
    type,
    len,
    trueValue,
  }
}

Tiff.prototype.getValue = function (start, length) {
  let str = ''
  if (this.isII) {
    for (let i = length - 1; i >= 0; i--) {
      str += this.intTo16(this.array[i + start], 2)
    }
  } else {
    for (let i = 0; i < length; i++) {
      str += this.intTo16(this.array[i + start], 2)
    }
  }
  return parseInt(str, 16)
}

Tiff.prototype.intTo16 = function (num, len = 1) {
  const str = num.toString(16)
  return str.length < len ? ('0'.repeat(len - str.length) + str) : str
}
module.exports = Tiff
