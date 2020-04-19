import { Injectable } from '@angular/core';
import * as irc from 'irc-upd';
import { ToastService } from './toast.service';
import { ToastType } from '../models/toast';
import { StoreService } from './store.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Channel, WinCondition, TeamMode } from '../models/irc/channel';
import { Message } from '../models/irc/message';
import { Regex } from '../models/irc/regex';
import { MessageBuilder, MessageType } from '../models/irc/message-builder';
import { MultiplayerLobbiesService } from './multiplayer-lobbies.service';
import { Misc } from '../models/misc';
import { ModBracket } from '../models/osu-mappool/mod-bracket';
import { TournamentService } from './tournaments.service';

@Injectable({
  	providedIn: 'root'
})

export class IrcService {
	irc: typeof irc;
	client: typeof irc.Client;

	/**
	 * Whether or not the user is authenticated to irc
	 */
	isAuthenticated: boolean = false;

	/**
	 * The username of the authenticated user
	 */
	authenticatedUser: string = "none";

	allChannels: Channel[] = [];

	// Variables to tell if we are connecting/disconnecting to irc
	isConnecting$: BehaviorSubject<boolean>;
	isDisconnecting$: BehaviorSubject<boolean>;
	isJoiningChannel$: BehaviorSubject<boolean>;
	messageHasBeenSend$: BehaviorSubject<boolean>;
	private isAuthenticated$: BehaviorSubject<boolean>;

	// Indicates if the multiplayerlobby is being created for "Create a lobby" route
	isCreatingMultiplayerLobby: number = -1;

  	constructor(private toastService: ToastService, private storeService: StoreService, private multiplayerLobbiesService: MultiplayerLobbiesService, private tournamentService: TournamentService) {
		this.irc = require('irc-upd');

		// Create observables for is(Dis)Connecting
		this.isConnecting$ = new BehaviorSubject<boolean>(false);
		this.isDisconnecting$ = new BehaviorSubject<boolean>(false);
		this.isJoiningChannel$ = new BehaviorSubject<boolean>(false);
		this.messageHasBeenSend$ = new BehaviorSubject<boolean>(false);
		this.isAuthenticated$ = new BehaviorSubject<boolean>(false);

		// Connect to irc if the credentials are saved
		const ircCredentials = storeService.get('irc');

		if(ircCredentials != undefined) {
			toastService.addToast('Irc credentials were found, attempting to login to irc.');
			this.connect(ircCredentials.username, ircCredentials.password);
		}

		const connectedChannels = storeService.get('irc.channels');

		if(connectedChannels != undefined && Object.keys(connectedChannels).length > 0) {
			// Loop through all the channels
			for(let channel in connectedChannels) {
				const nChannel = new Channel(connectedChannels[channel].name);
				nChannel.active = connectedChannels[channel].active;
				nChannel.lastActiveChannel = connectedChannels[channel].lastActiveChannel;
				nChannel.isPrivateChannel = connectedChannels[channel].isPrivateChannel;

				// Loop through all the messages
				for(let message in connectedChannels[channel].messageHistory) {
					const thisMessage = connectedChannels[channel].messageHistory[message];
					const messageBuilder: MessageBuilder[] = [];

					// Loop through the message builder
					for(let messageInBuilder in thisMessage.message) {
						const thisMessageInBuilder = thisMessage.message[messageInBuilder];
						messageBuilder.push(new MessageBuilder(thisMessageInBuilder.messageType, thisMessageInBuilder.message, thisMessageInBuilder.linkName));
					}

					nChannel.allMessages.push(new Message(thisMessage.messageId, thisMessage.date, thisMessage.time, thisMessage.author, messageBuilder, false));
				}

				// Add a divider to the channel to show new messages
				nChannel.allMessages.push(new Message(null, 'n/a', 'n/a', 'Today', [new MessageBuilder(MessageType.Message, 'Messages from history')], true));

				this.allChannels.push(nChannel);
			}
		}
	}

	/**
	 * Check if we are connecting
	 */
	getIsConnecting(): Observable<boolean> {
		return this.isConnecting$.asObservable();
	}

	/**
	 * Check if we are disconnecting
	 */
	getIsDisconnecting(): Observable<boolean> {
		return this.isDisconnecting$.asObservable();
	}

	/**
	 * Check if we are joining a channel
	 */
	getIsJoiningChannel(): Observable<boolean> {
		return this.isJoiningChannel$.asObservable();
	}

