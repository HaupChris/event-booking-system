#!/bin/bash


# pull the latest changes from git
git pull

# stop the gunicorn service
pkill gunicorn

# activate your virtual environment, replace 'venv' with the name of your virtual environment
source venv/bin/activate

# navigate to the server folder and start the gunicorn service
cd ./server

# start the gunicorn service
gunicorn --bind 0.0.0.0:5000 wsgi:app --access-logfile logs/gunicorn_access.log --error-logfile logs/gunicorn_error.log --log-level info --daemon

# restart the nginx service
sudo systemctl restart nginx

# print the status of nginx service
sudo service nginx status
