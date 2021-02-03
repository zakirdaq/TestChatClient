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
    message: MessageModel = new MessageModel();
    currentMessages: MessageModel[] = [];
    searchBy: string = '';

    constructor(private accountService: AccountService, private chatService: ChatService) {
        this.user = this.accountService.userValue;
    }

    ngOnInit(): void {
        this.accountService.getAll()
        .subscribe(users => this.users = users);

        this.chatService.retrieveMappedObject()
        .subscribe( (receivedObj: MessageModel) => { this.addToInbox(receivedObj);}); 
    }

    logout() {
        this.accountService.logout();
    }

    loadMessage(userId): void {
        this.message.RecieverId = userId;
        this.users.forEach((user, n) => {
            if (this.users[n].Id === userId) {
                if(!this.users[n].IsMessageLoaded){
                    this.chatService.getByUserId(userId)
                    .subscribe(chats => {
                        this.users[n].UserMessages = this.currentMessages = chats;
                        this.users[n].IsMessageLoaded = true;
                        if(this.users[n].UserMessages.length > 0){
                            this.users[n].LastMessageTime = this.users[n].UserMessages[this.users[n].UserMessages.length - 1].MessageTime;
                            this.users[n].LastMessage = this.users[n].UserMessages[this.users[n].UserMessages.length - 1].Message;
                        }
                    });                        
                }
                else
                    this.currentMessages = this.users[n].UserMessages;
            }
        })
    }

    send(): void {
        if(this.message) {
            if(this.message.RecieverId.length == 0 || this.message.Message.length == 0){
                window.alert("Please select an user and write a message.");
                return;
            } 
            else {
                this.chatService.broadcastMessage(this.message);
                this.message.Message = '';
            }
        }
    }

    delete(id:string): void {
        this.chatService.delete(id);

        this.currentMessages.forEach( (item, index) => {
            if(item.Id === id) this.currentMessages.splice(index,1);
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
        this.currentMessages.push(newObj);
        this.users.forEach((user, n) => {
            if (this.users[n].Id === obj.RecieverId || this.users[n].Id === obj.SenderId) {
                this.users[n].LastMessageTime = obj.MessageTime;
                this.users[n].LastMessage = obj.Message;
            }
        })
    }    
}