import serial
import time
import os


# ESP32 settings
ESP32_PORT = os.getenv("ESP32_PORT", "COM4")
ESP32_BAUD = int(os.getenv("ESP32_BAUD", "115200"))


class ESP32Controller:

    def __init__(self):
        self.ser = None

    def connect(self):
        """Connect to ESP32 through USB serial."""
        try:
            self.ser = serial.Serial(
                ESP32_PORT,
                ESP32_BAUD,
                timeout=1
            )

            # ESP32 may restart when serial port opens
            time.sleep(2)

            print(f"ESP32 connected on {ESP32_PORT}")
            return True

        except Exception as e:
            self.ser = None
            print(f"ESP32 disconnected: {e}")
            return False

    def send(self, command):
        """Send command to ESP32."""
        if self.ser is None or not self.ser.is_open:
            print("ESP32 is not connected")
            return False

        try:
            self.ser.write((command + "\n").encode())
            self.ser.flush()

            print(f"ESP32 -> {command}")
            return True

        except Exception as e:
            print(f"ESP32 communication error: {e}")
            return False

    def ready(self):
        return self.send("READY")

    def success(self):
        return self.send("SUCCESS")

    def fail(self):
        return self.send("FAIL")

    def thank_you(self):
        return self.send("THANKYOU")

    def disconnect(self):
        """Close ESP32 connection."""
        if self.ser and self.ser.is_open:
            self.ser.close()

        print("ESP32 disconnected")


# Create ESP32 controller
esp32 = ESP32Controller()