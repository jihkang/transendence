all : build

build :
	mkdir -p db
	docker-compose up -d --build

up :
	mkdir -p db
	docker-compose up

down :
	docker-compose down

db :
	rm -rf db/*

fclean :
	make db
	docker-compose down --rmi all
	docker system prune --volumes --force --all

re :
	make fclean
	make

ps :
	docker-compose ps

clear :
	rm -rf ./db/*

.PHONY : db