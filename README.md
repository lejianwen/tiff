# tiff
# 读取TIFF文件中的 idf和de

##使用示例
~~~javascript
import Tiff from 'ljw-tiff'


var readerBuffer = new FileReader()
readerBuffer.readAsArrayBuffer(file)

new Promise((resolve, reject) => {
    readerBuffer.onload = (e) => {
       const TiffObj = new Tiff()
       const idfs = TiffObj.readTiffInfo(e.currentTarget.result)
       resolve(idfs)
    }
}).then(res => {
    console.log(res)
    //[
    // {DEs:[
    //     {start: 10, tag16: "fe", tag: 254, type: 4, len: 1, trueValue:[0]},
    //     {start: 22, tag16: "100", tag: 256, type: 3, len: 1, trueValue:[100]},
    //     {start: 34, tag16: "101", tag: 257, type: 3, len: 1, trueValue:[100]},
    //     ...
    //   ],startOffset:8,endOffset:278}
    //]
})

~~~

###DE的type类型
~~~javascript
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
~~~
