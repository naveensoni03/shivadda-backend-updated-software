import time

def print_char_by_char(text, delay=0.10):

    for char in text:
       
        print(char, end='', flush=True) 
        time.sleep(delay)
    
    print() 

def play_lyrics():
    lyrics_lines = [
        "*Tere liye Ghar banayun* ",
        "*deewarein neele rang se sajayun*",
        "*pasand hai tumhe maloom hai *",
        "*Tumne bataya thaa ek dafe. *",
        "*Neele phool layun tere kiye *",
        "*khat likhu tere liyeee *",
        "*Me khuda mein manu nahi par mangu duaa tere liyeee........ *",
    ]

    
    
    for line in lyrics_lines:
        print_char_by_char(line, delay=0.1)
        time.sleep(0.21) 

if __name__ == "__main__":
    play_lyrics()