import { Injectable, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { MessageModel } from '../../app/_models/message';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ChatService {

    private  connection: any = new signalR.HubConnectionBuilder()
    .withUrl(`${environment.apiUrl}/chatsocket`)
    .configureLogging(signalR.LogLevel.Information)
    .build();

    private receivedMessageObject: MessageModel = new MessageModel();
    private sharedObj = new Subject<MessageModel>();

    constructor(private http: HttpClient) { 
        this.connection.onclose(async () => {
            await this.start();
        });
        this.connection.on("ReceiveMessage", (id, senderId, recieverId, userinfo, messagetime, message) => { this.mapReceivedMessage(id, senderId, recieverId, userinfo, messagetime, message); });
        this.start();                 
    }

    // Strart the connection
    public async start() {
        try {
            await this.connection.start();
            console.log("connected");
        } 
        catch (err) {
            console.log(err);
            setTimeout(() => this.start(), 5000);
        } 
    }

    private mapReceivedMessage(id: string, senderId: string, recieverId: string, userinfo: string, messagetime: string, message: string): void {
        this.receivedMessageObject.Id = id;
        this.receivedMessageObject.SenderId = senderId;
        this.receivedMessageObject.RecieverId = recieverId;
        this.receivedMessageObject.UserInfo = userinfo;
        this.receivedMessageObject.MessageTime = messagetime;
        this.receivedMessageObject.Message = message;
        this.sharedObj.next(this.receivedMessageObject);
    }

    // Calls the controller method
    public broadcastMessage(msgDto: any) {
        this.http.post(`${environment.apiUrl}/api/UserChat/Create`, msgDto)
        .subscribe(data => console.log(data));
    }

    public retrieveMappedObject(): Observable<MessageModel> {
        return this.sharedObj.asObservable();
    }

    getAll() {
        return this.http.get<MessageModel[]>(`${environment.apiUrl}/api/UserChat/GetAll`);
    }

    getByUserId(userId: string) {
        return this.http.get<MessageModel[]>(`${environment.apiUrl}/api/UserChat/GetByUserId/${userId}`);
    }

    delete(id: string) {
        this.http.delete(`${environment.apiUrl}/api/UserChat/Remove/${id}`)
        .subscribe(data => console.log(data));
    }
}