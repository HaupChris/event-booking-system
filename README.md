# Refreshing the project in production system
## Automatically
Make sure update_project.sh is executable, if not then run the following command
```
chmod +x update_project.sh
```
Then run the following command
```
bash update_project.sh
```
Then checke the website.

## Manually

1. cd to the project folder
2. git pull
3. stop the guniconr service
```
ps aux | grep gunicorn
kill -9 <pid>
```
4. activate venv and then start the gunicorn service
```
cd project_folder/server
```
```
gunicorn --bind 0.0.0.0:5000 wsgi:app --daemon
```
5. check the service status
``` 
ps aux | grep gunicorn
```
6. restart the nginx service
```
sudo systemctl restart nginx
```
7. check the nginx service status
```
sudo service nginx status
```
8. check the website
