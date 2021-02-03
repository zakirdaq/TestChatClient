import { MessageModel } from '@app/_models/message';

export class User {
    Id: string;
    UserName: string;
    UserMessages: MessageModel[] = [];
    IsMessageLoaded: boolean = false;
    LastMessageTime: string = '';
    LastMessage: string = '';
    token: string;
}