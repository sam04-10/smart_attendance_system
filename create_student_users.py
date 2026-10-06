from database import get_db_connection


connection = get_db_connection()


# Get all students
students = connection.execute("""
    SELECT name, email
    FROM students
""").fetchall()


for student in students:

    name = student["name"]

    email = student["email"]


    # Check if account already exists

    existing_user = connection.execute("""
        SELECT *
        FROM users
        WHERE email = ?
    """, (email,)).fetchone()


    if existing_user:

        print(
            f"Account already exists: {email}"
        )

        continue


    # Create student login account

    connection.execute("""
        INSERT INTO users
        (
            name,
            email,
            password,
            role
        )

        VALUES (?, ?, ?, ?)

    """, (
        name,
        email,
        "student123",
        "student"
    ))


    print(
        f"Created account: {email}"
    )


connection.commit()

connection.close()


print()
print("All student accounts processed successfully!")