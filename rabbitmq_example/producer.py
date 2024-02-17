import pika
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', '5672'))
channel = connection.channel()
channel.queue_declare(queue='hello')
channel.basic_publish(exchange='',
                      routing_key='hello',
                      body='/mnt/data/cw_data_eng_2/data/0638.wav') 
print(" [x] Sent 'Hello World!'")
channel.close()