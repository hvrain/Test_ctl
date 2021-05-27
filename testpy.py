import sys
import json

def getName(name):
    print(json.dumps(name))

if __name__ == '__main__': 
    result = json.loads(sys.argv[1])
    getName(result)