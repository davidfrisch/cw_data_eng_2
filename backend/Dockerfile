FROM node:slim 

RUN apt-get update && apt-get install -y libssl-dev

WORKDIR /app

COPY package.json /app

COPY . /app

RUN npm install

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "serve"]