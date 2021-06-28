async function start(dirPath, envPath) {
  require('dotenv').config({
    path: envPath,
  })

  const OSS = require('ali-oss')
  const fs = require('fs')
  const path = require('path')

  const DIST_DIR = path.resolve(process.cwd(), dirPath)
  const except_file = ['.DS_Store']

  const client = new OSS({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
    bucket: process.env.BUCKET_NAME,
  })

  function readFiles(dir_path, cb) {
    const file_list = fs.readdirSync(dir_path)
    file_list
      .filter(n => !except_file.includes(n))
      .forEach(file_name => {
        const file_path = path.resolve(dir_path, file_name)
        const res = fs.statSync(file_path)
        if (res.isDirectory()) {
          readFiles(file_path, cb)
        } else {
          cb(file_path)
        }
      })
  }

  function log(...strs) {
    const MOVE_LEFT = `\u001b[1000D`
    const MOVE_UP = `\u001b[1A`
    const CLEAR_LINE = `\u001b[0K`
    let str = ''
    str += MOVE_LEFT + CLEAR_LINE
    str += strs.join(' ')

    process.stdout.write(str)
  }

  async function main() {
    const { objects } = await client.list()

    if (objects) {
      console.log('=========== 开始清空文件 ===========')

      // 清空原有文件
      await Promise.all(
        objects
          .filter(({ name }) => !name.endsWith('/'))
          .map(async obj => {
            await client.delete(obj.name)
          })
      )
      console.log('=========== 清空文件完毕 ===========')
    }

    console.log('=========== 开始写入文件 ===========')
    const files = []
    readFiles(DIST_DIR, file_path => {
      files.push(file_path)
    })

    const progress_per_file = 100 / files.length
    let progress = 0
    await Promise.all(
      files.map(async file_path => {
        const name = file_path.replace(DIST_DIR + path.sep, '')
        await client.put(name, file_path)
        progress += progress_per_file
        log(`=========== 已完成${progress}% ===========`)
      })
    )

    console.log('\n=========== 写入文件结束 ===========')
  }

  await main()
}

module.exports = start
