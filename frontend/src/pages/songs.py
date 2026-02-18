import time

def print_char_by_char(text, delay=0.10):

    for char in text:
       
        print(char, end='', flush=True) 
        time.sleep(delay)
    
    print() 

def play_lyrics():
    lyrics_lines = [
        "*Arz kiya hai hamene bhi* ",
        "*likha khuch tere bare me hai*",
        "*Aise tu lage ke Gulaab hai or Aise tu lage ke Gulshan hai*",
        "*Bagon me dil ke khil ke *",
        "*in fizayon me chhahe Ho haye  *",
        "*Or bese ham to tere hi Gulaam hai....*",
    ]

    print("🎵 Song start ho raha hai...\n")
    
    for line in lyrics_lines:
        print_char_by_char(line, delay=0.15)
        time.sleep(0.53) 

if __name__ == "__main__":
    play_lyrics()