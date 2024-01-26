import mysql.connector

def create_database():
    try:
        # Establish a connection to MySQL
        connection = mysql.connector.connect(
            host='localhost',  # replace with your server IP
            user='root',  # replace with your username
            password='eldrick'  # replace with your password
        )

        # Create a cursor object
        cursor = connection.cursor()

        # Execute the CREATE DATABASE command
        cursor.execute("CREATE DATABASE IF NOT EXISTS fantasy_golf")

        print("Database 'fantasy_golf' created successfully.")

    except mysql.connector.Error as error:
        print(f"Failed to create database in MySQL: {error}")

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Call the function to create the database
create_database()