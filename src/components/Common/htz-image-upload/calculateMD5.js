import SparkMD5 from 'spark-md5'

export default function calculateMD5(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const spark = new SparkMD5.ArrayBuffer()
    reader.onload = e => {
      spark.append(e.target.result)
      resolve(spark.end())
    }
    reader.onerror = () => {
      reject(reader.error || new Error('Error reading the file.'))
    }
    reader.readAsArrayBuffer(file)
  })
}
