import { Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { MaterialModule } from '../../modules/material.module';
import { ChatMessage, ChatService } from '../../services/chat.service';
import { MessageService } from '../../services/message.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  imports: [MaterialModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnDestroy{
  chatService = inject(ChatService);
  messageService = inject(MessageService);

  name = '';
  msgToSend = '';
  messages: string[] = []; 
  connected = false;
  greetingsSubs?: Subscription;
  messagesSubs?: Subscription;
  connectSubs?: Subscription;
  msgInputS = viewChild.required<ElementRef>("msgInput");
  nameInputS = viewChild.required<ElementRef>("nameInput");

  connect(){
    this.connectSubs = this.chatService.connect().subscribe(success => {
      if (success) {
        this.connected = true;
        this.messageService.success("Connected");
        this.greetingsSubs = this.chatService.listenGreetings().subscribe(greetingMsg => {
          this.messages = [...this.messages, greetingMsg];
        });
        this.messagesSubs = this.chatService.listenMessages().subscribe((chatMsg:ChatMessage) => {
          this.messages = [...this.messages, chatMsg.name + ': ' + chatMsg.message];
        });
        this.chatService.sendHello(this.name);
        setTimeout(() => this.msgInputS().nativeElement.focus(), 1);
      } else {
        this.messageService.error("Chat server is down");
      }
    });
  }

  disconnect() {
    this.greetingsSubs?.unsubscribe();
    this.messagesSubs?.unsubscribe();
    this.connectSubs?.unsubscribe();
    // this.chatService.disconnect(); - nevolám, lebo ho zavolá connectSubs?.unsubscribe() cez TeardownLogic;
    this.connected = false;
    this.messages = [];
    this.name = ''
    setTimeout(() => this.nameInputS().nativeElement.focus(), 1);
  }

  sendMessage() {
    this.chatService.sendMessage(this.msgToSend);
    this.msgToSend = '';
    setTimeout(() => this.msgInputS().nativeElement.focus(), 1);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
