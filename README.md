# trivia_application

### Copy the `.env` into the directories
To run the application please make sure you have postgres credentials ready. Take the ```env.sample``` and copy it to the leaderboard_client folder and the server folder. You need an ```.env``` file in both the server and leaderboard_client folder. Change the name to the ```.env``` and put your credential in the file. 

### Install Dependencies
Make sure to intall the dependencies in the server and client folder using ```npm install```. Also make sure you have docker running.

### Start the application
There are indivdual README on how to run each folder. There are 3 directories to run: leaderboard_client, server and client. 
Run ```npm start``` in the server and client folder. Then run ```docker compose up``` in the leaderboard_client folder.

Note: We currently using a fix to connect to the db containers in docker using host.docker.internal. This is windows fix so docker may not work on linux.
