import pika, sys, os
from pipeline import pipeline
from multiprocessing import Process
from functools import partial


def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', '5672'))
    channel = connection.channel()

    channel.queue_declare(queue='hello')
    
    def callback(conn, ch, method, properties, body):
        decoded_body = body.decode()
        runProcess = Process(target=pipeline,args=(decoded_body,))
        runProcess.start()
        runProcess.join()
    
          
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(" [x] Done")
         

    channel.basic_consume(queue='hello',
                      on_message_callback=partial(callback, connection))
    
    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming() 
  
if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)