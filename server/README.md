Install all dependencies using 
### `npm install`

To start the server run
### `node index.js`

or 

### `npm start`

### Database Setup

1. Download and install postgres from [here](https://www.postgresql.org/download/).
2. Make a copy of the [.env.sample](../.env.sample) and rename it to ```.env```.
3. Edit the variables in your ```.env``` file to match your postgres installation configuration.
4. Place the ```.env``` in the server directory.

in the server directory run
### `npm run seed`

to intially seed the leaderboard database
