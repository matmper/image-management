include .env

CONTAINER=image-management

build:
	docker-compose build --no-cache
	make up
	make npm-install

up: down
	docker-compose up --no-build -d

down:
	docker-compose down

tty:
	docker exec -it $(CONTAINER) bash

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# Commands
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

npm-install:
	docker exec $(CONTAINER) npm install

npm-update:
	docker exec $(CONTAINER) npm update

npm-test:
	docker exec $(CONTAINER) npm run test

npm-lint:
	docker exec $(CONTAINER) npm run lint

check: npm-test npm-lint
