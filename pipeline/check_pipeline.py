from constants import DATA_DIR
import os


def check_if_new_data_is_available():
    # read files from the data directory
    files = os.listdir(DATA_DIR+"/add_pipelines")
    print(files)
    
    
if __name__ == "__main__":
    check_if_new_data_is_available()