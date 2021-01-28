import { Component } from '@angular/core';

import { User } from '@app/_models';
import { MessageModel } from '@app/_models/message';
import { AccountService } from '@app/_services';
import { ChatService } from '@app/_services/chat.service';

@Component({ templateUrl: 'home.component.html',
styleUrls: ["./home.component.scss"] })
export class HomeComponent {

    user: User;
    users: User[];
    msgDto: MessageModel = new MessageModel();
    msgInboxArray: MessageModel[] = [];

    constructor(private accountService: AccountService, private chatService: ChatService) {
        this.user = this.accountService.userValue;
    }

    ngOnInit(): void {
        this.accountService.getAll()
        .subscribe(users => this.users = users);

        this.chatService.getByUserId(this.user.Id)
        .subscribe(chats => this.msgInboxArray = chats);

        this.chatService.retrieveMappedObject()
        .subscribe( (receivedObj: MessageModel) => { this.addToInbox(receivedObj);}); 
    }

    send(): void {
        if(this.msgDto) {
            if(this.msgDto.RecieverId.length == 0 || this.msgDto.Message.length == 0){
                window.alert("Both fields are required.");
                return;
            } 
            else {
                this.chatService.broadcastMessage(this.msgDto);
                this.msgDto.Message = '';
            }
        }
    }

    delete(id:string): void {
        this.chatService.delete(id);

        this.msgInboxArray.forEach( (item, index) => {
            if(item.Id === id) this.msgInboxArray.splice(index,1);
        });
    }

    addToInbox(obj: MessageModel) {
        let newObj = new MessageModel();
        newObj.UserInfo = obj.UserInfo;
        newObj.Id = obj.Id;
        newObj.SenderId = obj.SenderId;
        newObj.RecieverId = obj.RecieverId;
        newObj.MessageTime = obj.MessageTime;
        newObj.Message = obj.Message;
        this.msgInboxArray.push(newObj);
    }    
}