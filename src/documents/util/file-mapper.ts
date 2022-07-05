import { Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface FileMapper {
  file
  req
  basePath
}

interface FilesMapper {
  files
  req
  basePath
}

export const fileMapper = ({ file, req, basePath }: FileMapper) => {
  basePath = basePath ? `${basePath}/` : ''
  const url = `${req.protocol}://${req.headers.host}/${basePath}${file.path}`
  return {
    size: file.size,
    mimetype: file.mimetype,
    originalname: file.originalname,
    filename: file.filename,
    url,
  }
}

export const filesMapper = ({ files, req, basePath }: FilesMapper) => {
  basePath = basePath ? `${basePath}/` : ''
  return files.map((file) => {
    const url = `${req.protocol}://${req.headers.host}/${basePath}${file.path}`
    return {
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
      filename: file.filename,
      url,
    }
  })
}
