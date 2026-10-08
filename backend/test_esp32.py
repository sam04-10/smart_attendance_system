from esp32_controller import esp32


print("Connecting to ESP32...")

if not esp32.connect():
    print("Could not connect to ESP32.")
    exit()


while True:
    print("\n===== ESP32 TEST =====")
    print("1. READY")
    print("2. SUCCESS")
    print("3. FAIL")
    print("4. THANK YOU")
    print("5. EXIT")

    choice = input("Enter your choice: ")

    if choice == "1":
        esp32.ready()

    elif choice == "2":
        esp32.success()

    elif choice == "3":
        esp32.fail()

    elif choice == "4":
        esp32.thank_you()

    elif choice == "5":
        esp32.disconnect()
        print("Test finished.")
        break

    else:
        print("Invalid choice.")