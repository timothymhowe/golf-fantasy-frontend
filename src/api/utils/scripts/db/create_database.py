import mysql.connector
import os
from dotenv import load_dotenv

def create_database():
    load_dotenv()
    
    try:
        # Establish a connection to MySQL using Cloud SQL credentials
        connection = mysql.connector.connect(
            host=os.getenv('CLOUD_SQL_IP'),  # Public IP from Cloud SQL instance
            user=os.getenv('DB_USER'),
            password=os.getenv('DB2_PASS')
        )

        cursor = connection.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS fantasy_golf")
        print("Database 'fantasy_golf' created successfully.")

    except mysql.connector.Error as error:
        print(f"Failed to create database in MySQL: {error}")

    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    create_database()

# import mysql.connector

# def create_database():
#     try:
#         # Establish a connection to MySQL
#         connection = mysql.connector.connect(
#             # TODO: Fix this ish.
#             # host='localhost',  # replace with your server IP
#             # user='root',  # replace with your username
#             # password='*****'  # replace with your password
#         )

#         # Create a cursor object
#         cursor = connection.cursor()

#         # Execute the CREATE DATABASE command
#         cursor.execute("CREATE DATABASE IF NOT EXISTS fantasy_golf")

#         print("Database 'fantasy_golf' created successfully.")

#     except mysql.connector.Error as error:
#         print(f"Failed to create database in MySQL: {error}")

#     finally:
#         if connection.is_connected():
#             cursor.close()
#             connection.close()

# # Call the function to create the database
# create_database()