	/**
	 * Check if there was a message send
	 */
	hasMessageBeenSend(): Observable<boolean> {
		return this.messageHasBeenSend$.asObservable();
	}

	/**
	 * Check if the user is authenticated
	 */
	getIsAuthenticated(): Observable<boolean> {
		return this.isAuthenticated$.asObservable();
	}

	/**
	 * Connect the user to irc
	 * @param username the username to connect with
	 * @param password the password to connect with
	 */
	connect(username: string, password: string) {
		let ircSettings = {
			password: password,
			autoConnect: false,
			autoRejoin: true,
			debug: false,
			showErrors: false
		};

		const allJoinedChannels = this.storeService.get('irc.channels');

		// Check if the user already has joined channels
		if(allJoinedChannels !== undefined) {
			ircSettings['channels'] = [];

			for(let channel in allJoinedChannels) {
				ircSettings['channels'].push(allJoinedChannels[channel].name);
			}
		}

		this.client = new irc.Client('irc.ppy.sh', username, ircSettings);

		this.isConnecting$.next(true);

		/**
		 * Error handlers
		 */
		this.client.addListener('error', error => {
			// Get rid of error, hasn't been fixed by irc-upd devs yet
			if(error.message == "Cannot read property 'trim' of undefined")
				return;

			// Invalid password given
			if(error.command == "err_passwdmismatch") {
				this.isConnecting$.next(false);
				this.toastService.addToast('Invalid password given. Please try again', ToastType.Error);
			}
			// Invalid channel given
			else if(error.command === "err_nosuchchannel") {
				const channelName = error.args[1];

				if(!channelName.startsWith('#')) { }
				else if(!channelName.startsWith('#mp_')) {
					this.toastService.addToast('The channel you are trying to join does not exist.', ToastType.Error);
					this.isJoiningChannel$.next(false);
				}
				else {
					if(this.getChannelByName(channelName) != null) {
						this.getChannelByName(channelName).active = false;
						this.changeActiveChannel(this.getChannelByName(channelName), false);
					}
				}
			}
			// User is not online
			else if(error.command == "err_nosuchnick") {
				this.toastService.addToast(`"${error.args[1]}" is not online.`, ToastType.Error);
			}
			// Unhandled error
			else {
				console.log(error);

				this.toastService.addToast('Unknown error given! Check the console for more information.', ToastType.Error);
			}
		});

		this.client.addListener('netError', (exception) => {
			console.log('@@@@@@@@@@@@@@@');
			console.log('netError found:');
			console.log(exception);
			console.log('@@@@@@@@@@@@@@@');
		});

		this.client.addListener('unhandled', (message) => {
			console.log(`@@@@@@@@@@@@@@@@@@@@@@`);
			console.log(`Unhandled error found:`);
			console.log(message);
			console.log(`@@@@@@@@@@@@@@@@@@@@@@`);
		});

		/**
		 * Message handler
		 */
		this.client.addListener('message', (from: string, to: string, message: string) => {
			this.addMessageToChannel(to, from, message, !to.startsWith('#'));

			// Check if message was send by banchobot
			if(from == "BanchoBot") {
				// =============================================
				// The messages were send in a multiplayer lobby
				if(to.startsWith('#mp_')) {
					const 	multiplayerInitialization = Regex.multiplayerInitialization.run(message),
							multiplayerMatchSize = Regex.multiplayerMatchSize.run(message),
							multiplayerSettingsChange = Regex.multiplayerSettingsChange.run(message),
							matchClosed = Regex.closedMatch.run(message),
							matchFinished = Regex.matchFinished.run(message),
							userJoined = Regex.userJoinedGame.run(message),
							userLeft = Regex.userLeftGame.run(message),
							mpSettingsUsers = Regex.mpSettingsUsers.run(message),
							mpSettings = Regex.mpSettingsRoom.run(message);

					// Initialize the channel with the correct teammode and wincondition
					if(multiplayerInitialization != null) {
						this.getChannelByName(to).teamMode = TeamMode[multiplayerInitialization.teamMode];
						this.getChannelByName(to).winCondition = WinCondition[multiplayerInitialization.winCondition];
					}

					// The team size was changed with "!mp size x"
					if(multiplayerMatchSize) {
						this.getChannelByName(to).players = multiplayerMatchSize.size;
					}

					// The room was changed by "!mp set x x x"
					if(multiplayerSettingsChange) {
						this.getChannelByName(to).players = multiplayerSettingsChange.size;
						this.getChannelByName(to).teamMode = TeamMode[multiplayerSettingsChange.teamMode];
						this.getChannelByName(to).winCondition = WinCondition[multiplayerSettingsChange.winCondition];
					}

					// The match was closed
					if(matchClosed) {
						this.changeActiveChannel(this.getChannelByName(to), false);
						this.getChannelByName(to).active = false;
					}

					// A beatmap has finished
					if(matchFinished) {
						setTimeout(() => {
						this.multiplayerLobbiesService.synchronizeMultiplayerMatch(this.multiplayerLobbiesService.getByIrcLobby(to));
						}, 1000);
					}

					// User has joined the lobby
					if(userJoined) {
						this.multiplayerLobbiesService.getByIrcLobby(to).allUsers.push(userJoined.username);
					}

					// User has left the lobby
					if(userLeft) {
						this.multiplayerLobbiesService.getByIrcLobby(to).allUsers.splice(this.multiplayerLobbiesService.getByIrcLobby(to).allUsers.indexOf(userLeft.username), 1);
					}

					// !mp settings was ran
					if(mpSettings) {
						this.multiplayerLobbiesService.getByIrcLobby(to).allUsers = [];
					}

					// A user is in the lobby
					if(mpSettingsUsers) {
						this.multiplayerLobbiesService.getByIrcLobby(to).allUsers.push(mpSettingsUsers.username);
					}
				}
				// ===========================================
				// The messages were send as a private message
				else {
					const tournamentMatchCreated = Regex.tournamentMatchCreated.run(message);

					// A tournament match was created
					if(tournamentMatchCreated) {
						// Check if the match is created for a specific multiplayer lobby
						if(this.isCreatingMultiplayerLobby != -1) {
							this.multiplayerLobbiesService.get(this.isCreatingMultiplayerLobby).multiplayerLink = `https://osu.ppy.sh/community/matches/${tournamentMatchCreated.multiplayerId}`;
							this.multiplayerLobbiesService.update(this.multiplayerLobbiesService.get(this.isCreatingMultiplayerLobby));

							this.isCreatingMultiplayerLobby = -1;
						}
					}
				}
			}
			else {
				if(to.startsWith('#mp_')) {
					const userPicksMap = Regex.userPickMap.run(message);

					// Check if "!pick" is run in a multiplayer lobby
					if(userPicksMap) {
						const 	multiplayerLobby = this.multiplayerLobbiesService.getByIrcLobby(to),
								misc = new Misc();

						let modBracket: ModBracket = null,
							modBracketString: string[] = [];

						// Check if a captain used the command

						const totalMapsPlayed = multiplayerLobby.teamOneScore + multiplayerLobby.teamTwoScore;
						let allowedToPick = false,
							teamPick: string,
							teamCaptain: string;

						let thisTournament = this.tournamentService.getTournamentByAcronym(multiplayerLobby.tournamentAcronym);
						let captainName = from;
						captainName = captainName.replace(/_/g, ' ');

						// Check the pick order
						if(totalMapsPlayed % 2 == 0) {
							if(this.tournamentService.getTeamFromTournamentByName(thisTournament, multiplayerLobby.firstPick).getPlayersAsArray().indexOf(captainName) > -1) {
								allowedToPick = true;
							}

							console.log(allowedToPick)

							teamPick = multiplayerLobby.firstPick;
							teamCaptain = multiplayerLobby.firstPick == multiplayerLobby.teamOneName ? multiplayerLobby.teamOneCaptain.replace(/ /g, '_') : multiplayerLobby.teamTwoCaptain.replace(/ /g, '_');
						}
						else {
							console.log('second clause');
							if(this.tournamentService.getTeamFromTournamentByName(thisTournament, multiplayerLobby.firstPick == multiplayerLobby.teamOneName ? multiplayerLobby.teamTwoName : multiplayerLobby.teamOneName).getPlayersAsArray().indexOf(captainName) > -1) {
								allowedToPick = true;
							}

							teamPick = multiplayerLobby.firstPick == multiplayerLobby.teamOneName ? multiplayerLobby.teamTwoName : multiplayerLobby.teamOneName;
							teamCaptain = multiplayerLobby.firstPick == multiplayerLobby.teamOneName ? multiplayerLobby.teamTwoCaptain.replace(/ /g, '_') : multiplayerLobby.teamOneCaptain.replace(/ /g, '_');
						}

						// Check if a captain is selected
						if(teamCaptain == "" || !teamCaptain) {
							teamCaptain = "No captain selected";
							this.toastService.addToast(`There is no captain selected for one of the teams. Set a captain for the teams so that they can continue with the picks.`, ToastType.Error, 15);
						}

						// Check if the message came from a captain
						if(captainName == multiplayerLobby.teamOneCaptain || captainName == multiplayerLobby.teamTwoCaptain) {
							// Check if the map has been played
							let totalMapsPicked = 0;

							for(let bracket in multiplayerLobby.picks) {
								totalMapsPicked += multiplayerLobby.picks[bracket].length;
							}

							if(totalMapsPicked > (multiplayerLobby.teamOneScore + multiplayerLobby.teamTwoScore)) {
								this.sendMessage(to, `You haven't finished (or started) playing the selected map yet.`);
							}
							else {
								// Check if the captain is allowed to pick the map
								if(allowedToPick) {
									// Find the appropriate bracket and create a string with all available brackets
									for(let bracket of multiplayerLobby.mappool.modBrackets) {
										if(bracket.bracketName.toLowerCase() == userPicksMap.bracket.toLowerCase()) {
											modBracket = bracket;
										}

										modBracketString.push(bracket.bracketName);
									}

									// The bracket was found
									if(modBracket != null) {
										// Tiebreaker check
										const tiebreakerScore = Math.floor(multiplayerLobby.bestOf / 2)

										// Tiebreaker time
										if(tiebreakerScore == multiplayerLobby.teamOneScore && tiebreakerScore == multiplayerLobby.teamTwoScore) {
											if(modBracket.bracketName.toLowerCase() != "tiebreaker") {
												this.sendMessage(to, `You can no longer pick from the normal brackets, it is tiebreaker time! (!pick tiebreaker)`);
												return;
											}
										}
										else {
											if(modBracket.bracketName.toLowerCase() == "tiebreaker") {
												this.sendMessage(to, `The tiebreaker cannot be picked yet.`);
												return;
											}
										}

										// Prevent teams from picking new maps after the game has been won
										if(multiplayerLobby.teamOneScore >= tiebreakerScore + 1 || multiplayerLobby.teamTwoScore >= tiebreakerScore + 1) {
											this.sendMessage(to, `The game has already been won, you can no longer pick maps.`);
											return;
										}

										const randomMap = misc.staticPickRandomMap(this.multiplayerLobbiesService, multiplayerLobby, modBracket, to);

										// Mappool bracket still has a map available
										if(randomMap != null) {
											this.sendMessage(to, `!mp map ${randomMap.beatmapId} ${randomMap.gamemodeId}`);

											// Reset all mods if the freemod is being enabled
											if(modBracket.mods.includes('freemod')) {
												this.sendMessage(to, '!mp mods none');
											}

											this.sendMessage(to, `${modBracket.mods}`);
										}
										// No maps left
										else {
											this.sendMessage(to, `There are no more maps left in ${modBracket.bracketName}.`);
										}
									}
									// Invalid mappool bracket
									else {
										this.sendMessage(to, `Invalid modbracket given. Available mod brackets: ${modBracketString.join(', ')}.`);
									}
								}
								else {
									this.sendMessage(to, `It is not your turn to pick, ${from}. The next pick is for ${teamPick} (${teamCaptain}).`);
								}
							}
						}
						else {
							this.sendMessage(to, `${from}, you are not a captain of either team.`);
						}
					}
				}
			}
		});

		/**
		 * "/me" handler
		 */
		this.client.addListener('action', (from, to, message) => {
			this.addMessageToChannel(to, from, message);
		});

		/**
		 * Connect the user
		 */
		this.client.connect(0, err => {
			this.isAuthenticated = true;
			this.authenticatedUser = username;

			// Save the credentials
			this.storeService.set('irc.username', username);
			this.storeService.set('irc.password', password);

			this.isConnecting$.next(false);

			this.isAuthenticated$.next(true);

			this.toastService.addToast('Successfully connected to irc!');
		});
	}

