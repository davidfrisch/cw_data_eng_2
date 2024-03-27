from pydub import AudioSegment
import os
import math

class SplitWavAudioMubin():
    def __init__(self, input_file_path, output_folder):
        self.output_folder = output_folder
        self.input_file_path = input_file_path
        self.file_name = os.path.basename(input_file_path)
        self.audio = AudioSegment.from_wav(self.input_file_path)
    
    def get_duration(self):
        return self.audio.duration_seconds
    
    def single_split(self, from_min, to_min, split_filename):
        t1 = from_min * 60 * 1000
        t2 = to_min * 60 * 1000
        split_audio = self.audio[t1:t2]
        split_audio.export(self.output_folder + '/' + split_filename, format="wav")
        
    def multiple_split(self, min_per_split):
        total_mins = math.ceil(self.get_duration() / 60)
        filenames = []
        for index, i in enumerate(range(0, total_mins, min_per_split)):
            split_fn = str(index) + '_' + self.file_name
            self.single_split(i, i+min_per_split, split_fn)
            filenames.append(split_fn)
            print(str(index) + ' Done')
            if i == total_mins - min_per_split:
                print('All splited successfully')
                
        return filenames


def cut_audio(input_file, output_folder, min_per_split):    
  if not os.path.exists(output_folder):
    os.makedirs(output_folder)
  
  split_wav = SplitWavAudioMubin(input_file, output_folder)
  filenames = split_wav.multiple_split(min_per_split)
  return filenames

