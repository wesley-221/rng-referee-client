import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IrcService } from '../../services/irc.service';
import { Channel } from '../../models/irc/channel';
import { Message } from '../../models/irc/message';
import { ElectronService } from '../../services/electron.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
declare var $: any;

@Component({
	selector: 'app-irc',
	templateUrl: './irc.component.html',
	styleUrls: ['./irc.component.scss']
})
export class IrcComponent implements OnInit {
	@ViewChild('channelName', { static: false}) channelName: ElementRef;
	@ViewChild('chatMessage', { static: false }) chatMessage: ElementRef;

	@ViewChild(VirtualScrollerComponent, { static: true }) private virtualScroller: VirtualScrollerComponent;

	selectedChannel: Channel;
	channels: Channel[];

	chats: Message[] = [];
	viewPortItems: Message[];

	chatLength: number = 0;
	keyPressed: boolean = false;

	isAttemptingToJoin: boolean = false;

	constructor(public electronService: ElectronService, public ircService: IrcService, private changeDetector: ChangeDetectorRef) { 
		this.channels = ircService.allChannels;

		// TODO: Fix the reference to the appropriate channel
		// for(let channel in this.channels) {
		// 	if(this.channels[channel].lastActiveChannel) {
		// 		this.selectedChannel = this.ircService.getChannelByName(this.channels[channel].channelName);
		// 		break;
		// 	}
		// }

		// Initialize the scroll
		this.ircService.hasMessageBeenSend().subscribe(() => {
			if(!this.viewPortItems) {
				return;
			}

			if(this.viewPortItems[this.viewPortItems.length - 1] === this.chats[this.chats.length - 2]) {
				this.virtualScroller.scrollToIndex(this.chats.length - 1, true, 0, 0);
			}
		});
	}

	ngOnInit() { 
		this.ircService.getIsJoiningChannel().subscribe(value => {
			this.isAttemptingToJoin = value;
		});
	}

	/**
	 * Change the channel
	 * @param channel the channel to change to
	 */
	changeChannel(channel: string) {
		if(this.selectedChannel != undefined) {
			this.selectedChannel.lastActiveChannel = false;
			this.ircService.changeLastActiveChannel(this.selectedChannel, false);
		}
		
		this.selectedChannel = this.ircService.getChannelByName(channel);
		
		this.selectedChannel.lastActiveChannel = true;
		this.ircService.changeLastActiveChannel(this.selectedChannel, true);
		
		this.chats = this.selectedChannel.allMessages;

		// Scroll to the bottom
		this.virtualScroller.scrollToIndex(this.chats.length - 1, true, 0, 0);
	}

	/**
	 * Open the modal to join a channel
	 */
	openModal() {
		$('#join-channel').modal('toggle');
	}

	/**
	 * Attempt to join a channel
	 */
	joinChannel() {
		this.ircService.joinChannel(this.channelName.nativeElement.value);
	}

	/**
	 * Part from a channel
	 * @param channelName the channel to part
	 */
	partChannel(channelName: string) {
		this.ircService.partChannel(channelName);

		if(this.selectedChannel != undefined && (this.selectedChannel.channelName == channelName)) {
			this.selectedChannel = undefined;
			this.chats = [];
		}
	}

	/**
	 * Send the entered message to the selected channel
	 */
	sendMessage() {
		this.ircService.sendMessage(this.selectedChannel.channelName, this.chatMessage.nativeElement.value);
		this.chatMessage.nativeElement.value = '';
	}

	/**
	 * Drop a channel to rearrange it
	 * @param event 
	 */
	dropChannel(event: CdkDragDrop<Channel[]>) {
		moveItemInArray(this.channels, event.previousIndex, event.currentIndex);

		this.ircService.rearrangeChannels(this.channels);
	}

	/**
	 * When a key was pressed
	 * @param event 
	 * @param eventName up or down (for key up/down)
	 */
	onKey(event: KeyboardEvent, eventName: string) {
		event.preventDefault();

		// Check if the pressed key was tab
		if(event.key === "Tab") {
			this.changeDetector.detectChanges();
			this.chatMessage.nativeElement.focus();

			// The key is being hold
			if(eventName == "down") {
				if(this.keyPressed == false) {
					// Check if there is a selected channel
					if(this.selectedChannel != undefined) {
						// Check if the object exists
						if(!this.ircService.client.chans.hasOwnProperty(this.selectedChannel.channelName)) return;

						const lastWordOfSentence = this.chatMessage.nativeElement.value.split(" ").pop();
						let matchedUsers = [];

						// Prevent 0 letter autocompletion
						if(lastWordOfSentence.length < 1) return;

						for(let user in this.ircService.client.chans[this.selectedChannel.channelName].users) {
							// Remove irc levels
							const newUser = user.replace(/[\@|\+]/gi, '');

							if(newUser.toLowerCase().startsWith(lastWordOfSentence.toLowerCase())) {
								matchedUsers.push(newUser);
							}
						}

						// Show the matched users
						if(matchedUsers.length > 1) {
							this.ircService.addMessageToChannel(this.selectedChannel.channelName, 'BanchoBot', `Matched users: ${matchedUsers.join(', ')}`);
						}
						// Replace the autocompleted user
						else if(matchedUsers.length == 1) {
							this.chatMessage.nativeElement.value = this.chatMessage.nativeElement.value.replace(lastWordOfSentence, matchedUsers[0]);
						}
					}

					this.keyPressed = true;
				}
			}
			// The key was released
			else {
				this.keyPressed = false;
			}
		}
	}

	/**
	 * Open the link to the users userpage
	 * @param username
	 */
	openUserpage(username: string) {
		this.electronService.openLink(`https://osu.ppy.sh/users/${username}`);
	}
}
