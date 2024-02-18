FROM node:20

RUN mkdir -p /var/www

WORKDIR /var/www

COPY . .

RUN npm install

EXPOSE ${APP_PORT:-3000}

CMD [ "npm", "run", "watch" ]
