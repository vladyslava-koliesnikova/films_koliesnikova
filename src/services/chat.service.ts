import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Client, over, Subscription } from 'stompjs';
import { Observable } from 'rxjs';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageService = inject(MessageService);
  url = environment.websocketUrl;
  socket?: WebSocket;
  stompClient?: Client; 
  chatName = '';
  messagesSubs?: Subscription;

  connect(): Observable<boolean> {
    return new Observable(subscriber => {
      this.socket = new WebSocket(this.url);
      this.stompClient = over(this.socket);
      this.stompClient.connect({}, frame => {
        subscriber.next(true);
      }, error => {
        subscriber.next(false);
      });
      return {
        unsubscribe: () => this.disconnect()
      }        
    });
  }

  disconnect() {
    this.messagesSubs?.unsubscribe();
    this.stompClient?.disconnect(()=> {
      this.messageService.info("Disconnected from chat server");
      this.chatName = '';
    });
  }

  sendHello(name: string) {
    this.chatName = name;
    this.stompClient?.send('/app/hello',{}, JSON.stringify({name}));
  }

  sendMessage(message: string) {
    const chatMessage = new ChatMessage(this.chatName, message);
    this.stompClient?.send('/app/message',{}, JSON.stringify(chatMessage));
  }

  listenGreetings(): Observable<string> {
    return new Observable(subscriber => {
      const greetingsSubs = this.stompClient?.subscribe('/topic/greetings', packet => {
        subscriber.next(JSON.parse(packet.body).content);
      });
      return {
        unsubscribe: () => greetingsSubs?.unsubscribe()
      }
    });
  }
  listenMessages(): Observable<ChatMessage> {
    return new Observable(subscriber => {
      this.messagesSubs = this.stompClient?.subscribe('/topic/messages', packet => {
        const chatMessage = JSON.parse(packet.body) as ChatMessage;
        subscriber.next(chatMessage);
      });
    });
  }
}

export class ChatMessage {
  constructor(
    public name: string,
    public message: string
  ){}
}
