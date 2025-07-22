"""
日志配置模块
提供完善的日志记录功能，包括文件输出和控制台输出
"""

import logging
import logging.handlers
import os
from pathlib import Path
import sys
from datetime import datetime

# 创建日志目录
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# 日志格式
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def setup_logging(log_level=logging.INFO):
    """
    设置日志配置
    """
    # 创建主日志器
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # 清除现有的处理器
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # 创建格式器
    formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
    
    # 1. 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 2. 文件处理器 - 所有日志
    today = datetime.now().strftime("%Y-%m-%d")
    all_log_file = LOG_DIR / f"sultan_game_{today}.log"
    file_handler = logging.handlers.TimedRotatingFileHandler(
        all_log_file, 
        when='D', 
        interval=1, 
        backupCount=30,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # 3. 错误日志文件处理器
    error_log_file = LOG_DIR / f"error_{today}.log"
    error_handler = logging.handlers.TimedRotatingFileHandler(
        error_log_file,
        when='D',
        interval=1,
        backupCount=30,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    logger.addHandler(error_handler)
    
    # 4. API请求日志处理器
    api_log_file = LOG_DIR / f"api_{today}.log"
    api_handler = logging.handlers.TimedRotatingFileHandler(
        api_log_file,
        when='D',
        interval=1,
        backupCount=30,
        encoding='utf-8'
    )
    api_handler.setLevel(logging.INFO)
    api_handler.setFormatter(formatter)
    
    # 为API日志创建专门的日志器
    api_logger = logging.getLogger("api")
    api_logger.addHandler(api_handler)
    api_logger.setLevel(logging.INFO)
    api_logger.propagate = False  # 不传播到根日志器
    
    return logger

def get_logger(name):
    """
    获取指定名称的日志器
    """
    return logging.getLogger(name)

def log_api_request(method, url, status_code, response_time=None, error=None):
    """
    记录API请求日志
    """
    api_logger = logging.getLogger("api")
    
    if error:
        api_logger.error(f"{method} {url} - {status_code} - ERROR: {error}")
    else:
        time_info = f" - {response_time:.3f}s" if response_time else ""
        api_logger.info(f"{method} {url} - {status_code}{time_info}")

def log_database_operation(operation, table, record_id=None, error=None):
    """
    记录数据库操作日志
    """
    db_logger = logging.getLogger("database")
    
    if error:
        db_logger.error(f"DB {operation} {table} ID:{record_id} - ERROR: {error}")
    else:
        db_logger.info(f"DB {operation} {table} ID:{record_id} - SUCCESS")

# 初始化日志系统
setup_logging()