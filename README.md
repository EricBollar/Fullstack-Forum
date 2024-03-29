https://www.fullstackforum.com

A fullstack forum built using industry-standard tools such as Next.js and PostgresQL. Allows users to create accounts, create/edit/delete posts, and up/down vote posts.

See more:
https://www.ericbollar.com

# Setup

Tutorial: https://www.youtube.com/watch?v=I6ypD7qv3Z8&t=45400s&ab_channel=BenAwad

Local Setup:
1. Install PostgresQl App (pgAdmin 4).
	- https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
	- username: postgres, pword: postgres, Port: 5432 (default settings)
2. Create local database
	- Open pgAdmin 4
	- Select Servers (top left), login if needed
	- Right-click databases, create new
	- Name it something recognizable like "fforum"
2. Setup .env file in /server
	- file is git ignored
	- See 12:12:25 in video for more
	- DbUrl = postgresql://postgres:postgres@localhost:PORT_NUMBER/DB_NAME (eg 5432, fforum)
	- RedisUrl = 127.0.0.1:6379 (default redis port is 6379)
	- Port = 4000
	- SessionSecret = whatever_you_want (not sure if this is correct)
	- Cors_Origin = http://localhost:3000
3. Setup .env file in /web
	- file is git ignored
	- NEXT_PUBLIC_API_URL=http://localhost:4000/graphql

Install redis (Mac) and start redis server:
$ brew install redis
$ redis-server

Install packages:
$ cd server
$ npm install
$ cd ../web
$ npm install

Run Server:
$ cd server
$ npm start

Run Web:
$ cd web
$ npm run gen
$ npm run build
$ npm start
