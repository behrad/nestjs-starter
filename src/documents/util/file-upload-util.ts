import { extname } from 'path'
import { Chance } from 'chance'
const chance = new Chance()

export const editFileName = (req: Request, file, callback) => {
  const fileExtName = extname(file.originalname)
  const randomName = chance.word()

  const newName = file.originalname.replace(
    fileExtName,
    `.${randomName}${fileExtName}`,
  )

  callback(null, newName)
}

export const imageFileFilter = (req: Request, file, callback) => {
  if (!file.originalname.match(/\.(pdf|jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image and pdf files are allowed!'), false)
  }
  callback(null, true)
}