	/**
	 * Disconnect the user from irc
	 */
	disconnect() {
		if(this.isAuthenticated) {
			this.client.removeAllListeners();

			this.isDisconnecting$.next(true);

			this.client.disconnect('', () => {
				this.isAuthenticated = false;
				this.authenticatedUser = "none";

				// Delete the credentials
				this.storeService.delete('irc');

				this.isDisconnecting$.next(false);

				this.toastService.addToast('Successfully disconnected from irc.');
			});
		}
	}

	/**
	 * Get the channel by its name
	 * @param channelName the channelname
	 */
	getChannelByName(channelName: string) {
		let channel: Channel = null;
		for(let i in this.allChannels) {
			if(this.allChannels[i].channelName == channelName) {
				channel = this.allChannels[i];
				break;
			}
		}

		return channel;
	}

	/**
	 * Add a message to the given channel. Will not send the message to irc
	 * @param channelName the channel to add the message to
	 * @param author the author of the message
	 * @param message the message itself
	 * @param isPM if the message came from a PM
	 */
	addMessageToChannel(channelName: string, author: string, message: string, isPM: boolean = false) {
		const 	date = new Date(),
				timeFormat = `${(date.getHours() <= 9 ? '0' : '')}${date.getHours()}:${(date.getMinutes() <= 9 ? '0' : '')}${date.getMinutes()}`,
				dateFormat = `${(date.getDate() <= 9 ? '0' : '')}${date.getDate()}/${(date.getMonth() <= 9 ? '0' : '')}${date.getMonth()}/${date.getFullYear()}`;

		let newMessage;

		if(isPM) {
			if(this.getChannelByName(author) == null) {
				this.joinChannel(author);
			}

			newMessage = new Message(Object.keys(this.getChannelByName(author).allMessages).length + 1, dateFormat, timeFormat, author, this.buildMessage(message), false);

			this.getChannelByName(author).allMessages.push(newMessage);
			this.getChannelByName(author).hasUnreadMessages = true;
			this.saveMessageToHistory(author, newMessage);
		}
		else {
			newMessage = new Message(Object.keys(this.getChannelByName(channelName).allMessages).length + 1, dateFormat, timeFormat, author, this.buildMessage(message), false);

			this.getChannelByName(channelName).allMessages.push(newMessage);
			this.getChannelByName(channelName).hasUnreadMessages = true;
			this.saveMessageToHistory(channelName, newMessage);
		}

		this.messageHasBeenSend$.next(true);
	}

