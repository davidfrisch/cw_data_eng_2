


def tuple_to_string(start_end_tuple, ndigits=1):
    return str((round(start_end_tuple[0], ndigits), round(start_end_tuple[1], ndigits)))


def format_as_transcription(raw_segments):
    return "\n\n".join(
        [
            chunk["speaker"] + " " + tuple_to_string(chunk["timestamp"]) + chunk["text"]
            for chunk in raw_segments
        ]
    )


speakers = {}
for item in outputs:
    speaker_id = item['speaker']
    if speaker_id not in speakers:
        speakers[speaker_id] = {'timestamp': [], 'text': []}

    speakers[speaker_id]['timestamp'].append(item['timestamp'])
    speakers[speaker_id]['text'].append(item['text'])



