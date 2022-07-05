FROM node:14.18.2-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

FROM node:14.18.2-alpine as production-stage

ENV NODE_ENV=production
ENV FILE_UPLOAD_PATH=uploads

WORKDIR /

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

VOLUME [ "/dist/src/${FILE_UPLOAD_PATH}" ]

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]
