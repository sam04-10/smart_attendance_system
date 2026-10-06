from database import get_db_connection


connection = get_db_connection()


# Create Admin
connection.execute("""
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
""", (
    "Faculty Admin",
    "admin@gmail.com",
    "admin123",
    "admin"
))


# Create Student
connection.execute("""
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
""", (
    "Samruddhi Hatankar",
    "student@gmail.com",
    "student123",
    "student"
))


connection.commit()
connection.close()

print("Test users created successfully!")