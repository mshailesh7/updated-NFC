import board
import busio
from adafruit_pn532.i2c import PN532_I2C
import re

def read_nfc_data(pn532):

    uid = pn532.read_passive_target(timeout=60.0)

    if uid:

        #data = pn532.ntag2xx_read_block(8) 
        data = pn532.ntag2xx_read_block(9) 
        data += pn532.ntag2xx_read_block(10) 
        data += pn532.ntag2xx_read_block(11) 
        data += pn532.ntag2xx_read_block(12) 


        if data:
            try:

                text = data[5:15].decode('utf-8',errors='replace')
                cleantxt=re.sub(r'[^\x20-\x7E]','',text)
                print(cleantxt)
                #print(text)
            except UnicodeDecodeError:
                print("Unable to decode data as UTF-8")
    else:
        print("No NFC tag detected.")

def main():

    i2c = busio.I2C(board.SCL, board.SDA)
    pn532 = PN532_I2C(i2c, address=0x24)

    #print("Waiting for NFC tag...")

    try:
        read_nfc_data(pn532)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()