# xy
Project template for [BlackSheep](https://github.com/Neoteroi/BlackSheep)
web framework to start Web APIs.

## Getting started

1. create a Python virtual environment
2. install dependencies
3. run the application

### For Linux and Mac

#### alembic
```bash
# init alembic
alembic init alembic
# config alembic/env.py
from data.dbmodel import metadata
from data.project import Project, UserProject
from data.user import User
target_metadata = metadata
# generate migrations files
alembic revision --autogenerate -m "message"
# apply migrations to database
alembic upgrade head  
# alembic downgrade head  # rollback
# alembic upgrade head --sql
```
#### env and run
```bash
# install poetry
pip install poetry
# install dependencies
poetry install
# run application
python dev.py
```


### 环境变量
AUTH_SECRET_KEY  

APP_ENV='dev'| 'prod'  
APP_PORT  