	/**
	 * Join a channel
	 * @param channelName the channel to join
	 */
	joinChannel(channelName: string) {
		const allJoinedChannels = this.storeService.get('irc.channels');
		this.isJoiningChannel$.next(true);

		// Check if you have already joined the channel
		if(allJoinedChannels != undefined && allJoinedChannels.hasOwnProperty(channelName)) {
			this.toastService.addToast(`You have already joined the channel "${channelName}".`);
			this.isJoiningChannel$.next(false);
			return;
		}

		if(!channelName.startsWith('#')) {
			const getChannel = this.getChannelByName(channelName);

			if(getChannel == null) {
				this.allChannels.push(new Channel(channelName, true));

				this.storeService.set(`irc.channels.${channelName}`, {
					name: channelName,
					active: true,
					messageHistory: [],
					lastActiveChannel: false,
					isPrivateChannel: true
				});

				this.toastService.addToast(`Opened private message channel with "${channelName}".`);
			}

			this.isJoiningChannel$.next(false);
		}
		else {
			this.client.join(channelName, () => {
				this.storeService.set(`irc.channels.${channelName}`, {
					name: channelName,
					active: true,
					messageHistory: [],
					lastActiveChannel: false,
					isPrivateChannel: false
				});

				this.isJoiningChannel$.next(false);

				this.allChannels.push(new Channel(channelName));

				this.toastService.addToast(`Joined channel "${channelName}".`);
			});
		}
	}

