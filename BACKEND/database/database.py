from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 数据库连接信息（用户名:密码@主机:端口/数据库名）
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:Lzy%4020030811@localhost:3306/teadata"

engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
