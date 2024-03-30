FROM node

EXPOSE 42421

COPY app /app
WORKDIR /app

RUN npm i
RUN npm run build
ENTRYPOINT npx serve -l 42421 -s build
# ENTRYPOINT PORT=42421 npm start