	/**
	 * Part from the given channel
	 * @param channelName the channel to part
	 */
	partChannel(channelName: string) {
		const allJoinedChannels = this.storeService.get('irc.channels');

		if(allJoinedChannels.hasOwnProperty(channelName)) {
			for(let i in this.allChannels) {
				if(this.allChannels[i].channelName == channelName) {
					this.allChannels.splice(parseInt(i), 1);
					break;
				}
			}

			if(channelName.startsWith('#')) {
				this.client.part(channelName);
			}

			delete allJoinedChannels[channelName];

			this.storeService.set('irc.channels', allJoinedChannels);
			this.toastService.addToast(`Successfully parted "${channelName}".`);
		}
	}

	/**
	 * Send a message to the said channel
	 * @param channelName the channel to send the message in
	 * @param message the message to send
	 */
	sendMessage(channelName: string, message: string, isPM: boolean = false) {
		this.addMessageToChannel(channelName, this.authenticatedUser, message, isPM);
		this.client.say(channelName, message);
	}

	/**
	 * Save the rearranged channels
	 * @param channels the rearranged channels
	 */
	rearrangeChannels(channels: Channel[]) {
		let rearrangedChannels = {};

		for(let i in channels) {
			rearrangedChannels[channels[i].channelName] = {
				name: channels[i].channelName,
				active: channels[i].active,
				messageHistory: channels[i].allMessages.filter(m => !m.isADivider),
				lastActiveChannel: channels[i].lastActiveChannel,
				isPrivateChannel: channels[i].isPrivateChannel
			};
		}

		this.storeService.set('irc.channels', rearrangedChannels);
	}

	/**
	 * Change the last active status in the store for the given channel
	 * @param channel the channel to change the status of
	 * @param active the status
	 */
	changeLastActiveChannel(channel: Channel, active: boolean) {
		const storeChannel = this.storeService.get(`irc.channels.${channel.channelName}`);

		storeChannel.lastActiveChannel = active;

		this.storeService.set(`irc.channels.${channel.channelName}`, storeChannel);
	}

	/**
	 * Change the active status in the store for the given channel
	 * @param channel the channel to change the status of
	 * @param active the status
	 */
	changeActiveChannel(channel: Channel, active: boolean) {
		const storeChannel = this.storeService.get(`irc.channels.${channel.channelName}`);

		storeChannel.active = active;

		this.storeService.set(`irc.channels.${channel.channelName}`, storeChannel);
	}

	/**
	 * Save the message in the channel history
	 * @param channelName the channel to save it in
	 * @param message the message object to save
	 */
	saveMessageToHistory(channelName: string, message: Message) {
		if(message.isADivider) return;

		const storeChannel = this.storeService.get(`irc.channels.${channelName}`);
		storeChannel.messageHistory.push(message.convertToJson());
		this.storeService.set(`irc.channels.${channelName}`, storeChannel);
	}

	/**
	 * Build a message with the appropriate hyperlinks
	 * @param message the message to build
	 */
	buildMessage(message: string): MessageBuilder[] {
		let messageBuilder: MessageBuilder[] = [];

		const allRegexes = [
			Regex.isListeningTo,
			Regex.isWatching,
			Regex.isPlaying,
			Regex.isEditing,
			Regex.playerBeatmapChange
		];

		let regexSucceeded = false;

		// Handle all the regexes
		for(let regex in allRegexes) {
			const currentRegex = allRegexes[regex].run(message);

			if(currentRegex != null) {
				messageBuilder.push(new MessageBuilder(MessageType.Message, currentRegex.message));
				messageBuilder.push(new MessageBuilder(MessageType.Link, currentRegex.link, currentRegex.name));

				regexSucceeded = true;
			}
		}

		// Handle messages that do not match any of the regexes
		if(!regexSucceeded) {
			const 	isLinkRegex = Regex.isLink.run(message),
					isEmbedRegex = Regex.isEmbedLink.run(message);

			// Embed link
			if(isEmbedRegex != null) {
				const splittedString = message.split(Regex.isEmbedLink.regexFullEmbed).filter(s => s != "" && s.trim());

				if(splittedString.length == 1) {
					const linkSplit = splittedString[0].split(Regex.isEmbedLink.regexSplit).filter(s => s != "" && s.trim());

					messageBuilder.push(new MessageBuilder(MessageType.Link, linkSplit[0], linkSplit[1]));
				}
				else {
					for(let split in splittedString) {
						// The split is a link
						if(Regex.isEmbedLink.run(splittedString[split])) {
							const linkSplit = splittedString[split].split(Regex.isEmbedLink.regexSplit).filter(s => s != "" && s.trim());

							messageBuilder.push(new MessageBuilder(MessageType.Link, linkSplit[0], linkSplit[1]));
						}
						// The split is a message
						else {
							messageBuilder.push(new MessageBuilder(MessageType.Message, splittedString[split]));
						}
					}
				}
			}
			// Check if there is a link
			else if(isLinkRegex != null) {
				const splittedString = message.split(Regex.isLink.regex).filter(s => s != "" && s.trim());

				if(splittedString.length == 1) {
					messageBuilder.push(new MessageBuilder(MessageType.Link, splittedString[0]));
				}
				else {
					for(let split in splittedString) {
						// The split is a link
						if(Regex.isLink.run(splittedString[split])) {
							messageBuilder.push(new MessageBuilder(MessageType.Link, splittedString[split]));
						}
						// The split is a message
						else {
							messageBuilder.push(new MessageBuilder(MessageType.Message, splittedString[split]));
						}
					}
				}
			}
			else {
				messageBuilder.push(new MessageBuilder(MessageType.Message, message));
			}
		}

		return messageBuilder;
	}
}
